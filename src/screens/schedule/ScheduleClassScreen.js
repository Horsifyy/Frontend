import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';
import { useNavigation } from '@react-navigation/native';  // Asegúrate de importar useNavigation
import Navbar from '../navigation/Navbar';


const ScheduleClassScreen = () => {
  const navigation = useNavigation();  // Usa esto para obtener el objeto de navegación
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const diasDisponibles = generateNext7Days();
  const horasDisponibles = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  function generateNext7Days() {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.toLocaleDateString('es-CO', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const formatted = date.toISOString().split('T')[0]; // yyyy-mm-dd
      days.push({ label: day, value: formatted });
    }

    return days;
  }

  const programarClase = async () => {
    if (!selectedDate || !selectedTime) {
      return Alert.alert('Error', 'Selecciona fecha y hora.');
    }
    try {
      setIsLoading(true);
      const currentUser = auth().currentUser;

      if (!currentUser) {
        setIsLoading(false);
        return Alert.alert('Error', 'Usuario no autenticado.');
      }

      const response = await fetch(`${API_URL}/api/classes/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: currentUser.uid,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es ok, intentamos obtener el mensaje de error
        const errorData = await response.json().catch(() => ({ 
          error: `Error HTTP: ${response.status}` 
        }));
        throw new Error(errorData.error || 'No se pudo programar la clase');
      }

      const data = await response.json();

      // Si la clase fue programada correctamente
    Alert.alert('¡Clase programada con éxito!');

    setSelectedDate(null);
    setSelectedTime(null);

    } catch (error) {
      console.error('Error al programar la clase:', error.message);
      Alert.alert('Error', error.message || 'No se pudo programar la clase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Semanal</Text>

      <Text style={styles.subtitle}>Selecciona un día:</Text>
      <View style={styles.row}>
        {diasDisponibles.map((dia) => (
          <TouchableOpacity
            key={dia.value}
            style={[
              styles.dateButton,
              selectedDate === dia.value && styles.dateSelected,
            ]}
            onPress={() => setSelectedDate(dia.value)}
          >
            <Text style={styles.dateText}>{dia.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Selecciona un horario:</Text>
      <View style={styles.row}>
        {horasDisponibles.map((hora) => (
          <TouchableOpacity
            key={hora}
            style={[
              styles.timeButton,
              selectedTime === hora && styles.timeSelected,
            ]}
            onPress={() => setSelectedTime(hora)}
          >
            <Text style={styles.timeText}>{hora}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={programarClase}>
        <Text style={styles.confirmText}>Confirmar clase</Text>
      </TouchableOpacity>
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('TeacherProfile')}
      />
    </View>
  );
};

export default ScheduleClassScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 25,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2B8C96',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '600',
    color: '#444',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
  },
  dateSelected: {
    backgroundColor: '#2B8C96',
  },
  dateText: {
    color: '#000',
    fontSize: 14,
  },
  timeButton: {
    backgroundColor: '#e0f7f9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    margin: 4,
  },
  timeSelected: {
    backgroundColor: '#2B8C96',
  },
  timeText: {
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#2B8C96',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
