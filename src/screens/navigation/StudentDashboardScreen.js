import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {API_URL} from '../../api/config';
import auth from '@react-native-firebase/auth';
import Navbar from '../navigation/Navbar';

const StudentDashboard = () => {
  const navigation = useNavigation();
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  // Fetch the student data
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

      setStudentInfo(data); // Asigna los datos del estudiante a su estado
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

  const navigateToPerformance = () => {
    navigation.navigate('ProgressReport', {
      studentData: studentInfo,
    });
  };

  const navigateToRewards = () => {
    console.log('Navegando a Recompensas');
  };

  const navigateToSchedule = () => {
    navigation.navigate('ScheduleClass');
  };

  const navigateToHome = () => {
    navigation.navigate('StudentDashboard');
  };

  const navigateToProfile = () => {
    navigation.navigate('StudentProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color="#2B8C96" />
        ) : (
          <>
            <Text style={styles.greeting}>
              Hola, {studentInfo?.name || 'Estudiante'}
            </Text>
            <Text style={styles.level}>
              Nivel: {studentInfo?.lupeLevel || 'Desconocido'}
            </Text>
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
              {studentInfo?.performanceScore || '--'}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dddddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666666',
  },
  cardsContainer: {
    flex: 1,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
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
  performanceCard: {
    backgroundColor: '#ff7b7b',
    width: '48%',
    height: 150,
    alignItems: 'center',
  },
  rewardsCard: {
    backgroundColor: '#4abebd',
    width: '48%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scheduleCard: {
    backgroundColor: '#4abebd',
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  fullWidthCard: {
    width: '100%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  rewardsIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 5,
  },
  scheduleIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 15,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLabel: {
    fontSize: 18,
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scheduleTextContainer: {
    flexDirection: 'column',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
});

export default StudentDashboard;
