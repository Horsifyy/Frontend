import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo electrónico.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Correo enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <Text className="text-2xl font-bold mb-4">Recuperar Contraseña</Text>

      {/* Campo de Email */}
      <TextInput
        className="border p-2 w-full mb-2 rounded"
        placeholder="Ingresa tu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Botón para enviar email de recuperación */}
      <TouchableOpacity onPress={handlePasswordReset} className="bg-black p-3 rounded my-2 w-full">
        <Text className="text-white text-center">Enviar Instrucciones</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="bg-gray-800 p-3 rounded w-full">
        <Text className="text-white text-center">Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;
