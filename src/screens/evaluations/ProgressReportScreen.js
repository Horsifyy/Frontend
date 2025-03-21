import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BarChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';

const ProgressReport = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width - 40; // Margen total de 40

  // Datos del usuario
  const userData = {
    name: 'Carlos Paz',
    level: 'Amarillo',
    score: '16,54',
  };

  const chartData = {
    labels: [
      'Control del caballo',
      'Postura',
      'Movimientos corporales',
      'Control de la respiración',
    ],
    datasets: [
      {
        data: [20, 19, 14, 18],
        colors: [
          (opacity = 1) => '#4abebd',
          (opacity = 1) => '#4abebd',
          (opacity = 1) => '#4abebd',
          (opacity = 1) => '#4abebd',
        ],
      },
    ],
  };

  const progressCategories = [
    {name: 'Sobresaliente', color: '#4abebd'},
    {name: 'Logrado', color: '#4cd97b'},
    {name: 'En Proceso', color: '#f7e986'},
    {name: 'Principiante', color: '#f7bb6c'},
    {name: 'No hay progreso', color: '#d9d9d9'},
  ];

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'white',
    backgroundGradientTo: 'white',
    decimalPlaces: 0,
    color: (opacity = 1) => '#4abebd',
    labelColor: (opacity = 1) => '#333333',
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeWidth: 0,
    },
  };

  const navigateToPreviousEvaluations = () => {
    console.log('Navegando a Evaluaciones previas');
  };

  const navigateToHome = () => {
    console.log('Navegando a Home');
  };

  const navigateToProfile = () => {
    console.log('Navegando a Perfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Nivel: {userData.level}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{userData.score}</Text>
              </View>
            </View>
          </View>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {userData.name.charAt(0)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.categoriesContainer}>
          {progressCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View
                style={[styles.categoryDot, {backgroundColor: category.color}]}
              />
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Visualización del progreso</Text>

        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showValuesOnTopOfBars
            withHorizontalLabels={false}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
          <View style={styles.customLabelsContainer}>
            <Text style={styles.customLabel}>Control del{'\n'}caballo</Text>
            <Text style={styles.customLabel}>Postura</Text>
            <Text style={styles.customLabel}>Movimientos{'\n'}corporales</Text>
            <Text style={styles.customLabel}>
              Control de la{'\n'}respiración
            </Text>
          </View>
        </View>
        <View style={styles.classImageContainer}>
          <Text style={styles.classImageTitle}>Imagen de la clase</Text>
        </View>
        <TouchableOpacity
          style={styles.previousEvaluationsButton}
          onPress={navigateToPreviousEvaluations}
          activeOpacity={0.8}>
          <Icon name="clipboard-text-outline" size={24} color="#fff" />
          <Text style={styles.previousEvaluationsText}>
            Evaluaciones previas
          </Text>
          <Icon name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  levelLabel: {
    fontSize: 16,
    color: '#333333',
    marginRight: 10,
  },
  scoreContainer: {
    backgroundColor: '#ff7b7b',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: '#f0fcfc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
  },
  customLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  customLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    width: '25%',
  },
  classImageContainer: {
    backgroundColor: '#e0f7f7',
    borderRadius: 10,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  classImageTitle: {
    fontSize: 16,
    color: '#333333',
  },
  previousEvaluationsButton: {
    backgroundColor: '#4abebd',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previousEvaluationsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginLeft: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
});

export default ProgressReport;
