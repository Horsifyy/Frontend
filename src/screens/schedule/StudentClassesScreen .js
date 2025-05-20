import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';
import Navbar from '../navigation/Navbar';
import { useNavigation } from '@react-navigation/native';

const StudentClassesScreen = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchStudentClasses = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const token = await currentUser.getIdToken(true);

      const response = await fetch(
        `${API_URL}/api/classes/student/${currentUser.uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || 'No se pudieron obtener las clases');

      const sorted = data.sort(
        (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
      );

      setClasses(sorted);
    } catch (error) {
      console.error('Error al obtener clases:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentClasses();
  }, [fetchStudentClasses]);

  // Cancelar clase
  const cancelClass = async (classId) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const token = await currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/api/classes/cancel/${classId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error cancelando clase');

      Alert.alert('Éxito', 'Clase cancelada correctamente');
      fetchStudentClasses();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Navegar para reprogramar clase
  const reprogramClass = (clase) => {
    navigation.navigate('ScheduleClass', { claseParaEditar: clase });
  };

  const renderItem = ({ item }) => (
    <View style={styles.classCard}>
      <Text style={styles.classText}>📅 {item.date}</Text>
      <Text style={styles.classText}>⏰ {item.time}</Text>
      <Text style={styles.classText}>📌 Estado: {item.status || 'programada'}</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, styles.reprogramButton]}
          onPress={() => reprogramClass(item)}
        >
          <Text style={styles.buttonText}>Reprogramar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() =>
            Alert.alert(
              'Confirmar cancelación',
              '¿Deseas cancelar esta clase?',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Sí', onPress: () => cancelClass(item.id) },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
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
        <FlatList data={classes} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('StudentProfile')}
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
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reprogramButton: {
    backgroundColor: '#106e7e',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#e53935',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

