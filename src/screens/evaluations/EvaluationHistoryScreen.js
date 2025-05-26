import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {useRoute, useNavigation} from '@react-navigation/native';
import {API_URL} from '../../api/config';
import {Picker} from '@react-native-picker/picker';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Navbar from '../navigation/Navbar';

const screenWidth = Dimensions.get('window').width;

const getLevelColor = (level) => {
  switch ((level || '').toLowerCase()) {
    case 'amarillo':
      return '#FFC107';
    case 'azul':
      return '#2196F3';
    case 'rojo':
      return '#E53935';
    default:
      return '#666';
  }
};

const EvaluationHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {studentInfo} = route.params;

  const [filter, setFilter] = useState('week');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [levelFilter, setLevelFilter] = useState(studentInfo?.lupeLevel || 'Amarillo');
  const [chartData, setChartData] = useState(null);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);

  // Comentario e imagen generales del historial
const [comentariosGuardados, setComentariosGuardados] = useState('');
const [comentariosGenerales, setComentariosGenerales] = useState('');
  const [imagenHistorialUrl, setImagenHistorialUrl] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!studentInfo?.id) return;

    const fetchEvaluationHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/evaluations/history/${studentInfo.id}?range=${filter}&year=${yearFilter}&level=${levelFilter}`,
        );
        if (!response.ok) throw new Error('No se pudo obtener el historial');
        const data = await response.json();

        if (data.length === 0) {
          setChartData(null);
          setAverage(0);
          return;
        }

        const fechas = [];
        const promedios = [];

        data.forEach(ev => {
          let fecha = '—';
          if (ev.createdAt) {
            let dateObj;
            if (typeof ev.createdAt === 'string') {
              dateObj = new Date(ev.createdAt);
            } else if (ev.createdAt.seconds) {
              dateObj = new Date(ev.createdAt.seconds * 1000);
            }
            if (dateObj && !isNaN(dateObj)) {
              fecha = dateObj.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
              });
            }
          }
          fechas.push(fecha);
          promedios.push(parseFloat(ev.averageScore || '0'));
        });

        const avg =
          promedios.length > 0
            ? (
                promedios.reduce((acc, val) => acc + val, 0) / promedios.length
              ).toFixed(2)
            : 0;

        setAverage(avg);
        setChartData({fechas, promedios});
      } catch (err) {
        console.error(err);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationHistory();
  }, [filter, yearFilter, levelFilter, studentInfo.id]);

  // Cargar comentarios e imagen general al cargar pantalla
  useEffect(() => {
    if (!studentInfo?.id) return;

    const fetchExtras = async () => {
      try {
        const res = await fetch(`${API_URL}/api/evaluations/historial/${studentInfo.id}`);
        if (!res.ok) throw new Error('No se pudo cargar historial general');
        const data = await res.json();
        const comentario = data.comentarios || '';
      setComentariosGuardados(comentario);
      setComentariosGenerales(''); // <-- campo editable vacío
      setImagenHistorialUrl(data.imagenUrl || '');
    } catch (err) {
      console.error(err);
    }
  };

  fetchExtras();
}, [studentInfo.id]);

  // Guardar comentario general en backend
  const handleSaveComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/evaluations/historial/${studentInfo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentarios: comentariosGenerales }),
      });
      if (!response.ok) throw new Error('No se pudo guardar el comentario');
      Alert.alert('Comentarios', 'Comentarios guardados correctamente.');
      setComentariosGenerales('');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los comentarios');
    }
  };

  // Selección de imagen
  const selectImageFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección de imagen');
      } else if (response.errorCode) {
        console.log('Error al seleccionar imagen: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.errorCode) {
        console.log('Error de cámara: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo acceder a la cámara');
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const showImageOptions = () => {
    Alert.alert(
      'Subir imagen de clase',
      '¿Cómo quieres subir la imagen?',
      [
        { text: 'Seleccionar de la galería', onPress: selectImageFromGallery },
        { text: 'Tomar una foto', onPress: takePhoto },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Subir imagen general del historial y guardar URL en backend
  const handleSaveImage = async () => {
    if (!imageUri) {
      Alert.alert('Seleccione una imagen primero');
      return;
    }
    setImageUploading(true);
    try {
      const filename = `historial_general/${studentInfo.id}_${Date.now()}.jpg`;
      const reference = storage().ref(filename);
      await reference.putFile(imageUri);
      const url = await reference.getDownloadURL();

      const response = await fetch(`${API_URL}/api/evaluations/historial/${studentInfo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagenUrl: url }),
      });

       if (!response.ok) throw new Error('No se pudo guardar la imagen');

    setImageUri(null);
    Alert.alert('Éxito', 'Imagen subida correctamente');

    // 🔁 Recargar datos desde el backend para actualizar la imagen
    const res = await fetch(`${API_URL}/api/evaluations/historial/${studentInfo.id}`);
    const data = await res.json();
    setImagenHistorialUrl(data.imagenUrl || '');

  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'No se pudo subir la imagen');
  } finally {
    setImageUploading(false);
  }
};

 return (
  <View style={{ flex: 1 }}>
    <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.container}>
        {/* Header del estudiante */}
        <View style={styles.studentHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{studentInfo?.name || 'Estudiante'}</Text>
            <Text style={[styles.studentLevel, { color: getLevelColor(studentInfo?.lupeLevel) }]}>
              Nivel: {studentInfo?.lupeLevel || '—'}
            </Text>
          </View>
          <View style={styles.averageBadge}>
            <Text style={styles.averageValue}>{average}</Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'week' && styles.activeButton]}
            onPress={() => setFilter('week')}>
            <Text style={[styles.filterText, filter === 'week' && styles.activeText]}>Esta semana</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'month' && styles.activeButton]}
            onPress={() => setFilter('month')}>
            <Text style={[styles.filterText, filter === 'month' && styles.activeText]}>Este mes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'year' && styles.activeButton]}
            onPress={() => setFilter('year')}>
            <Text style={[styles.filterText, filter === 'year' && styles.activeText]}>Este año</Text>
          </TouchableOpacity>
        </View>

        {/* Año */}
        {filter === 'year' && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Año:</Text>
            <View style={styles.yearButtonsContainer}>
              {[2025].map(year => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearButton, yearFilter === year && styles.activeButton]}
                  onPress={() => setYearFilter(year)}>
                  <Text style={[styles.filterText, yearFilter === year && styles.activeText]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Nivel */}
        <View style={styles.levelFilterContainer}>
          <Text style={styles.filterLabel}>Seleccione nivel:</Text>
          <Picker
            selectedValue={levelFilter}
            style={styles.picker}
            onValueChange={itemValue => setLevelFilter(itemValue)}>
            <Picker.Item label="Amarillo" value="Amarillo" />
            <Picker.Item label="Azul" value="Azul" />
            <Picker.Item label="Rojo" value="Rojo" />
          </Picker>
        </View>

        {/* Datos generales */}
        <Text style={styles.subheaderText}>
          Este {filter === 'week' ? 'semana' : filter === 'month' ? 'mes' : 'año'} ha asistido a{' '}
          {chartData?.fechas?.length || 0} clases
        </Text>
        <Text style={styles.sectionTitle}>
          Historial del progreso {filter === 'week' ? 'esta semana' : filter === 'month' ? 'este mes' : 'este año'}
        </Text>

        {/* Gráfica */}
        {loading ? (
          <ActivityIndicator size="large" color="#40CDE0" style={{ marginTop: 20 }} />
        ) : chartData && chartData.fechas.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: chartData.fechas,
                datasets: [{ data: chartData.promedios }],
              }}
              width={screenWidth - 40}
              height={280}
              yAxisLabel=""
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(64, 205, 224, ${opacity})`,
                labelColor: () => '#000',
                barPercentage: 0.6,
              }}
              fromZero
              showValuesOnTopOfBars
              verticalLabelRotation={0}
            />
          </View>
        ) : (
          <Text style={styles.noData}>No hay evaluaciones recientes.</Text>
        )}

        {/* Comentario general e imagen del historial */}
        <View style={styles.actionContainer}>
          <Text style={styles.actionTitle}>Comentario general del historial:</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Escribe una observación general sobre el desempeño del estudiante"
            value={comentariosGenerales}
            onChangeText={setComentariosGenerales}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveComments}>
            <Text style={styles.buttonText}>Guardar comentario</Text>
          </TouchableOpacity>

          <Text style={styles.actionTitle}>Imagen general del historial:</Text>

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: 150, marginBottom: 10, borderRadius: 8 }}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={showImageOptions} disabled={imageUploading}>
            <Text style={styles.buttonText}>{imageUploading ? 'Subiendo...' : 'Seleccionar imagen'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#28a745' }]}
            onPress={handleSaveImage}
            disabled={imageUploading}
          >
            <Text style={styles.buttonText}>{imageUploading ? 'Subiendo...' : 'Subir imagen'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    {/* Navbar fijo */}
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => navigation.navigate('UserProfileScreen', { userType: 'teacher' })}
      />
    </View>
  </View>
);
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  studentLevel: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  averageBadge: {
    backgroundColor: '#FF6F61',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  averageValue: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeButton: {
    backgroundColor: '#40CDE0',
  },
  filterText: {
    fontSize: 16,
    color: '#555',
  },
  filterLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginRight: 10,
  },
  yearButtonsContainer: {
    flexDirection: 'row',
    marginTop: 1,
    justifyContent: 'space-around',
  },
  yearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  levelFilterContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 20,
    width: '100%',
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subheaderText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    elevation: 2,
  },
  noData: {
    marginTop: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  actionContainer: {
    marginTop: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#40CDE0',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EvaluationHistoryScreen;
