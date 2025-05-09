import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';
import Navbar from '../navigation/Navbar';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [studentInfo, setStudentInfo] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentInfo();
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
        throw new Error(data.error || 'No se pudo obtener la información del estudiante');

      setStudentInfo(data);
      setName(data.name);  // Inicializa el nombre
      setEmail(data.email); // Inicializa el email
    } catch (error) {
      console.error('Error al obtener la información del estudiante:', error.message);
      Alert.alert('Error', 'No se pudo obtener la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const currentUser = auth().currentUser;
      const idToken = await currentUser.getIdToken(true);

      const updatedData = {
        name,
        email,
        // La imagen de perfil no se actualiza por ahora
        profilePicture: studentInfo.profilePicture,
      };

      const response = await fetch(`${API_URL}/api/users/edit/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Perfil actualizado con éxito');
        setStudentInfo({ ...studentInfo, profilePicture: studentInfo.profilePicture });
        navigation.goBack(); // Volver a la pantalla de perfil
      } else {
        Alert.alert('Error', data.error || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al guardar el perfil:', error.message);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2B8C96" />
      ) : studentInfo ? (
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Editar Perfil</Text>

          <View style={styles.profileHeader}>
            <Image
              style={styles.profileImage}
              source={{ uri: studentInfo.profilePicture }}
            />
            {/* Solo mostramos la opción de cambiar imagen sin funcionalidad */}
            <TouchableOpacity style={styles.changePictureButton} disabled>
              <Text style={styles.changePictureText}>Cambiar imagen de perfil</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>No se encontró información del perfil.</Text>
      )}

      {/* Navbar */}
      <Navbar
        navigateToHome={() => navigation.navigate('StudentDashboard')}
        navigateToProfile={() => navigation.navigate('StudentProfile')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2B8C96',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#2B8C96',
  },
  changePictureButton: {
    backgroundColor: '#40CDE0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  changePictureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    padding: 12,
    backgroundColor: '#f1f1f1',
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2B8C96',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
