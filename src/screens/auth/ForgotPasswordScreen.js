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
      <Text style={styles.title}>Recuperar Contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu nueva contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Actualizar Contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backText: {
    color: '#007AFF',
    marginTop: 15,
  },
});
