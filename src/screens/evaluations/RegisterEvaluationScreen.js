import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterEvaluation = ({
  studentName = 'Alumno 1',
  level = 'Amarillo',
  date = 'Fecha',
  duration = 'Duración',
  progressData = [
    { id: 1, name: 'Control del caballo', score: 8, color: '#b5efe4' },
    { id: 2, name: 'Postura', score: 7, color: '#c6efb5' },
    { id: 3, name: 'Movimientos corporales', score: 6, color: '#efe9b5' },
    { id: 4, name: 'Control de la respiración', score: 5, color: '#fae8c8' },
  ],
  navigation,
}) => {
  const handleConfirm = () => {
    navigation.navigate('GetMetrics');
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{studentName}</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Nivel: {level}</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View style={styles.dateButton}>
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Datos del progreso</Text>
        <Text style={styles.progressSubtitle}>Puntuación de 1 a 50</Text>
        <View style={styles.progressTable}>
          {progressData.map((item) => (
            <View key={item.id} style={styles.progressRow}>
              <Text style={styles.progressLabel}>{item.name}</Text>
              <View style={[styles.progressBar, { backgroundColor: item.color }]} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.commentButton]}>
          <Text style={styles.commentButtonText}>
            Subir comentarios y{'\n'}recomendaciones específicas:
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.imageButton]}>
          <Text style={styles.imageButtonText}>
            Subir imagen de la clase
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.confirmButton]}
        onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirmar registro</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  studentInfo: {
    flex: 2,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dateButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 5,
  },
  dateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  durationText: {
    color: '#666',
    fontSize: 12,
  },
  avatarContainer: {
    marginLeft: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  progressTable: {
    marginTop: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  progressBar: {
    flex: 1,
    height: 30,
    borderRadius: 5,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionButton: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
  },
  commentButton: {
    backgroundColor: '#b5efb7',
  },
  commentButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  imageButton: {
    backgroundColor: '#b5d8ef',
  },
  imageButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#1d8a9e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 5,
  },
  bottomNavBar: {
    height: 60,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 'auto',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
});

export default RegisterEvaluation;

