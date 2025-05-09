import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';
import Navbar from '../navigation/Navbar';
import { useNavigation } from '@react-navigation/native';

const StudentClassesScreen = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const response = await fetch(`${API_URL}/api/classes/student/${currentUser.uid}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'No se pudieron obtener las clases');

      // Opcional: ordena por fecha/hora
      const sorted = data.sort((a, b) =>
        a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
      );

      setClasses(sorted);
    } catch (error) {
      console.error('Error al obtener clases:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.classCard}>
      <Text style={styles.classText}>📅 {item.date}</Text>
      <Text style={styles.classText}>⏰ {item.time}</Text>
      <Text style={styles.classText}>📌 Estado: {item.status || 'programada'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis clases programadas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2B8C96" />
      ) : classes.length === 0 ? (
        <Text style={styles.noClasses}>No tienes clases programadas.</Text>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('TeacherProfile')}
      />
    </View>
  );
};

export default StudentClassesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B8C96',
    marginBottom: 20,
    textAlign: 'center',
  },
  classCard: {
    backgroundColor: '#e0f7f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  classText: {
    fontSize: 16,
    color: '#333',
  },
  noClasses: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
