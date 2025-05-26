import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Navbar from '../navigation/Navbar';

const TeacherHomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); 
  }, []);

  const navigateToStudentList = () => {
    navigation.navigate('StudentList');
  };

  const navigateToSchedule = () => {
    navigation.navigate('TeacherSchedule');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#106e7e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Bienvenido, Profesor!</Text>
      </View>

      {/* Dashboard */}
      <View style={styles.dashboardContainer}>
        <View style={styles.row}>
          {/* Button for Student List */}
          <TouchableOpacity
            style={[styles.card, styles.performanceCard]}
            onPress={navigateToStudentList}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.performanceIconContainer]}>
              <Icon name="person" size={30} color="#fff" />
            </View>
            <Text style={styles.cardLabel}>Lista de Estudiantes</Text>
          </TouchableOpacity>

          {/* Button for Schedule */}
          <TouchableOpacity
            style={[styles.card, styles.scheduleCard]}
            onPress={navigateToSchedule}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.scheduleIconContainer]}>
              <Icon name="calendar" size={30} color="#fff" />
            </View>
            <Text style={styles.cardLabel}>Horario de Clases</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => navigation.navigate('UserProfileScreen', { userType: 'teacher' })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: '20%',
    backgroundColor: '#106e7e',
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 0,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingTop: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceCard: {
    backgroundColor: '#ff7b7b',
    width: '48%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleCard: {
    backgroundColor: '#4abebd',
    width: '48%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
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
  scheduleIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TeacherHomeScreen;
