import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {API_URL} from '../../api/config';
import Navbar from '../navigation/Navbar';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker'; // Añadido
import storage from '@react-native-firebase/storage'; // Añadido para Firebase Storage

const RegisterEvaluationScreen = () => {
  const {params} = useRoute();
  const navigation = useNavigation();
  const student = params?.studentInfo || {};

  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [formData, setFormData] = useState({
    selectedExercises: [],
    ratings: {}, // { "Label métrica": "1", ... }
    comments: '',
  });

  // Estado para manejar la imagen
  const [imageUri, setImageUri] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const studentInfo = {
    id: student.id || '',
    name: student.name || 'Estudiante',
    lupeLevel: student.lupeLevel || '',
    role: student.role,
  };

  // Carga los ejercicios y las métricas desde el backend
  useEffect(() => {
    const lvl = studentInfo.lupeLevel;
    if (!lvl) return;

    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/evaluations/exercises/${lvl}`),
      fetch(`${API_URL}/api/evaluations/metrics/${lvl}`),
    ])
      .then(async ([resEx, resMe]) => {
        if (!resEx.ok) throw new Error('Error cargando ejercicios');
        if (!resMe.ok) throw new Error('Error cargando métricas');
        const exJson = await resEx.json();
        const meJson = await resMe.json();
        return [exJson.exercises, meJson.metrics];
      })
      .then(([exList, meList]) => {
        setExercises(exList);
        setMetrics(meList);
        // Inicializa todas las métricas en 1
        const initialRatings = {};
        meList.forEach(label => {
          initialRatings[label] = ''; // Dejarlo vacío, para que el docente lo ingrese
        });
        setFormData(fd => ({...fd, ratings: initialRatings}));
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', err.message);
      })
      .finally(() => setLoading(false));
  }, [studentInfo.lupeLevel]);

  // Marcar ejercicios
  const toggleExercise = ex => {
    setFormData(fd => {
      const sel = fd.selectedExercises.includes(ex)
        ? fd.selectedExercises.filter(e => e !== ex)
        : [...fd.selectedExercises, ex];
      return {...fd, selectedExercises: sel};
    });
  };

  // Revisa la inicialización de las métricas en el estado del frontend
  const changeRating = (label, value) => {
    setFormData(fd => ({
      ...fd,
      ratings: {...fd.ratings, [label]: value},
    }));
  };
  // Comentarios generales
  const onCommentsChange = text => {
    setFormData(fd => ({...fd, comments: text}));
  };

  // Validar antes de enviar
  const validateForm = () => {
    if (!formData.selectedExercises.length) {
      Alert.alert('Error', 'Selecciona al menos un ejercicio');
      return false;
    }
    if (metrics.some(m => !formData.ratings[m] || formData.ratings[m] === '')) {
      Alert.alert('Error', 'Califica todas las métricas');
      return false;
    }
    if (!formData.comments.trim()) {
      Alert.alert('Error', 'Agrega comentarios generales');
      return false;
    }
    return true;
  };

  // Función para seleccionar imagen de la galería
  const selectImageFromGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.7, // calidad de la imagen (0 a 1)
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección de imagen');
      } else if (response.errorCode) {
        console.log('Error al seleccionar imagen: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  // Función para tomar una foto con la cámara
  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      includeBase64: false,
      saveToPhotos: true,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.errorCode) {
        console.log('Error de cámara: ', response.errorMessage);
        Alert.alert('Error', 'No se pudo acceder a la cámara');
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  // Función para subir la imagen a Firebase Storage
  const uploadImageToFirebase = async () => {
    if (!imageUri) {
      return null; // No hay imagen para subir
    }

    setImageUploading(true);
    try {
      // Generar un nombre único para la imagen basado en el ID del estudiante y la fecha
      const filename = `class_images/${studentInfo.id}_${Date.now()}.jpg`;
      const reference = storage().ref(filename);
      
      // Sube la imagen a Firebase Storage
      await reference.putFile(imageUri);
      
      // Obtiene la URL de descarga de la imagen
      const url = await reference.getDownloadURL();
      setImageUrl(url);
      setImageUploading(false);
      
      return url;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
      setImageUploading(false);
      return null;
    }
  };

  // Mostrar opciones para elegir imagen
  const showImageOptions = () => {
    Alert.alert(
      'Subir imagen de clase',
      '¿Cómo quieres subir la imagen?',
      [
        {
          text: 'Seleccionar de la galería',
          onPress: selectImageFromGallery,
        },
        {
          text: 'Tomar una foto',
          onPress: takePhoto,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  // Asegúrate de que los datos de las métricas se envíen correctamente
  const handleConfirm = async () => {
    if (!validateForm()) return;
    setLoading(true);

     // Primero subimos la imagen si existe
    let uploadedImageUrl = null;
    if (imageUri) {
      uploadedImageUrl = await uploadImageToFirebase();
      if (!uploadedImageUrl) {
        setLoading(false);
        return; // Si hay un error al subir la imagen, detener el proceso
      }
    }

    // Aquí nos aseguramos de que todas las métricas y ejercicios estén completos
    const payload = {
      studentId: studentInfo.id,
      lupeLevel: studentInfo.lupeLevel,
      exercises: formData.selectedExercises,
      metrics: formData.ratings, // Asegúrate de que todas las métricas estén correctamente asignadas
      comments: formData.comments,
      imageUrl: uploadedImageUrl,
    };

    try {
      const res = await fetch(`${API_URL}/api/evaluations`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error(`Servidor respondió ${res.status}`);
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error inesperado');

      Alert.alert('Éxito', 'Evaluación registrada', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('GetMetrics', {
              studentInfo: {
                id: studentInfo.id,
                name: studentInfo.name,
                lupeLevel: studentInfo.lupeLevel, // Asegúrate de que el nivel no sea vacío
              },
              exercises: formData.selectedExercises, // Pasamos los ejercicios
              ratings: formData.ratings, // Pasamos las métricas (calificaciones)
              averageScore: json.evaluation?.averageScore,
              imageUrl: uploadedImageUrl,
            }),
        },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Mientras carga
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d8a9e" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={{ ...styles.scrollContent, flexGrow: 1, paddingBottom: 120 }}>
        <Text style={styles.title}>Registro de Evaluación</Text>

        <View style={styles.studentInfoContainer}>
          <Text style={styles.studentName}>{studentInfo.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nivel: {studentInfo.lupeLevel}</Text>
          </View>
        </View>

        {/* EJERCICIOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ejercicios Realizados</Text>
          {exercises.map(ex => (
            <View key={ex} style={styles.checkboxContainer}>
              <Switch
                value={formData.selectedExercises.includes(ex)}
                onValueChange={() => toggleExercise(ex)}
              />
              <Text style={styles.label}>{ex}</Text>
            </View>
          ))}
        </View>

        {/* MÉTRICAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas (0 - 50)</Text>

          {/* Encabezado de números */}
          <View style={styles.radioHeader}>
            {[0, 10, 20, 30, 40, 50].map(val => (
              <Text key={val} style={styles.radioHeaderText}>
                {val}
              </Text>
            ))}
          </View>

          {/* Métricas */}
          {metrics.map(label => (
            <View key={label} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{label}</Text>
              <View style={styles.radioGroup}>
                {[0, 10, 20, 30, 40, 50].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.radioCircle,
                      formData.ratings[label] === `${value}` &&
                        styles.selectedRadio,
                    ]}
                    onPress={() => changeRating(label, `${value}`)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* COMENTARIOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentarios Generales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Añade comentarios generales"
            value={formData.comments}
            onChangeText={onCommentsChange}
          />
        </View>

        {/* SECCIÓN DE IMAGEN DE CLASE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagen de la Clase</Text>
          
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{uri: imageUri}} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={showImageOptions}>
                <Text style={styles.changeImageText}>Cambiar imagen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadImageButton} 
              onPress={showImageOptions}>
              <Text style={styles.uploadImageText}>Seleccionar imagen</Text>
            </TouchableOpacity>
          )}
          
          {imageUploading && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#1d8a9e" />
              <Text style={styles.uploadingText}>Subiendo imagen...</Text>
            </View>
          )}
        </View>

        {/* Botón de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleConfirm}
            disabled={loading || imageUploading}>
            <Text style={styles.buttonText}>Confirmar Registro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => navigation.navigate('UserProfileScreen', { userType: 'teacher' })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContent: {padding: 20},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: '#1d8a9e'},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  studentInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  studentName: {fontSize: 18, fontWeight: '600'},
  levelBadge: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {color: '#fff', fontWeight: '500'},
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1d8a9e',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {marginLeft: 8, flex: 1},
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingInput: {
    width: 60,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 4,
  },
  input: {borderWidth: 1, borderColor: '#dfe6e9', borderRadius: 8, padding: 12},
  textArea: {height: 100, textAlignVertical: 'top', marginTop: 10},
  actionContainer: {marginTop: 20, alignItems: 'center'},
  button: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  radioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  radioHeaderText: {
    width: 24,
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  metricRow: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbb',
    backgroundColor: 'white',
  },
  selectedRadio: {
    borderColor: '#C71585',
    backgroundColor: '#C71585',
  },
  // Estilos para la sección de imágenes
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadImageButton: {
    backgroundColor: '#90EE90',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  uploadImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeImageButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '50%',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  uploadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#1d8a9e',
  },
});

export default RegisterEvaluationScreen;