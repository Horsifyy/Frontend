import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const GetMetrics = ({
  studentName = 'Alumno 1',
  level = 'Amarillo',
  time = '16,54',
  progressData = [
    { id: 1, name: 'Control del caballo', score: 20, color: '#4db6ce' },
    { id: 2, name: 'Postura', score: 19, color: '#4db6ce' },
    { id: 3, name: 'Movimientos corporales', score: 14, color: '#4db6ce' },
    { id: 4, name: 'Control de la respiración', score: 18, color: '#4db6ce' },
  ],
}) => {
  const progressZones = [
    { name: 'Sobresaliente', color: '#b5efe4', dotColor: '#21c5c5' },
    { name: 'Logrado', color: '#c6efb5', dotColor: '#60c938' },
    { name: 'En Proceso', color: '#efe9b5', dotColor: '#eada5d' },
    { name: 'Principiante', color: '#fae8c8', dotColor: '#f5a742' },
    { name: 'No hay progreso', color: '#e9e9e9', dotColor: '#d1d1d1' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.studentInfoContainer}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{studentName}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Nivel: {level}</Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          {progressZones.map((zone) => (
            <View key={zone.name} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: zone.dotColor }]} />
              <Text style={styles.legendText}>{zone.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Visualización del progreso</Text>
        <View style={styles.chartBackground}>
          {progressZones.map((zone, index) => (
            <View
              key={index}
              style={[styles.chartZone, { backgroundColor: zone.color, height: `${100 / progressZones.length}%` }]}
            />
          ))}
        </View>
        <View style={styles.chartBars}>
          {progressData.map((item, index) => (
            <View key={item.id} style={styles.barColumn}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: item.score * 5 }]}>
                  <Text style={styles.barValue}>{item.score}</Text>
                </View>
              </View>
              <Text style={styles.barLabel}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.classImageButton}>
        <Text style={styles.classImageText}>Imagen de la clase</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.previousEvaluationsButton}>
        <Text style={styles.previousEvaluationsText}>Evaluaciones previas</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  studentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  levelContainer: {
    marginTop: 5,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
  },
  timeContainer: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  timeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarContainer: {
    marginLeft: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    position: 'relative',
    height: 250,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartBackground: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    bottom: 30,
    borderRadius: 10,
    overflow: 'hidden',
  },
  chartZone: {
    width: '100%',
  },
  chartBars: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 30,
  },
  barColumn: {
    alignItems: 'center',
    width: '22%',
  },
  barContainer: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 30,
    backgroundColor: '#4db6ce',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
  },
  barValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  barLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    color: '#333',
  },
  classImageButton: {
    backgroundColor: '#b5d8ef',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  classImageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  previousEvaluationsButton: {
    backgroundColor: '#1d8a9e',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previousEvaluationsText: {
    color: 'white',
    fontWeight: 'bold',
    marginHorizontal: 10,
    fontSize: 16,
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

export default GetMetrics;