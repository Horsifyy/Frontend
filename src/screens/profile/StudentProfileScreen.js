import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {API_URL} from '../../api/config';
import Navbar from '../navigation/Navbar';
import {useNavigation} from '@react-navigation/native';

const StudentProfileScreen = () => {
  const navigation = useNavigation();
  const [studentInfo, setStudentInfo] = useState(null);
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

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login'); // O la pantalla de inicio de sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile'); // Navegar a la pantalla de edición del perfil
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2B8C96" />
      ) : studentInfo ? (
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Perfil</Text>

          <View style={styles.profileHeader}>
            <Image
              style={styles.profileImage}
              source={{uri: studentInfo.profilePicture}}
            />
            <Text style={styles.profileName}>{studentInfo.name}</Text>
            <Text style={styles.profileLevel}>
              Nivel: {studentInfo.lupeLevel}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={navigateToEditProfile}>
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
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
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileLevel: {
    fontSize: 16,
    color: '#777',
  },
  optionsContainer: {
    width: '80%',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2B8C96',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentProfileScreen;
