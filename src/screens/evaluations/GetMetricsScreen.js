import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {API_URL} from '../../api/config';

const GetMetrics = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {student} = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState(null);

  // Datos por defecto y configuración de la visualización
  const progressZones = [
    {name: 'Sobresaliente', color: '#b5efe4', dotColor: '#21c5c5'},
    {name: 'Logrado', color: '#c6efb5', dotColor: '#60c938'},
    {name: 'En Proceso', color: '#efe9b5', dotColor: '#eada5d'},
    {name: 'Principiante', color: '#fae8c8', dotColor: '#f5a742'},
    {name: 'No hay progreso', color: '#e9e9e9', dotColor: '#d1d1d1'},
  ];

  const fetchStudentMetrics = async () => {
    try {
      setLoading(true);

      // Llamada a la API para obtener las métricas del estudiante
      const response = await fetch(`${API_URL}/students/${student.id}/metrics`);

      if (!response.ok) {
        throw new Error(`Error al obtener métricas: ${response.status}`);
      }

      const data = await response.json();
      console.log('Datos recibidos de métricas:', JSON.stringify(data));

      // Transformar los datos recibidos al formato requerido por el componente
      setMetricsData({
        studentName: student.name || 'Estudiante',
        level: student.lupeLevel || 'No asignado',
        time: data.averageScore || '0.00',
        progressData: formatProgressData(data.metrics),
      });
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      setError(error.message);
      setMetricsData({
        studentName: student?.name || 'Alumno',
        level: student?.lupeLevel || 'No asignado',
        time: '0.00',
        progressData: [
          {id: 1, name: 'Control del caballo', score: 0, color: '#4db6ce'},
          {id: 2, name: 'Postura', score: 0, color: '#4db6ce'},
          {id: 3, name: 'Movimientos corporales', score: 0, color: '#4db6ce'},
          {
            id: 4,
            name: 'Control de la respiración',
            score: 0,
            color: '#4db6ce',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear los datos recibidos del backend
  const formatProgressData = (metrics = []) => {
    if (!metrics || metrics.length === 0) {
      return [
        {id: 1, name: 'Control del caballo', score: 0, color: '#4db6ce'},
        {id: 2, name: 'Postura', score: 0, color: '#4db6ce'},
        {id: 3, name: 'Movimientos corporales', score: 0, color: '#4db6ce'},
        {id: 4, name: 'Control de la respiración', score: 0, color: '#4db6ce'},
      ];
    }

    // Mapear los datos del backend a nuestro formato
    return metrics.map((metric, index) => ({
      id: index + 1,
      name: metric.name,
      score: parseFloat(metric.value) || 0,
      color: '#4db6ce',
    }));
  };

  // Manejar navegación a evaluaciones previas
  const handleViewPreviousEvaluations = () => {
    navigation.navigate('PreviousEvaluations', {
      studentId: student?.id,
      studentName: student?.name,
    });
  };

  // Manejar navegación a imagen de clase
  const handleViewClassImage = () => {
    navigation.navigate('ClassImage', {
      studentId: student?.id,
      studentName: student?.name,
    });
  };

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d8a9e" />
        <Text style={styles.loadingText}>Cargando métricas...</Text>
      </SafeAreaView>
    );
  }

  // Mostrar pantalla de error si es necesario
  if (error && !metricsData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Error al cargar datos</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchStudentMetrics()}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Si tenemos datos, mostrar la pantalla normal
  const {studentName, level, time, progressData} = metricsData;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Cabecera con información del estudiante */}
      <View style={styles.header}>
        <View style={styles.studentInfoContainer}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.levelLabel}>Nivel: {level}</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>

      {/* Leyenda de progreso */}
      <View style={styles.legendContainer}>
        {progressZones.map(zone => (
          <View key={zone.name} style={styles.legendItem}>
            <View
              style={[styles.legendDot, {backgroundColor: zone.dotColor}]}
            />
            <Text style={styles.legendText}>{zone.name}</Text>
          </View>
        ))}
      </View>

      {/* Gráfico de progreso */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Visualización del progreso</Text>

        <View style={styles.chartWrapper}>
          {/* Fondo del gráfico con zonas de color */}
          <View style={styles.chartBackground}>
            {progressZones.map((zone, index) => (
              <View
                key={index}
                style={[
                  styles.chartZone,
                  {
                    backgroundColor: zone.color,
                    height: `${100 / progressZones.length}%`,
                  },
                ]}
              />
            ))}
          </View>

          {/* Barras de progreso */}
          <View style={styles.chartBars}>
            {progressData.map((item, index) => (
              <View key={item.id} style={styles.barColumn}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.min(item.score * 5, 100)}%`,
                        backgroundColor: '#4db6ce',
                      },
                    ]}>
                    <Text style={styles.barValue}>
                      {Math.round(item.score)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Botón de imagen de clase */}
      <TouchableOpacity
        style={styles.classImageButton}
        onPress={handleViewClassImage}>
        <Text style={styles.classImageText}>Imagen de la clase</Text>
      </TouchableOpacity>

      {/* Botón de evaluaciones previas */}
      <TouchableOpacity
        style={styles.previousEvaluationsButton}
        onPress={handleViewPreviousEvaluations}>
        <Icon
          name="eye-outline"
          size={20}
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.previousEvaluationsText}>Evaluaciones previas</Text>
        <Icon name="chevron-forward" size={20} color="white" />
      </TouchableOpacity>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1d8a9e',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1d8a9e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentInfoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  timeContainer: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  studentImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  studentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    padding: 20,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartWrapper: {
    flex: 1,
    position: 'relative',
  },
  chartBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40, // Espacio para las etiquetas
    borderRadius: 10,
    overflow: 'hidden',
  },
  chartZone: {
    width: '100%',
  },
  chartBars: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 40, // Espacio para las etiquetas
  },
  barColumn: {
    alignItems: 'center',
    width: '23%',
  },
  barContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 40,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
  },
  barValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  barLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    color: '#333',
    width: '100%',
  },
  classImageButton: {
    backgroundColor: '#b5d8ef',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  classImageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  previousEvaluationsButton: {
    backgroundColor: '#1d8a9e',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  previousEvaluationsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  bottomNavBar: {
    height: 60,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
});

export default GetMetrics;
