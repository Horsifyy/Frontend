import React, { useEffect, useState, useCallback  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';
import Navbar from '../navigation/Navbar';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const screenWidth = Dimensions.get('window').width;

const levelColors = {
  Amarillo: '#FFC107',
  Azul: '#2196F3',
  Rojo: '#F44336',
};

const ProgressReportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const studentInfo = route.params?.studentData;

  const [filter, setFilter] = useState('month');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [levelFilter, setLevelFilter] = useState(studentInfo?.lupeLevel || 'Amarillo');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [average, setAverage] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [lastComment, setLastComment] = useState('');
  const [lastImage, setLastImage] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [generalImage, setGeneralImage] = useState('');

  const loadStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      const idToken = await currentUser.getIdToken(true);

      // Última evaluación con extras
      const lastRes = await fetch(`${API_URL}/api/evaluations/lastWithExtras/${currentUser.uid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const lastData = await lastRes.json();
      const ratings = lastData.lastEvaluation?.ratings || {};

      setAverage(parseFloat(lastData.lastEvaluation?.averageScore || 0));
      setLastComment(lastData.lastEvaluation?.comments || '');
      setLastImage(lastData.lastEvaluation?.imageUrl || '');
      setGeneralComment(lastData.historialExtras?.comentarios || '');
      setGeneralImage(lastData.historialExtras?.imagenUrl || '');

      // Historial completo
      const histRes = await fetch(
        `${API_URL}/api/evaluations/history/${currentUser.uid}?range=${filter}&year=${yearFilter}&level=${levelFilter}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const histData = await histRes.json();

      setEvaluations(histData);

      const fechas = [];
      const promedios = [];

      histData.forEach(ev => {
        let fecha = '—';
        if (ev.createdAt) {
          const dateObj = typeof ev.createdAt === 'string'
            ? new Date(ev.createdAt)
            : new Date(ev.createdAt.seconds * 1000);
          if (!isNaN(dateObj)) {
            fecha = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
          }
        }
        fechas.push(fecha);
        promedios.push(parseFloat(ev.averageScore || '0'));
      });

      setChartData({ fechas, promedios });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
}, [filter, yearFilter, levelFilter]);

useEffect(() => {
  loadStudentData();
}, [loadStudentData]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.studentHeader}>
  <View style={styles.profileWrapper}>
    {studentInfo?.profilePicture ? (
      <Image source={{ uri: studentInfo.profilePicture }} style={styles.profileImage} />
    ) : (
      <View style={styles.iconPlaceholder}>
        <MaterialIcons name="person" size={40} color="#888" />
      </View>
    )}
  </View>
  <View style={{ flex: 1 }}>
    <Text style={styles.studentName}>{studentInfo?.name || 'Estudiante'}</Text>
    <Text style={[styles.studentLevel, { color: levelColors[studentInfo?.lupeLevel] || '#999' }]}>
      Nivel: {studentInfo?.lupeLevel || 'Desconocido'}
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

          {filter === 'year' && (
            <View style={styles.yearContainer}>
              <Text style={styles.filterText}>Año:</Text>
              <Picker
                selectedValue={yearFilter}
                style={styles.picker}
                onValueChange={itemValue => setYearFilter(itemValue)}>
                <Picker.Item label="2025" value={2025} />
              </Picker>
            </View>
          )}

          <View style={styles.levelPickerContainer}>
            <Text style={styles.filterText}>Nivel:</Text>
            <Picker
              selectedValue={levelFilter}
              style={styles.picker}
              onValueChange={itemValue => setLevelFilter(itemValue)}>
              <Picker.Item label="Amarillo" value="Amarillo" />
              <Picker.Item label="Azul" value="Azul" />
              <Picker.Item label="Rojo" value="Rojo" />
            </Picker>
          </View>

          {/* Gráfica general */}
          <Text style={styles.sectionTitle}>Historial del progreso</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#40CDE0" />
          ) : chartData && chartData.fechas.length > 0 ? (
            <BarChart
              data={{
                labels: chartData.fechas,
                datasets: [{ data: chartData.promedios }],
              }}
              width={screenWidth - 40}
              height={280}
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(64, 205, 224, ${opacity})`,
                labelColor: () => '#000',
                barPercentage: 0.6,
              }}
              style={{ marginBottom: 20 }}
              fromZero
              showValuesOnTopOfBars
              verticalLabelRotation={30}
            />
          ) : (
            <Text style={styles.noData}>No hay evaluaciones en este rango.</Text>
          )}

          {/* Imagen y comentarios */}
          {lastImage ? (
            <Image source={{ uri: lastImage }} style={styles.image} resizeMode="contain" />
          ) : null}

          <Text style={styles.commentTitle}>Comentario última clase:</Text>
          <Text style={styles.commentText}>{lastComment || 'No hay comentarios.'}</Text>

          {generalImage ? (
            <Image source={{ uri: generalImage }} style={styles.image} resizeMode="contain" />
          ) : null}

          <Text style={styles.commentTitle}>Comentario general:</Text>
          <Text style={styles.commentText}>{generalComment || 'No hay comentarios generales.'}</Text>
        </View>
      </ScrollView>

      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('UserProfileScreen', { userType: 'student' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: { backgroundColor: '#F5F5F5' },
  container: { padding: 20 },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  studentLevel: { fontSize: 16, fontWeight: 'bold', color: '#999' },
  averageBadge: {
    backgroundColor: '#FF6F61',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  averageValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeButton: { backgroundColor: '#40CDE0' },
  filterText: { fontSize: 16, color: '#555' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 15,
  },
  noData: { textAlign: 'center', marginTop: 30, color: '#999', fontSize: 16 },
  image: {
    width: '100%',
  height: 100,
  borderRadius: 8,
  marginBottom: 5,
  },
  commentTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  commentText: { fontSize: 14, color: '#333', marginBottom: 10 },
  yearContainer: { marginBottom: 10, paddingHorizontal: 10 },
  levelPickerContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  picker: { width: '100%', height: 50 },
  profileWrapper: {
  width: 50,
  height: 50,
  borderRadius: 25,
  overflow: 'hidden',
  marginRight: 10,
},
profileImage: {
  width: '100%',
  height: '100%',
  borderRadius: 25,
},
iconPlaceholder: {
  width: '100%',
  height: '100%',
  borderRadius: 25,
  backgroundColor: '#ddd',
  alignItems: 'center',
  justifyContent: 'center',
},

});

export default ProgressReportScreen;
