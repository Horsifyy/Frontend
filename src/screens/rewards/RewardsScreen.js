import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';

const RewardsScreen = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    fetchRewardsCatalog();
  }, []);

  const fetchRewardsCatalog = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const token = await currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/api/rewards/catalog`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al obtener catálogo');
      setRewards(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Usuario no autenticado');

      setRedeemingId(rewardId);
      const token = await currentUser.getIdToken(true);

      const response = await fetch(`${API_URL}/api/rewards/redeem`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: currentUser.uid,
          rewardId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al canjear recompensa');

      Alert.alert('Éxito', data.message);
      // Refrescar catálogo o puntos si es necesario
      fetchRewardsCatalog();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setRedeemingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.rewardCard}>
      <Text style={styles.rewardName}>{item.name}</Text>
      <Text style={styles.rewardDescription}>{item.description || 'Sin descripción'}</Text>
      <Text style={styles.pointsRequired}>Puntos requeridos: {item.pointsRequired}</Text>

      <TouchableOpacity
        style={styles.redeemButton}
        onPress={() => redeemReward(item.id)}
        disabled={redeemingId === item.id}
      >
        {redeemingId === item.id ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Canjear</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#106e7e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={rewards.length === 0 && styles.centered}
        ListEmptyComponent={<Text>No hay recompensas activas.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  rewardCard: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rewardName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#00695c' },
  rewardDescription: { fontSize: 14, marginBottom: 8, color: '#004d40' },
  pointsRequired: { fontSize: 16, marginBottom: 12, color: '#00796b' },
  redeemButton: {
    backgroundColor: '#00796b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default RewardsScreen;
