import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const TeacherHome = ({ navigation, students = [
  { id: 1, name: 'Alumno 1' },
  { id: 2, name: 'Alumno 2' },
  { id: 3, name: 'Alumno 3' },
] }) => {

  const navigateToTeacherDashboard = (student) => {
    navigation.navigate('TeacherDashboard', { student });
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#106e7e" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Bienvenido profesor!</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Alumnos inscritos</Text>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {students.map((student) => (
            <TouchableOpacity 
              key={student.id} 
              style={styles.studentCard}
              onPress={() => navigateToTeacherDashboard(student)}
              activeOpacity={0.7}
            >
              <View style={styles.studentAvatar} />
              <Text style={styles.studentName}>{student.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="person" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>
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

export default TeacherHome;