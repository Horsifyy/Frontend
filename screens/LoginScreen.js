import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [role, setRole] = useState<'estudiante' | 'docente'>('estudiante');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Inicio de sesión exitoso');
      // Aquí puedes redirigir a la pantalla principal
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <Text className="text-2xl font-bold mb-4">¡Bienvenid@!</Text>

      {/* Selector de Rol */}
      <View className="flex-row mb-4">
        <TouchableOpacity onPress={() => setRole('estudiante')} className={`p-2 mx-1 rounded ${role === 'estudiante' ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <Text className="text-white">Estudiante</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('docente')} className={`p-2 mx-1 rounded ${role === 'docente' ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <Text className="text-white">Docente</Text>
        </TouchableOpacity>
      </View>

      {/* Campos de Entrada */}
      <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      {/* Botón de Recuperar Contraseña */}
      <TouchableOpacity onPress={() => navigation.navigate('Recuperar')}>
        <Text className="text-blue-500 text-sm">¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Botones */}
      <TouchableOpacity onPress={handleLogin} className="bg-black p-3 rounded my-2 w-full">
        <Text className="text-white text-center">Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')} className="bg-gray-800 p-3 rounded w-full">
        <Text className="text-white text-center">Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
