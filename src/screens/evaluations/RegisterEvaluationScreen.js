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
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {API_URL} from '../../api/config';

const RegisterEvaluation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {student} = route.params || {};

  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    id: student?.id || '',
    name: student?.name || 'Estudiante',
    lupeLevel: student?.lupeLevel || '',
  });

  const [evaluationData, setEvaluationData] = useState({
    balanceYEquilibrio: {
      frecuenciaPractica: '',
      controlPostura: '',
      movimientosRitmo: '',
      feedbackEntrenador: '',
    },
    conduccion: {
      estadoEmocionalAntes: '',
      estadoEmocionalDespues: '',
      proyeccionEmocional: '',
      ritmoRespiracion: '',
    },
    equitacionCentrada: {
      ejerciciosRealizados: '',
      balancePiernas: '',
      controlEquilibrio: '',
    },
    comments: '',
  });

  // Verificar datos de estudiante al cargar
  useEffect(() => {
    console.log(
      'Datos completos recibidos del estudiante:',
      JSON.stringify(student),
    );

    if (!student || !student.id) {
      Alert.alert('Error', 'No se recibieron datos válidos del estudiante', [
        {text: 'Volver', onPress: () => navigation.goBack()},
      ]);
      return;
    }

    if (
      !student.lupeLevel ||
      !['Amarillo', 'Azul', 'Rojo'].includes(student.lupeLevel)
    ) {
      console.log('Nivel LUPE inválido o ausente:', student.lupeLevel);

      // Notificamos al usuario que el estudiante no tiene nivel asignado pero no permitimos seleccionarlo
      Alert.alert(
        'Nivel LUPE no asignado',
        'Este estudiante no tiene un nivel LUPE asignado. Por favor asígnale un nivel en la sección de gestión de estudiantes antes de continuar.',
        [{text: 'Volver', onPress: () => navigation.goBack()}],
      );
    }
  }, [student, navigation]);

  // Manejar cambios en los campos
  const handleChange = (section, field, value) => {
    console.log(`Actualizando ${section}.${field} con valor: ${value}`);
    setEvaluationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Manejar cambio en comentarios
  const handleCommentChange = value => {
    setEvaluationData(prev => ({
      ...prev,
      comments: value,
    }));
  };

  // Validar antes de enviar
  const validateForm = () => {
    const {lupeLevel} = studentInfo;
    const {comments} = evaluationData;

    // Validación básica de comentarios
    if (!comments.trim()) {
      Alert.alert('Error', 'Por favor agregue algún comentario general');
      return false;
    }

    // Validación específica según nivel LUPE
    if (lupeLevel === 'Amarillo') {
      const {
        frecuenciaPractica,
        controlPostura,
        movimientosRitmo,
        feedbackEntrenador,
      } = evaluationData.balanceYEquilibrio;

      if (
        !frecuenciaPractica.trim() ||
        !controlPostura.trim() ||
        !movimientosRitmo.trim() ||
        !feedbackEntrenador.trim()
      ) {
        Alert.alert(
          'Error',
          'Complete todos los campos de Balance y Equilibrio',
        );
        return false;
      }
    } else if (lupeLevel === 'Azul') {
      const {
        estadoEmocionalAntes,
        estadoEmocionalDespues,
        proyeccionEmocional,
        ritmoRespiracion,
      } = evaluationData.conduccion;

      if (
        !estadoEmocionalAntes.trim() ||
        !estadoEmocionalDespues.trim() ||
        !proyeccionEmocional.trim() ||
        !ritmoRespiracion.trim()
      ) {
        Alert.alert('Error', 'Complete todos los campos de Conducción');
        return false;
      }
    } else if (lupeLevel === 'Rojo') {
      const {ejerciciosRealizados, balancePiernas, controlEquilibrio} =
        evaluationData.equitacionCentrada;

      if (
        !ejerciciosRealizados.trim() ||
        !balancePiernas.trim() ||
        !controlEquilibrio.trim()
      ) {
        Alert.alert(
          'Error',
          'Complete todos los campos de Equitación Centrada',
        );
        return false;
      }
    }

    return true;
  };

  // Enviar evaluación al backend
  const handleConfirm = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      setLoading(true);
  
      // Preparar datos según nivel LUPE
      const dataToSend = {
        studentId: studentInfo.id,
        lupeLevel: studentInfo.lupeLevel,
        comments: evaluationData.comments,
      };
  
      // Añadir solo los datos relevantes según el nivel
      if (studentInfo.lupeLevel === 'Amarillo') {
        dataToSend.balanceYEquilibrio = evaluationData.balanceYEquilibrio;
      } else if (studentInfo.lupeLevel === 'Azul') {
        dataToSend.conduccion = evaluationData.conduccion;
      } else if (studentInfo.lupeLevel === 'Rojo') {
        dataToSend.equitacionCentrada = evaluationData.equitacionCentrada;
      }
  
      console.log('Enviando datos:', JSON.stringify(dataToSend));
  
      // Add error handling for the response
      const response = await fetch(`${API_URL}/api/evaluations`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSend),
      });

      // Check response type before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (response.ok) {      
          Alert.alert('Éxito', 'Evaluación registrada correctamente', [
            {
              text: 'OK',
              onPress: () => {
                // Navegar a la pantalla de métricas con los datos del estudiante
                navigation.navigate('GetMetrics', {
                  studentId: student.id,  // Pasar el  ID del estudiante
                  studentName: student.name,  // Pasar el nombre del estudiante
                });
              },
            },
          ]);
        } else {
          Alert.alert('Error', result.error || 'Error al registrar la evaluación');
        }
      } else {
        // Handle non-JSON response
        const textResponse = await response.text();
        console.error('Server responded with non-JSON content:', textResponse);
        Alert.alert('Error', `El servidor no respondió en el formato esperado. Código: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al enviar evaluación:', error);
      Alert.alert('Error', `Ocurrió un problema: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Determinar qué formulario mostrar según el nivel LUPE
  const renderFormByLevel = () => {
    const {lupeLevel} = studentInfo;

    if (lupeLevel === 'Amarillo') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance y Equilibrio</Text>

          <Text style={styles.label}>Frecuencia de Práctica:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.balanceYEquilibrio.frecuenciaPractica}
            onChangeText={text =>
              handleChange('balanceYEquilibrio', 'frecuenciaPractica', text)
            }
            placeholder="Indica frecuencia semanal"
          />

          <Text style={styles.label}>Control de Postura:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.balanceYEquilibrio.controlPostura}
            onChangeText={text =>
              handleChange('balanceYEquilibrio', 'controlPostura', text)
            }
            placeholder="Describe el control postural"
          />

          <Text style={styles.label}>Movimientos y Ritmo:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.balanceYEquilibrio.movimientosRitmo}
            onChangeText={text =>
              handleChange('balanceYEquilibrio', 'movimientosRitmo', text)
            }
            placeholder="Evalúa movimientos y ritmo"
          />

          <Text style={styles.label}>Feedback del Entrenador:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.balanceYEquilibrio.feedbackEntrenador}
            onChangeText={text =>
              handleChange('balanceYEquilibrio', 'feedbackEntrenador', text)
            }
            placeholder="Añade tu retroalimentación"
          />
        </View>
      );
    } else if (lupeLevel === 'Azul') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conducción</Text>

          <Text style={styles.label}>Estado Emocional Antes:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.conduccion.estadoEmocionalAntes}
            onChangeText={text =>
              handleChange('conduccion', 'estadoEmocionalAntes', text)
            }
            placeholder="Describe estado emocional previo"
          />

          <Text style={styles.label}>Estado Emocional Después:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.conduccion.estadoEmocionalDespues}
            onChangeText={text =>
              handleChange('conduccion', 'estadoEmocionalDespues', text)
            }
            placeholder="Describe estado emocional posterior"
          />

          <Text style={styles.label}>Proyección Emocional:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.conduccion.proyeccionEmocional}
            onChangeText={text =>
              handleChange('conduccion', 'proyeccionEmocional', text)
            }
            placeholder="Evalúa proyección emocional"
          />

          <Text style={styles.label}>Ritmo de Respiración:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.conduccion.ritmoRespiracion}
            onChangeText={text =>
              handleChange('conduccion', 'ritmoRespiracion', text)
            }
            placeholder="Describe ritmo respiratorio"
          />
        </View>
      );
    } else if (lupeLevel === 'Rojo') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equitación Centrada</Text>

          <Text style={styles.label}>Ejercicios Realizados:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.equitacionCentrada.ejerciciosRealizados}
            onChangeText={text =>
              handleChange('equitacionCentrada', 'ejerciciosRealizados', text)
            }
            placeholder="Lista los ejercicios realizados"
          />

          <Text style={styles.label}>Balance Piernas:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.equitacionCentrada.balancePiernas}
            onChangeText={text =>
              handleChange('equitacionCentrada', 'balancePiernas', text)
            }
            placeholder="Evalúa el balance de piernas"
          />

          <Text style={styles.label}>Control de Equilibrio:</Text>
          <TextInput
            style={styles.input}
            value={evaluationData.equitacionCentrada.controlEquilibrio}
            onChangeText={text =>
              handleChange('equitacionCentrada', 'controlEquilibrio', text)
            }
            placeholder="Describe el control de equilibrio"
          />
        </View>
      );
    } else {
      return (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>
            Error: Nivel LUPE no válido o no asignado.
          </Text>
          <Text style={styles.normalText}>
            El estudiante debe tener asignado un nivel LUPE válido (Amarillo,
            Azul o Rojo).
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d8a9e" />
          <Text style={styles.loadingText}>Procesando evaluación...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Registro de Evaluación</Text>

          <View style={styles.studentInfoContainer}>
            <Text style={styles.studentName}>{studentInfo.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                Nivel: {studentInfo.lupeLevel}
              </Text>
            </View>
          </View>

          {renderFormByLevel()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentarios Generales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline={true}
              numberOfLines={4}
              value={evaluationData.comments}
              onChangeText={handleCommentChange}
              placeholder="Añade comentarios generales sobre el desempeño"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleConfirm}
            disabled={loading}>
            <Text style={styles.buttonText}>Confirmar Registro</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1d8a9e',
  },
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
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1d8a9e',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1d8a9e',
    borderRadius: 20,
  },
  levelText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  errorSection: {
    marginBottom: 25,
    backgroundColor: '#fff4f4',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d63031',
    marginBottom: 8,
  },
  normalText: {
    fontSize: 14,
    color: '#636e72',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1d8a9e',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
    color: '#2d3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1d8a9e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegisterEvaluation;
