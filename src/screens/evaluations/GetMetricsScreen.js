import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Navbar from '../navigation/Navbar';

const screenWidth = Dimensions.get('window').width;

const GetMetricsScreen = () => {
  const [chartData, setChartData] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const {studentInfo, exercises, ratings, averageScore} = route.params; // Datos recibidos de la pantalla anterior

  useEffect(() => {
    if (ratings && exercises) {
      generateEvaluationChart(ratings, exercises);
    }
  }, [ratings, exercises]);

  const generateEvaluationChart = (ratings, exercises) => {
    // Extraemos las métricas y sus valores
    const metricsLabels = Object.keys(ratings);
    const metricsValues = Object.values(ratings).map(val => parseInt(val, 10));

    setChartData({
      labels: metricsLabels, // Las métricas serán las etiquetas del gráfico
      datasets: [
        {
          data: metricsValues, // Los valores de calificación serán los datos
          color: (opacity = 1) => `rgba(64, 205, 224, ${opacity})`,
        },
      ],
    });
  };

  // Colores para los ejercicios (visual)
  const getExerciseColor = index => {
    const colors = ['#40CDE0', '#4CAF50', '#FFC107', '#FF9800', '#CCCCCC'];
    return colors[index % colors.length];
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Header con información del estudiante */}
        <View style={styles.headerContainer}>
          <View style={styles.studentInfoContainer}>
            <Text style={styles.studentName}>
              {studentInfo?.name || 'Estudiante'}
            </Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Nivel: </Text>
              <Text style={styles.levelValue}>{studentInfo?.lupeLevel}</Text>
            </View>
          </View>

          <View style={styles.averageBadge}>
            <Text style={styles.averageValue}>{averageScore}</Text>
          </View>
          <View style={styles.profileImageContainer}>
            <Image style={styles.profileImage} />
          </View>
        </View>

        {/* Ejercicios realizados */}
        <View style={styles.exercisesContainer}>
          {exercises &&
            exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View
                  style={[
                    styles.exerciseDot,
                    {backgroundColor: getExerciseColor(index)},
                  ]}
                />
                <Text style={styles.exerciseText}>{exercise}</Text>
              </View>
            ))}
        </View>

        {/* Título de visualización */}
        <Text style={styles.sectionTitle}>Visualización del progreso</Text>

        {/* Gráfico de barras con las métricas */}
        {chartData && chartData.labels ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: chartData.labels.map(label => {
                  // Acortamos los nombres de las métricas para que quepan en el gráfico
                  return label.length > 20
                    ? label.substring(0, 17) + '...'
                    : label;
                }),
                datasets: [{data: chartData.datasets[0].data}],
              }}
              width={screenWidth - 40}
              height={350}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(64, 205, 224, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.7,
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#EDEDED',
                },
              }}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={true}
              segments={5}
              style={styles.chart}
              verticalLabelRotation={30}
            />
            {/* Capas de colores para zonas */}
            <View style={styles.chartOverlay}>
              <View
                style={[
                  styles.chartZone,
                  {
                    backgroundColor: 'rgba(64, 205, 224, 0.15)',
                    top: 0,
                    height: '25%',
                  },
                ]}
              />
              <View
                style={[
                  styles.chartZone,
                  {
                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                    top: '25%',
                    height: '25%',
                  },
                ]}
              />
              <View
                style={[
                  styles.chartZone,
                  {
                    backgroundColor: 'rgba(255, 193, 7, 0.15)',
                    top: '50%',
                    height: '25%',
                  },
                ]}
              />
              <View
                style={[
                  styles.chartZone,
                  {
                    backgroundColor: 'rgba(255, 152, 0, 0.15)',
                    top: '75%',
                    height: '25%',
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando gráfica...</Text>
          </View>
        )}

        {/* Sección de imagen de la clase */}
        <View style={styles.classImageContainer}>
          <Text style={styles.classImageText}>Imagen de la clase</Text>
        </View>

        {/* Botón de evaluaciones previas */}
        <TouchableOpacity
          style={styles.previousEvalButton}
          onPress={() => {
            navigation.navigate('EvaluationHistory', {
              studentInfo: studentInfo, // envía la info del estudiante
            });
          }}>
          <Text style={styles.previousEvalText}>Evaluaciones previas</Text>
        </TouchableOpacity>
      </View>
      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => navigation.navigate('TeacherProfileScreen')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  studentInfoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
  },
  levelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  averageBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  averageValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileImageContainer: {
    marginLeft: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DDD',
  },
  exercisesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  exerciseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  exerciseText: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 0,
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  classImageContainer: {
    height: 100,
    backgroundColor: '#A9DEF9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  classImageText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  previousEvalButton: {
    backgroundColor: '#0075A2',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  previousEvalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
});

export default GetMetricsScreen;
