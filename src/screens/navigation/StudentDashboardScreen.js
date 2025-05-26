import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from '../../api/config';
import auth from '@react-native-firebase/auth';
import Navbar from '../navigation/Navbar';

const levelColors = {
  Amarillo: '#FFC107',
  Rojo: '#F44336',
  Azul: '#2196F3',
};

const StudentDashboard = () => {
  const navigation = useNavigation();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState(null);

  useEffect(() => {
    fetchStudentInfo();
    fetchAverageScore();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken(true)}`,
        },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(
          data.error || 'No se pudo obtener la información del estudiante',
        );

      setStudentInfo(data);
    } catch (error) {
      console.error(
        'Error al obtener la información del estudiante:',
        error.message,
      );
      Alert.alert('Error', 'No se pudo obtener la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Traer promedio del desempeño
  const fetchAverageScore = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const idToken = await currentUser.getIdToken(true);

      const lastEvalResponse = await fetch(
        `${API_URL}/api/evaluations/last/${currentUser.uid}`,
        {
          headers: {Authorization: `Bearer ${idToken}`},
        },
      );
      const lastEval = await lastEvalResponse.json();

      if (lastEval.averageScore) {
        setAverageScore(parseFloat(lastEval.averageScore));
      } else {
        setAverageScore(null);
      }
    } catch (error) {
      console.error('Error al obtener promedio:', error.message);
      setAverageScore(null);
    }
  };

  const navigateToPerformance = () => {
    navigation.navigate('LastReportScreen');
  };

  const navigateToRewards = () => {
    navigation.navigate('RewardsScreen');
  };

  const navigateToSchedule = () => {
    navigation.navigate('ScheduleClass');
  };

  const navigateToHome = () => {
    navigation.navigate('StudentDashboard');
  };

  const navigateToProfile = () => {
    navigation.navigate('UserProfileScreen', {userType: 'student'});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2B8C96" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.topShape} />
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            <View style={styles.profilePicContainer}>
              {studentInfo?.profilePicture ? (
                <Image
                  source={{uri: studentInfo.profilePicture}}
                  style={styles.profileImage}
                />
              ) : (
                <Icon name="account-circle" size={60} color="#fff" />
              )}
            </View>

            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                ¡Hola, {studentInfo?.name || 'Estudiante'}!
              </Text>
              <Text
                style={[
                  styles.level,
                  {color: levelColors[studentInfo?.lupeLevel] || '#FFC107'},
                ]}>
                Nivel: {studentInfo?.lupeLevel || 'Desconocido'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, styles.performanceCard]}
            onPress={navigateToPerformance}
            activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Icon name="fire" size={40} color="#fff" />
            </View>
            <Text style={styles.scoreText}>
              {averageScore !== null ? averageScore.toFixed(2) : '--'}
            </Text>
            <Text style={styles.cardLabel}>Desempeño</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.rewardsCard]}
            onPress={navigateToRewards}
            activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Icon name="gift" size={35} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Recompensas</Text>
            <Text style={styles.cardTitle}>y beneficios</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.card, styles.scheduleCard]}
          onPress={navigateToSchedule}
          activeOpacity={0.8}>
          <View style={styles.iconContainer}>
            <Icon name="calendar" size={35} color="#fff" />
          </View>
          <View style={styles.scheduleTextContainer}>
            <Text style={styles.scheduleTitle}>Programación</Text>
            <Text style={styles.scheduleTitle}>de Clases</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Navbar
        navigateToHome={navigateToHome}
        navigateToProfile={navigateToProfile}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#2B8C96',
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    minHeight: 140,
  },

  topShape: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#236B73',
    borderBottomLeftRadius: 60,
  },
  profilePicContainer: {
    width: 90,
    height: 90,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 1,
  },

  greeting: {fontSize: 24, fontWeight: 'bold', color: '#ffffff'},
  level: {fontSize: 20, fontWeight: '600', marginTop: 10},
  cardsContainer: {flex: 1, padding: 20},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  performanceCard: {
    backgroundColor: '#FF6B6B',
    width: '48%',
    height: 215,
  },
  rewardsCard: {
    backgroundColor: '#2B8C96',
    width: '48%',
    height: 215,
  },
  scheduleCard: {
    backgroundColor: '#2B8C96',
    flexDirection: 'row',
    alignItems: 'center',
    height: 170,
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 70,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreText: {fontSize: 35, fontWeight: 'bold', color: '#ffffff'},
  cardLabel: {fontSize: 20, color: '#ffffff', fontWeight: '600'},
  cardTitle: {fontSize: 19, fontWeight: 'bold', color: '#ffffff'},
  scheduleTextContainer: {marginLeft: 20},
  scheduleTitle: {fontSize: 22, fontWeight: 'bold', color: '#ffffff'},
});

export default StudentDashboard;
