import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {API_URL} from '../../api/config';
import {BarChart} from 'react-native-chart-kit';
import Navbar from '../navigation/Navbar';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const levelColors = {
  Amarillo: '#FFC107',
  Rojo: '#F44336',
  Azul: '#2196F3',
};

const LastReportScreen = () => {
  const navigation = useNavigation();
  const [studentInfo, setStudentInfo] = useState(null);
  const [average, setAverage] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const currentUser = auth().currentUser;
        const token = await currentUser.getIdToken(true);
        const res = await fetch(
          `${API_URL}/api/evaluations/lastWithExtras/${currentUser.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        if (data?.lastEvaluation) {
          setStudentInfo(data.lastEvaluation.studentInfo);
          setAverage(parseFloat(data.lastEvaluation.averageScore));
          setChartData({
            labels: Object.keys(data.lastEvaluation.ratings),
            datasets: [
              {
                data: Object.values(data.lastEvaluation.ratings).map(val =>
                  parseFloat(val),
                ),
              },
            ],
          });
          setComment(data.lastEvaluation.comments || '');
          setImageUrl(data.lastEvaluation.imageUrl || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, []);

  const goToHistory = () => {
    navigation.navigate('ProgressReport', {
      studentData: studentInfo,
    });
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color="#2B8C96" />
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.profileContainer}>
                  {studentInfo?.profilePicture ? (
                    <Image
                      source={{uri: studentInfo.profilePicture}}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.placeholderIcon}>
                      <Icon name="account" size={50} color="#999" />
                    </View>
                  )}
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.studentName}>
                    {studentInfo?.name || 'Estudiante'}
                  </Text>
                  <Text
                    style={{
                      color: levelColors[studentInfo?.lupeLevel] || '#666',
                      fontWeight: 'bold',
                    }}>
                    Nivel: {studentInfo?.lupeLevel}
                  </Text>
                </View>
                <View style={styles.averageBadge}>
                  <Text style={styles.averageValue}>{average.toFixed(2)}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Última evaluación</Text>

              {chartData && (
                <BarChart
                  data={chartData}
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
              )}

              {imageUrl ? (
                <View style={styles.imageContainer}>
                  <Text style={styles.sectionTitle}>Imagen de clase</Text>
                  <Image source={{uri: imageUrl}} style={styles.image} resizeMode="contain"  />
                </View>
              ) : null}

              <View style={styles.commentsContainer}>
                <Text style={styles.sectionTitle}>Comentario del docente:</Text>
                <Text style={styles.commentsText}>
                  {comment || 'No hay comentarios disponibles.'}
                </Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={goToHistory}>
                <Text style={styles.buttonText}>Ver evaluaciones previas</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() =>
          navigation.navigate('UserProfileScreen', {userType: 'student'})
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  averageBadge: {
    backgroundColor: '#FF6F61',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
  },
  averageValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 15,
  },
  imageContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 10,
    marginVertical: 16,
  },
  image: {
    width: '100%',
  aspectRatio: 16 / 9, // formato panorámico
  borderRadius: 10,
  },
  commentsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  commentsText: {
    fontSize: 14,
    color: '#333',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#0075A2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LastReportScreen;
