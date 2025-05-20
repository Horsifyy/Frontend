import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import {API_URL} from '../../api/config';
import Navbar from '../navigation/Navbar';

const StudentList = ({navigation}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Obtener token del usuario actual
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      const idToken = await currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/api/auth/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener estudiantes');
      }
      data.students.forEach(student => {
        if (
          !student.lupeLevel ||
          !['Amarillo', 'Azul', 'Rojo'].includes(student.lupeLevel)
        ) {
          console.log(`Estudiante ${student.name} sin nivel LUPE válido`);
        }
      });
      setStudents(data.students);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los estudiantes. Por favor intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToTeacherDashboard = student => {
    console.log(
      'Navegando al dashboard con estudiante:',
      JSON.stringify(student),
    );
    navigation.navigate('TeacherDashboard', {
      student: {
        id: student.id,
        name: student.name,
        lupeLevel: student.lupeLevel,
        role: student.role,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#106e7e" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Bienvenido profesor!</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Alumnos inscritos</Text>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          {students.map(student => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => navigateToTeacherDashboard(student)}
              activeOpacity={0.7}>
              <View style={styles.studentAvatar} />
              <Text style={styles.studentName}>{student.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => console.log('Navegando a Perfil')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: '20%',
    backgroundColor: '#106e7e',
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 0,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingTop: 20,
  },
  welcomeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
    marginBottom: 10,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#c8eff5',
    borderRadius: 10,
    marginRight: 15,
  },
  studentName: {
    fontSize: 16,
    color: '#333',
  },
  bottomNavBar: {
    height: 60,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
});

export default StudentList;