import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('Estudiante'); // Estado para la selección de usuario
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleLogin = async () => {
    try {

      if (!email || !isValidEmail(email)) {
        Alert.alert("Error", "Por favor ingresa un email válido.");
        return;
      }

      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      console.log("Usuario autenticado:", data);

      if (!data.user) {
        throw new Error("El backend no devolvió datos de usuario");
      }

      Alert.alert("Bienvenid@", `${data.user.name}`);
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      Alert.alert("Error", "No se pudo iniciar sesión");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topShape} />

      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenid@!</Text>

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'Estudiante' && styles.selectedUserType]}
            onPress={() => setUserType('Estudiante')}
          >
            <Text style={[styles.userTypeText, userType === 'Estudiante' && styles.selectedText]}>
              Estudiante
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'Docente' && styles.selectedUserType]}
            onPress={() => setUserType('Docente')}
          >
            <Text style={[styles.userTypeText, userType === 'Docente' && styles.selectedText]}>
              Docente
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() =>
          navigation.navigate(userType === 'Estudiante' ? 'RegisterStudent' : 'RegisterTeacher')
        }>
          <Text style={styles.buttonText}>Registrarse</Text>
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
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#E8E8E8',
  },
  selectedUserType: {
    backgroundColor: '#2B8C96',
  },
  userTypeText: {
    color: '#666',
    fontWeight: '600',
  },
  selectedText: {
    color: '#fff',
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
  forgotPassword: {
    color: '#2B8C96',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    left: 70,
    backgroundColor: '#333333',
    padding: 13,
    borderRadius: 18,
    marginBottom: 10,
    width: '60%',
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

export default LoginScreen;
