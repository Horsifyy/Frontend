import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../../api/config';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (response.status === 200) {
        Alert.alert("Éxito", "Tu contraseña ha sido actualizada.");
        navigation.navigate("Login"); 
      } else {
        throw new Error(data.error || "Error al recuperar la contraseña.");
      }
    } catch (error) {
      console.error("Error en la recuperación de contraseña:", error);
      Alert.alert("Error", error.message);
    }
  };

 return (
    <View style={styles.container}>
      <View style={styles.topShape} />

      <View style={styles.content}>
        <Text style={styles.title}>Recuperar Contraseña</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu correo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nueva Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Actualizar Contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomShape} />
    </View>
  );
};

export default ForgotPasswordScreen;

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
    height: '22%',
    backgroundColor: '#2B8C96',
    borderBottomLeftRadius: 110,
  },
  bottomShape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '60%',
    height: '20%',
    backgroundColor: '#2B8C96',
    borderTopRightRadius: 110,
  },
  content: {
    flex: 1,
    padding: 35,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 13,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 17,
    borderRadius: 15,
    color: '#333',
  },
  updateButton: {
    left: 70,
    backgroundColor: '#333333',
    padding: 13,
    borderRadius: 18,
    marginBottom: 20,
    width: '60%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  backText: {
    color: '#2B8C96',
    textAlign: 'center',
    fontSize: 16,
  },
});