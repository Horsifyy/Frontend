import React, { useEffect, useState } from 'react';
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
import { BarChart } from 'react-native-chart-kit';
import { useRoute, useNavigation } from '@react-navigation/native';
import { API_URL } from '../../api/config';
import { Picker } from '@react-native-picker/picker';
import Navbar from '../navigation/Navbar';

const screenWidth = Dimensions.get('window').width;

const EvaluationHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentInfo } = route.params;  // Aquí obtenemos la información del estudiante de los parámetros
  const [filter, setFilter] = useState('week');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [levelFilter, setLevelFilter] = useState('Amarillo');
  const [chartData, setChartData] = useState(null);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [image, setImage] = useState(null);

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
          setChartData(null); // No hay datos para ese nivel
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
        setChartData({ fechas, promedios });
      } catch (err) {
        console.error(err);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationHistory();
  }, [filter, yearFilter, levelFilter, studentInfo.id]);

  const handleSaveComments = () => {
    // Aquí podrías guardar o procesar los comentarios
    console.log('Comentarios guardados: ', comments);
    Alert.alert('Comentarios', 'Comentarios guardados correctamente.');
  };

  const handleSaveImage = () => {
    // Aquí podrías implementar la lógica para subir la imagen
    console.log('Imagen subida: ', image);
    Alert.alert('Imagen', 'Imagen de la clase subida correctamente.');
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.studentHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>
              {studentInfo?.name || 'Estudiante'}
            </Text>
            <Text style={styles.studentLevel}>
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
            <Text style={[styles.filterText, filter === 'week' && styles.activeText]}>
              Esta semana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'month' && styles.activeButton]}
            onPress={() => setFilter('month')}>
            <Text style={[styles.filterText, filter === 'month' && styles.activeText]}>
              Este mes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'year' && styles.activeButton]}
            onPress={() => setFilter('year')}>
            <Text style={[styles.filterText, filter === 'year' && styles.activeText]}>
              Este año
            </Text>
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
                  <Text style={[styles.filterText, yearFilter === year && styles.activeText]}>
                    {year}
                  </Text>
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

        <Text style={styles.subheaderText}>
          Este{' '}
          {filter === 'week' ? 'semana' : filter === 'month' ? 'mes' : 'año'} ha
          asistido a {chartData?.fechas?.length || 0} clases
        </Text>
        <Text style={styles.sectionTitle}>
          Historial del progreso{' '}
          {filter === 'week'
            ? 'esta semana'
            : filter === 'month'
            ? 'este mes'
            : 'este año'}
        </Text>

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

        {/* Comentarios y Subir Imagen */}
        <View style={styles.actionContainer}>
          <Text style={styles.actionTitle}>
            Editar comentarios y recomendaciones específicas:
          </Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Añade comentarios generales"
            value={comments}
            onChangeText={setComments}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveComments}>
            <Text style={styles.buttonText}>Guardar Comentarios</Text>
          </TouchableOpacity>

          <Text style={styles.actionTitle}>Subir imagen de la clase:</Text>
          {/* Aquí iría el componente para seleccionar imágenes */}
          <TouchableOpacity style={styles.button} onPress={handleSaveImage}>
            <Text style={styles.buttonText}>Subir Imagen</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('StudentProfile')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#fff', // Fondo blanco
    padding: 12,
    borderRadius: 10,
    elevation: 5, // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  chartOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    zIndex: -1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartZone: {
    position: 'absolute',
    left: 0,
    right: 0,
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
