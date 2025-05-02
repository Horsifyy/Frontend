import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';

const screenWidth = Dimensions.get('window').width;

const ProgressReportScreen = () => {
  const [filter, setFilter] = useState('month');
  const [yearFilter] = useState(new Date().getFullYear());
  const [levelFilter, setLevelFilter] = useState('Amarillo');
  const [chartData, setChartData] = useState(null);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchStudentInfoAndHistory = async () => {
      try {
        setLoading(true);
        const currentUser = auth().currentUser;
        const idToken = await currentUser.getIdToken(true);

        // Obtener última evaluación (como resumen)
        const lastEvalResponse = await fetch(`${API_URL}/api/evaluations/last/${currentUser.uid}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const lastEval = await lastEvalResponse.json();
        setStudentInfo(lastEval.studentInfo);
        if (!showHistory) {
          setAverage(parseFloat(lastEval.averageScore || '0'));
          const ratings = lastEval.ratings || {};

          setChartData({
            labels: Object.keys(ratings),
            datasets: [{ data: Object.values(ratings).map(r => parseFloat(r)) }],
          });
        }

        // Obtener historial si se requiere
        if (showHistory) {
          const currentUser = auth().currentUser;
          const studentId = currentUser?.uid;
          const response = await fetch(
            `${API_URL}/api/evaluations/history/${studentId}?range=${filter}&year=${yearFilter}&level=${levelFilter}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          const data = await response.json();
          const evaluaciones = Array.isArray(data) ? data : [];
          const fechas = [];
          const promedios = [];
          
          evaluaciones.forEach(ev => {
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
              ? (promedios.reduce((acc, val) => acc + val, 0) / promedios.length).toFixed(2)
              : 0;
          
          setAverage(avg);
          setChartData({ fechas, promedios });          
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfoAndHistory();
  }, [showHistory, filter, yearFilter, levelFilter]);

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.studentHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{studentInfo?.name || 'Estudiante'}</Text>
            <Text style={styles.studentLevel}>Nivel: {studentInfo?.lupeLevel || 'N/A'}</Text>
          </View>
          <View style={styles.averageBadge}>
            <Text style={styles.averageValue}>{average}</Text>
          </View>
        </View>

        {showHistory && (
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
          <TouchableOpacity
            style={[styles.filterButton, filter === 'year' && styles.activeButton]}
            onPress={() => setFilter('year')}
          >
            <Text style={[styles.filterText, filter === 'year' && styles.activeText]}>Este año</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Historial del progreso</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#40CDE0" style={{ marginTop: 20 }} />
      ) : chartData && (chartData.labels || chartData.fechas) ? (
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: chartData.labels || chartData.fechas,
              datasets: [{ data: chartData.datasets?.[0]?.data || chartData.promedios }],
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
            fromZero
            showValuesOnTopOfBars
            verticalLabelRotation={30}
          />
        </View>
      ) : (
        <Text style={styles.noData}>No hay evaluaciones {filter === 'month' ? 'este mes' : filter === 'week' ? 'esta semana' : 'este año'}.</Text>
      )}

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.toggleButtonText}>
          {showHistory ? 'Volver a última evaluación' : 'Ver evaluaciones previas'}
        </Text>
      </TouchableOpacity>
    </View>
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
studentHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},
studentName: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
},
studentLevel: {
  fontSize: 16,
  color: '#999',
},
averageBadge: {
  backgroundColor: '#FF6F61',
  borderRadius: 20,
  paddingHorizontal: 15,
  paddingVertical: 10,
},
averageValue: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
},
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
  marginVertical: 15,
},
chartContainer: {
  backgroundColor: '#fff',
  padding: 15,
  borderRadius: 10,
  elevation: 3,
},
filterContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 10,
},
filterButton: {
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 20,
  backgroundColor: '#e0e0e0',
},
activeButton: {
  backgroundColor: '#40CDE0',
},
filterText: {
  color: '#555',
},
activeText: {
  color: '#fff',
  fontWeight: 'bold',
},
noData: {
  textAlign: 'center',
  marginTop: 30,
  color: '#999',
},
toggleButton: {
  backgroundColor: '#0075A2',
  padding: 12,
  borderRadius: 8,
  marginTop: 20,
  alignItems: 'center',
},
toggleButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '500',
},
});


export default ProgressReportScreen;
