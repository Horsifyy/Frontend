import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import {API_URL} from '../../api/config';
import auth from '@react-native-firebase/auth';

const StudentDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
const userData = route?.params?.userData ?? { name: 'Estudiante' };


const navigateToPerformance = () => {
  navigation.navigate('ProgressReport', {
    fromDashboard: true, 
  });
};

  const navigateToRewards = () => {
    console.log('Navegando a Recompensas');
  };

  const navigateToSchedule = () => {
    navigation.navigate('ScheduleClass');
  };

  const navigateToHome = () => {
    console.log('Navegando a Home');
  };

  const navigateToProfile = () => {
    console.log('Ya estás en Perfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {userData.name}</Text>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.card, styles.performanceCard]}
            onPress={navigateToPerformance}
            activeOpacity={0.8}>
            <View
              style={[styles.iconContainer, styles.performanceIconContainer]}>
              <Icon name="fire" size={30} color="#fff" />
            </View>
            <Text style={styles.scoreText}>{userData.performanceScore}</Text>
            <Text style={styles.cardLabel}>Desempeño</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, styles.rewardsCard]}
            onPress={navigateToRewards}
            activeOpacity={0.8}>
            <View style={[styles.iconContainer, styles.rewardsIconContainer]}>
              <Icon name="target" size={30} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Recompensas</Text>
            <Text style={styles.cardTitle}>y beneficios</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.card, styles.scheduleCard, styles.fullWidthCard]}
          onPress={navigateToSchedule}
          activeOpacity={0.8}>
          <View style={[styles.iconContainer, styles.scheduleIconContainer]}>
            <Icon name="calendar" size={30} color="#fff" />
          </View>
          <View style={styles.scheduleTextContainer}>
            <Text style={styles.scheduleTitle}>Programación</Text>
            <Text style={styles.scheduleTitle}>de Clases.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={navigateToHome}>
          <Icon name="home" size={28} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
          <Icon name="account" size={28} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dddddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666666',
  },
  cardsContainer: {
    flex: 1,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceCard: {
    backgroundColor: '#ff7b7b',
    width: '48%',
    height: 150,
    alignItems: 'center',
  },
  rewardsCard: {
    backgroundColor: '#4abebd',
    width: '48%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scheduleCard: {
    backgroundColor: '#4abebd',
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  fullWidthCard: {
    width: '100%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  rewardsIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 5,
  },
  scheduleIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 15,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLabel: {
    fontSize: 18,
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scheduleTextContainer: {
    flexDirection: 'column',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Ajuste para iOS
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
});

export default StudentDashboard;