import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = ({ navigation }) => {
  const [role, setRole] = useState<'estudiante' | 'docente'>('estudiante');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extraField, setExtraField] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      await firestore().collection('users').doc(userId).set({
        name,
        email,
        role,
        [role === 'estudiante' ? 'clubEcuestre' : 'especialidad']: extraField,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-5">
      <Text className="text-2xl font-bold mb-4">Registro</Text>

      {/* Selector de Rol */}
      <View className="flex-row mb-4">
        <TouchableOpacity onPress={() => setRole('estudiante')} className={`p-2 mx-1 rounded ${role === 'estudiante' ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <Text className="text-white">Estudiante</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('docente')} className={`p-2 mx-1 rounded ${role === 'docente' ? 'bg-blue-500' : 'bg-gray-300'}`}>
          <Text className="text-white">Docente</Text>
        </TouchableOpacity>
      </View>

      {/* Campos Comunes */}
      <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      {/* Campos Específicos */}
      {role === 'estudiante' && (
        <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Club Ecuestre" value={extraField} onChangeText={setExtraField} />
      )}
      {role === 'docente' && (
        <TextInput className="border p-2 w-full mb-2 rounded" placeholder="Especialidad" value={extraField} onChangeText={setExtraField} />
      )}

      <TouchableOpacity onPress={handleRegister} className="bg-black p-3 rounded my-2 w-full">
        <Text className="text-white text-center">Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="bg-gray-800 p-3 rounded w-full">
        <Text className="text-white text-center">Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
