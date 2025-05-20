import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../../api/config';
import { useNavigation, useRoute } from '@react-navigation/native';
import Navbar from '../navigation/Navbar';

const ScheduleClassScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibe clase para editar (reprogramar) o null para programar nueva
  const claseParaEditar = route?.params?.claseParaEditar || null;

  const [selectedDate, setSelectedDate] = useState(claseParaEditar?.date || null);
  const [selectedTime, setSelectedTime] = useState(claseParaEditar?.time || null);
  const [selectedTeacher, setSelectedTeacher] = useState(claseParaEditar?.teacherId || null);

  const [availableTimes, setAvailableTimes] = useState([]);
  const [allTimes] = useState([
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const diasDisponibles = generateNext7Days();

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
      const formatted = date.toISOString().split('T')[0];
      days.push({ label: day, value: formatted });
    }
    return days;
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchUnavailableTimes(selectedDate);
    } else {
      setAvailableTimes(allTimes);
    }
  }, [selectedDate, fetchUnavailableTimes, allTimes]);

  const fetchTeachers = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('No hay usuario autenticado');

      const idToken = await currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/api/users/teachers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener profesores');
      }

      setTeachers(data.teachers);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los profesores.');
    }
  };

  const fetchUnavailableTimes = useCallback(
    async (date) => {
      try {
        const response = await fetch(
          `${API_URL}/api/classes/unavailable-times/${date}`
        );
        const taken = await response.json();
        const filtered = allTimes.filter((hora) => !taken.includes(hora));
        setAvailableTimes(filtered);
      } catch (error) {
        setAvailableTimes(allTimes); // fallback en error
      }
    },
    [allTimes]
  );

  const programarClase = async () => {
    if (!selectedDate || !selectedTime || !selectedTeacher) {
      return Alert.alert('Error', 'Debes seleccionar fecha, hora y profesor.');
    }

    try {
      setIsLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado.');

      let url = `${API_URL}/api/classes/schedule`;
      let method = 'POST';
      let body = {
        studentId: currentUser.uid,
        date: selectedDate,
        time: selectedTime,
        teacherId: selectedTeacher,
      };

      if (claseParaEditar) {
        // Reprogramando clase existente
        url = `${API_URL}/api/classes/reschedule/${claseParaEditar.id}`;
        method = 'PUT';
        body = { newDate: selectedDate, newTime: selectedTime };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al guardar la clase.');

      Alert.alert(
        claseParaEditar ? 'Clase reprogramada' : 'Clase programada',
        claseParaEditar
          ? 'Reprogramación exitosa'
          : 'Programación exitosa'
      );

      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedTeacher(null);

      if (claseParaEditar) {
        navigation.navigate('StudentClasses');
      } else {
        navigation.navigate('ClassConfirmation', {
          date: selectedDate,
          time: selectedTime,
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {claseParaEditar ? 'Reprogramar Clase' : 'Plan Semanal'}
      </Text>

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
        {availableTimes.map((hora) => (
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

      <Text style={styles.subtitle}>Selecciona un profesor:</Text>
      <Picker
        selectedValue={selectedTeacher}
        onValueChange={(itemValue) => setSelectedTeacher(itemValue)}
        style={{ marginVertical: 10 }}
      >
        <Picker.Item label="Selecciona un profesor" value={null} />
        {teachers.map((prof) => (
          <Picker.Item key={prof.id} label={prof.name} value={prof.id} />
        ))}
      </Picker>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={programarClase}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmText}>
            {claseParaEditar ? 'Confirmar reprogramación' : 'Confirmar clase'}
          </Text>
        )}
      </TouchableOpacity>

      {!claseParaEditar && (
        <TouchableOpacity
          style={[styles.confirmButton, { marginTop: 15, backgroundColor: '#888' }]}
          onPress={() => navigation.navigate('StudentClasses')}
        >
          <Text style={styles.confirmText}>Ver clases programadas</Text>
        </TouchableOpacity>
      )}

      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('StudentProfile')}
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
    marginTop: 20,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
