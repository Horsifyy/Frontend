import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { API_URL } from '../../api/config';
import auth from '@react-native-firebase/auth';
import Navbar from '../navigation/Navbar';

const TeacherSchedule = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledClasses();
  }, []);

  const fetchScheduledClasses = async () => {
    try {
      setLoading(true);

      // Obtener token del usuario actual
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const idToken = await currentUser.getIdToken(true);

      // Llamamos a la API para obtener las clases programadas para este docente
      const response = await fetch(`${API_URL}/api/classes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener las clases programadas');
      }

      setClasses(data); // Asignamos las clases a estado
    } catch (error) {
      console.error('Error al cargar clases:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las clases programadas. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Horario de Clases Programadas</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator size="large" color="#40CDE0" style={styles.loadingIndicator} />
        ) : classes.length > 0 ? (
          classes.map((classItem) => (
            <View key={classItem.id} style={styles.classCard}>
              <Text style={styles.classInfo}>Estudiante: {classItem.studentName}</Text>
              <Text style={styles.classInfo}>Fecha: {classItem.date}</Text>
              <Text style={styles.classInfo}>Hora: {classItem.time}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noClasses}>No hay clases programadas.</Text>
        )}
      </ScrollView>

      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => navigation.navigate('TeacherProfile')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  classCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  classInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  noClasses: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default TeacherSchedule;
