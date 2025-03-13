import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';

const RegisterTeacher = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    try {
        console.log("Iniciando registro de docente...");

        // Validar que todos los campos sean obligatorios
        if (!name || !email || !password) {
            Alert.alert("Error", "Por favor completa todos los campos.");
            return;
        }

        // Crear usuario en Firebase Authentication
        const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
        const user = userCredential.user;
        const idToken = await user.getIdToken(true);

        console.log(`Usuario docente creado en Firebase Auth con UID: ${user.uid}`);

        // Enviar datos al backend
        const response = await fetch(`${API_URL}/api/auth/register/teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                name,
                email,
                role: "Docente",
            }),
        });

        const data = await response.json();
      Alert.alert("Registro exitoso", "Tu cuenta ha sido creada.");
      navigation.navigate('Login');

    } catch (error) {
      console.error("Error en el registro:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topShape} />

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ingresa tu nombre"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu email"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomShape} />
    </View>
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
  registerButton: {
    left: 70,
    backgroundColor: '#333333',
    padding: 13,
    borderRadius: 18,
    width: '60%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default RegisterTeacher;