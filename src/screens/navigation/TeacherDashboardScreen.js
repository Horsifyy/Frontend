import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Navbar from '../navigation/Navbar';

const TeacherDashboard = ({route, navigation}) => {
  const {student} = route.params;

  const options = [
    {
      id: 1,
      title: 'Editar nivel del estudiante',
      color: '#c8eff5',
      textColor: '#333',
    },
    {
      id: 2,
      title: 'Progreso del estudiante',
      color: '#c8eff5',
      textColor: '#333',
      screen: 'EvaluationHistory',
    },
    {
      id: 3,
      title: 'Registrar nuevo desempeño',
      color: '#c8eff5',
      textColor: '#333',
      screen: 'RegisterEvaluation',
    },
    {id: 4, title: 'Calendario de clases', color: '#e6e6e6', textColor: '#333'},
  ];

  const handleNavigateToEvaluation = screenName => {
    if (!screenName) return;

    const studentWithLevel = {
      id: student.id,
      name: student.name,
      lupeLevel: student.lupeLevel || '',
      photoUrl: student.photoUrl || '', // opcional si usas foto
      role: student.role,
    };

    navigation.navigate(screenName, {studentInfo: studentWithLevel});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#106e7e" />
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>Perfil</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Opciones disponibles:</Text>

        <View style={styles.optionsContainer}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionButton, {backgroundColor: option.color}]}
              onPress={() => handleNavigateToEvaluation(option.screen)}
              activeOpacity={0.7}>
              <Text style={[styles.optionText, {color: option.textColor}]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Navbar
        navigateToHome={() => navigation.navigate('TeacherHome')}
        navigateToProfile={() => navigation.navigate('TeacherProfile')}
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
    height: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#5ec4d6',
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  profileCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#106e7e',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  profileText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  optionButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
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

export default TeacherDashboard;
