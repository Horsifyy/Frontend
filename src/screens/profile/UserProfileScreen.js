import React, { useState, useEffect } from 'react';
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
import { API_URL } from '../../api/config';
import Navbar from '../navigation/Navbar';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibe tipo de usuario vía params o 'student' por defecto
  const { userType = 'student' } = route.params || {};

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos usuario actual
  const fetchUserInfo = async () => {
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
        throw new Error(data.error || 'No se pudo obtener la información del usuario');

      setUserInfo(data);
    } catch (error) {
      console.error('Error al obtener la información:', error.message);
      Alert.alert('Error', 'No se pudo obtener la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Actualiza datos si vienen por params desde edición
  useEffect(() => {
    if (
      route.params?.updatedName ||
      route.params?.updatedProfilePicture ||
      route.params?.updatedLevel
    ) {
      setUserInfo((prev) => ({
        ...prev,
        name: route.params.updatedName || prev?.name,
        profilePicture: route.params.updatedProfilePicture || prev?.profilePicture,
        lupeLevel: route.params.updatedLevel || prev?.lupeLevel,
      }));
    }
  }, [route.params]);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  const navigateToEditProfile = () => {
    if (userType === 'teacher') {
      navigation.navigate('EditProfile', { userType: 'teacher' });
    } else {
      navigation.navigate('EditProfile', { userType: 'student' });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2B8C96" />
      ) : userInfo ? (
        <View style={styles.profileContainer}>
          <Text style={styles.title}>
            {userType === 'teacher' ? 'Perfil del Profesor' : 'Perfil'}
          </Text>

          <View style={styles.profileHeader}>
            {userInfo.profilePicture ? (
              <Image
                style={styles.profileImage}
                source={{ uri: userInfo.profilePicture }}
              />
            ) : (
              <View style={[styles.profileImage, styles.iconFallback]}>
                <MaterialIcons name="person" size={80} color="#999" />
              </View>
            )}
            <Text style={styles.profileName}>{userInfo.name}</Text>
            {userType === 'student' && (
              <Text style={styles.profileLevel}>Nivel: {userInfo.lupeLevel}</Text>
            )}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={navigateToEditProfile}
            >
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text>No se encontró información del perfil.</Text>
      )}

      <Navbar
        navigateToHome={() =>
          navigation.navigate(userType === 'teacher' ? 'TeacherHome' : 'StudentDashboard')
        }
        navigateToProfile={() =>
          navigation.navigate(userType === 'teacher' ? 'TeacherProfileScreen' : 'StudentProfile')
        }
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
  iconFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderWidth: 3,
    borderColor: '#2B8C96',
  },
});

export default UserProfileScreen;
