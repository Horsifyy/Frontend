// EvaluationHistoryScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import { API_URL } from '../../api/config';

const screenWidth = Dimensions.get('window').width;

const EvaluationHistoryScreen = () => {
  const route = useRoute();
  const { studentInfo } = route.params;
  const [filter, setFilter] = useState('week');
  const [chartData, setChartData] = useState(null);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentInfo?.id) return;

    const fetchEvaluationHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/evaluations/history/${studentInfo.id}?range=${filter}`);
        if (!response.ok) throw new Error('No se pudo obtener el historial');
        const data = await response.json();

        const fechas = [];
        const promedios = [];

        data.forEach(ev => {
          let fecha = '—';
          if (ev.createdAt) {
            let dateObj;
            if (typeof ev.createdAt === 'string' && ev.createdAt.includes('T')) {
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

        const avg = promedios.length > 0
          ? (promedios.reduce((acc, val) => acc + val, 0) / promedios.length).toFixed(2)
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
  }, [filter, studentInfo.id]);

  return (
    <View style={styles.container}>
      <View style={styles.studentHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{studentInfo?.name || 'Estudiante'}</Text>
          <Text style={styles.studentLevel}>Nivel: {studentInfo?.lupeLevel || '—'}</Text>
        </View>
        <View style={styles.averageBadge}>
          <Text style={styles.averageValue}>{average}</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'week' && styles.activeButton]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.filterText, filter === 'week' && styles.activeText]}>Esta semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'month' && styles.activeButton]}
          onPress={() => setFilter('month')}
        >
          <Text style={[styles.filterText, filter === 'month' && styles.activeText]}>Este mes</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheaderText}>Este {filter === 'week' ? 'semana' : 'mes'} ha asistido a {chartData?.fechas?.length || 0} clases</Text>
      <Text style={styles.sectionTitle}>Historial del progreso {filter === 'week' ? 'esta semana' : 'este mes'}</Text>

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
          <View style={styles.chartOverlay}>
            <View style={[styles.chartZone, { backgroundColor: '#E0F7FA', top: 0, height: '25%' }]} />
            <View style={[styles.chartZone, { backgroundColor: '#C8E6C9', top: '25%', height: '25%' }]} />
            <View style={[styles.chartZone, { backgroundColor: '#FFF9C4', top: '50%', height: '25%' }]} />
            <View style={[styles.chartZone, { backgroundColor: '#FFCCBC', top: '75%', height: '25%' }]} />
          </View>
        </View>
      ) : (
        <Text style={styles.noData}>No hay evaluaciones recientes.</Text>
      )}
    </View>
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
    marginBottom: 20,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  studentLevel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  averageBadge: {
    backgroundColor: '#FF6F61',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  averageValue: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeButton: {
    backgroundColor: '#40CDE0',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
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
});

export default EvaluationHistoryScreen;


