import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import { API_URL } from '../../api/config';
import auth from '@react-native-firebase/auth';

const EditStudentLevelScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { studentInfo } = route.params;

  const [selectedLevel, setSelectedLevel] = useState(studentInfo.lupeLevel || 'Amarillo');
  const [loading, setLoading] = useState(false);

  const handleSaveLevel = async () => {
    setLoading(true);
    try {
    const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const idToken = await currentUser.getIdToken(true);

      const response  = await fetch(`${API_URL}/api/users/edit/${studentInfo.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({lupeLevel: selectedLevel}),
      });
        const contentType = response.headers.get('content-type') || '';
      let json = {};
      if (contentType.includes('application/json')) {
        json = await response.json();
      } else {
        const text = await response.text();
        console.warn('Respuesta no JSON:', text);
      }

      if (!response.ok) throw new Error(json.error || 'No se pudo actualizar el nivel');

      Alert.alert('Éxito', 'Nivel actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona el nuevo nivel:</Text>
      <Picker
        selectedValue={selectedLevel}
        onValueChange={setSelectedLevel}
        style={styles.picker}
      >
        <Picker.Item label="Amarillo" value="Amarillo" />
        <Picker.Item label="Azul" value="Azul" />
        <Picker.Item label="Rojo" value="Rojo" />
      </Picker>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveLevel}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Guardando...' : 'Guardar Nivel'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 10 },
  picker: { height: 50, marginBottom: 20 },
  button: { backgroundColor: '#40CDE0', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditStudentLevelScreen;
