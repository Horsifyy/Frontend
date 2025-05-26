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
          headers: { Authorization: `Bearer ${idToken}` },
        }
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
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color="#2B8C96" />
        ) : (
          <>
            <View style={styles.profilePicContainer}>
              {studentInfo?.profilePicture ? (
                <Image
                  source={{ uri: studentInfo.profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <Icon name="account-circle" size={60} color="#999" />
              )}
            </View>

            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                Hola, {studentInfo?.name || 'Estudiante'}
              </Text>
              <Text
                style={[
                  styles.level,
                  {color: levelColors[studentInfo?.lupeLevel] || '#999'},
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
            <View
              style={[styles.iconContainer, styles.performanceIconContainer]}>
              <Icon name="fire" size={30} color="#fff" />
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
            <View style={[styles.iconContainer, styles.rewardsIconContainer]}>
              <Icon name="target" size={30} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Recompensas</Text>
            <Text style={styles.cardTitle}>y beneficios</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.card, styles.scheduleCard, styles.fullWidthCard]}
          onPress={navigateToSchedule}
          activeOpacity={0.8}>
          <View style={[styles.iconContainer, styles.scheduleIconContainer]}>
            <Icon name="calendar" size={30} color="#fff" />
          </View>
          <View style={styles.scheduleTextContainer}>
            <Text style={styles.scheduleTitle}>Programación</Text>
            <Text style={styles.scheduleTitle}>de Clases.</Text>
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
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  profilePicContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginRight: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {fontSize: 24, fontWeight: 'bold', color: '#333333'},
  level: {fontSize: 16},
  cardsContainer: {flex: 1, padding: 15},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15},
  card: {
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceCard: {backgroundColor: '#ff7b7b', width: '48%', height: 150, alignItems: 'center'},
  rewardsCard: {backgroundColor: '#4abebd', width: '48%', height: 150, justifyContent: 'center', alignItems: 'flex-start'},
  scheduleCard: {backgroundColor: '#4abebd', flexDirection: 'row', alignItems: 'center', height: 100},
  fullWidthCard: {width: '100%'},
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceIconContainer: {backgroundColor: 'rgba(255, 255, 255, 0.3)'},
  rewardsIconContainer: {backgroundColor: 'rgba(255, 255, 255, 0.3)', marginBottom: 5},
  scheduleIconContainer: {backgroundColor: 'rgba(255, 255, 255, 0.3)', marginRight: 15},
  scoreText: {fontSize: 32, fontWeight: 'bold', color: '#ffffff'},
  cardLabel: {fontSize: 18, color: '#ffffff'},
  cardTitle: {fontSize: 18, fontWeight: 'bold', color: '#ffffff'},
  scheduleTextContainer: {flexDirection: 'column'},
  scheduleTitle: {fontSize: 18, fontWeight: 'bold', color: '#ffffff'},
});

export default StudentDashboard;
