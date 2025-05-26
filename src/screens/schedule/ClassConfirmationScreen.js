import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Navbar from '../navigation/Navbar';

const ClassConfirmationScreen = ({route}) => {
  const navigation = useNavigation();
  const {date, time} = route.params; // Datos pasados desde la pantalla de programación

  const navigateToStudentClasses = () => {
    navigation.navigate('StudentClasses'); // Navegar a la pantalla de clases programadas
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clase confirmada</Text>
      <Text style={styles.subtitle}>¡Te esperamos!</Text>

      <View style={styles.classDetails}>
        <Text style={styles.classDate}>
          📅 {date} - {time}
        </Text>
        <Text style={styles.confirmationMessage}>
          ¡Gracias por confiar en nosotros!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={navigateToStudentClasses}>
        <Text style={styles.buttonText}>Ver mis clases programadas</Text>
      </TouchableOpacity>

      {/* Navbar */}
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('UserProfileScreen', { userType: 'student' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2B8C96',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  classDetails: {
    marginVertical: 20,
    alignItems: 'center',
  },
  classDate: {
    fontSize: 16,
    color: '#333',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2B8C96',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClassConfirmationScreen;
