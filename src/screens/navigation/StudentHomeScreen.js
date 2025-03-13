import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const StudentHome = ({ points = 578, navigation}) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('StudentDashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topShape} />
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>¡Bienvenid@!</Text>
        <View style={styles.pointsCircle}>
          <Text style={styles.pointsLabel}>Puntos acumulados:</Text>
          <Text style={styles.pointsValue}>{points}</Text>
        </View>
      </View>

      <View style={styles.bottomShapeContainer}>
        <View style={styles.bottomLeftShape} />
        <View style={styles.bottomRightShape} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topShape: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '26%',
    backgroundColor: '#2B8C96',
    borderBottomLeftRadius: 100,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#222222',
  },
  pointsCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#106e7e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pointsLabel: {
    fontSize: 17,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 5,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4dc4d9',
  },
  bottomShapeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '27%',
    flexDirection: 'row',
  },
  bottomLeftShape: {
    flex: 1,
    backgroundColor: '#4dc4d9',
    borderTopRightRadius: 500,
  },
  bottomRightShape: {
    flex: 1,
    backgroundColor: '#2B8C96',
    borderTopLeftRadius: 250,
  },
});

export default StudentHome;