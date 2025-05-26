import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {API_URL} from '../../api/config';
import Navbar from '../navigation/Navbar';
import {useNavigation} from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EditUserProfileScreen = ({route}) => {
  const navigation = useNavigation();
  const {userType = 'student'} = route.params || {};

  const [userInfo, setUserInfo] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Cargar info usuario
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
      setName(data.name);
      setEmail(data.email);
      setImageUri(data.profilePicture || null);
    } catch (error) {
      console.error('Error al obtener la información:', error.message);
      Alert.alert('Error', 'No se pudo obtener la información del perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Selección o captura de imagen
  const selectImageFromGallery = () => {
    const options = {mediaType: 'photo', quality: 0.7};
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección de imagen');
      } else if (response.errorCode) {
        console.log('Error al seleccionar imagen:', response.errorMessage);
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const takePhoto = () => {
    const options = {mediaType: 'photo', quality: 0.7, saveToPhotos: true};
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.errorCode) {
        console.log('Error de cámara:', response.errorMessage);
        Alert.alert('Error', 'No se pudo acceder a la cámara');
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const showImageOptions = () => {
    Alert.alert(
      'Cambiar imagen de perfil',
      '¿Cómo quieres seleccionar la imagen?',
      [
        {text: 'Seleccionar de la galería', onPress: selectImageFromGallery},
        {text: 'Tomar una foto', onPress: takePhoto},
        {text: 'Cancelar', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  // Función para borrar imagen de perfil
  const handleRemoveProfilePicture = async () => {
    if (!userInfo?.profilePicture) {
      Alert.alert('No hay imagen para eliminar');
      return;
    }

    Alert.alert(
      'Confirmar',
      '¿Quieres eliminar la imagen de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Extraer path en storage
              const oldUrl = userInfo.profilePicture;
              const pathStart = oldUrl.indexOf('/o/') + 3;
              const pathEnd = oldUrl.indexOf('?alt=');
              const filePath = decodeURIComponent(oldUrl.substring(pathStart, pathEnd));
              const oldRef = storage().ref(filePath);

              await oldRef.delete();
              console.log('Imagen eliminada:', filePath);

              // Actualizar backend
              const currentUser = auth().currentUser;
              if (!currentUser) throw new Error('Usuario no autenticado');
              const idToken = await currentUser.getIdToken(true);

              const response = await fetch(`${API_URL}/api/users/edit/${currentUser.uid}`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${idToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profilePicture: null }),
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Imagen de perfil eliminada');
                setUserInfo({...userInfo, profilePicture: null});
                setImageUri(null);
              } else {
                Alert.alert('Error', data.error || 'No se pudo eliminar la imagen');
              }
            } catch (error) {
              console.error('Error eliminando imagen:', error.message);
              Alert.alert('Error', 'No se pudo eliminar la imagen');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Guardar cambios y subir imagen si se cambió
  const handleSaveProfile = async () => {
    setLoading(true);
    setUploading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const idToken = await currentUser.getIdToken(true);
      let profilePictureUrl = userInfo.profilePicture;

      if (imageUri) {
        // Borrar imagen anterior si existe
        if (userInfo.profilePicture) {
          try {
            const oldUrl = userInfo.profilePicture;
            const pathStart = oldUrl.indexOf('/o/') + 3;
            const pathEnd = oldUrl.indexOf('?alt=');
            const filePath = decodeURIComponent(oldUrl.substring(pathStart, pathEnd));
            const oldRef = storage().ref(filePath);
            await oldRef.delete();
            console.log('Imagen anterior eliminada:', filePath);
          } catch (err) {
            console.warn('No se pudo borrar la imagen anterior:', err.message);
          }
        }

        // Subir nueva imagen
        const filename = `profile_pictures/${currentUser.uid}_${Date.now()}.jpg`;
        const reference = storage().ref(filename);
        await reference.putFile(imageUri);
        profilePictureUrl = await reference.getDownloadURL();
      }

      const updatedData = {
        name,
        email,
        profilePicture: profilePictureUrl,
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
        setUserInfo({...userInfo, profilePicture: profilePictureUrl, name, email});
        setImageUri(null);

        // Navegar a la pantalla correspondiente con datos actualizados
navigation.navigate('UserProfileScreen', {
  userType: userType, // 'teacher' o 'student'
  updatedName: name,
  updatedEmail: email,
  updatedProfilePicture: profilePictureUrl,
});
      } else {
        Alert.alert('Error', data.error || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al guardar el perfil:', error.message);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2B8C96" />
      ) : userInfo ? (
        <View style={styles.profileContainer}>
          <Text style={styles.title}>
            {userType === 'teacher' ? 'Editar Perfil del Profesor' : 'Editar Perfil'}
          </Text>

          <View style={styles.profileHeader}>
            {imageUri ? (
              <Image style={styles.profileImage} source={{uri: imageUri}} />
            ) : userInfo?.profilePicture ? (
              <Image
                key={userInfo.profilePicture} // forzar rerender
                style={styles.profileImage}
                source={{ uri: encodeURI(userInfo.profilePicture) + '?time=' + new Date().getTime() }}
              />
            ) : (
              <View style={[styles.profileImage, styles.iconFallback]}>
                <MaterialIcons name="person" size={80} color="#999" />
              </View>
            )}

            <TouchableOpacity style={styles.changePictureButton} onPress={showImageOptions}>
              <Text style={styles.changePictureText}>Cambiar imagen de perfil</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.removePictureButton, {marginBottom: 20}]}
            onPress={handleRemoveProfilePicture}
            disabled={loading}
          >
            <Text style={styles.removePictureText}>Quitar imagen de perfil</Text>
          </TouchableOpacity>

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

          <TouchableOpacity
            style={[styles.saveButton, {marginTop: 20}]}
            onPress={handleSaveProfile}
            disabled={loading || uploading}
          >
            <Text style={styles.saveButtonText}>
              {loading || uploading ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>No se encontró información del perfil.</Text>
      )}

      <Navbar
        navigateToHome={() =>
          navigation.navigate(userType === 'teacher' ? 'TeacherDashboard' : 'StudentDashboard')
        }
        navigateToProfile={() =>
          navigation.navigate('UserProfileScreen', { userType: userType === 'teacher' ? 'teacher' : 'student' })
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
  profileContainer: {alignItems: 'center', marginBottom: 50},
  profileHeader: {alignItems: 'center', marginBottom: 15},
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#2B8C96',
  },
  changePictureButton: {
    backgroundColor: '#40CDE0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  changePictureText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  removePictureButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '60%',
    alignItems: 'center',
  },
  removePictureText: {
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
  },
  saveButtonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  iconFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderWidth: 3,
    borderColor: '#2B8C96',
  },
});

export default EditUserProfileScreen;
