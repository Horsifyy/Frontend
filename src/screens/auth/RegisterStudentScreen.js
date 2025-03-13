import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { API_URL } from '../../api/config';

const RegisterStudent = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lupeLevel, setLupeLevel] = useState('Seleccionar nivel');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const levels = ['Amarillo', 'Azul', 'Rojo'];

  const handleRegister = async () => {
    try {
        console.log("Iniciando registro de estudiante...");

        // Validar que todos los campos sean obligatorios
        if (!name || !email || !password || lupeLevel === "Seleccionar nivel") {
            Alert.alert("Error", "Por favor completa todos los campos.");
            return;
        }

        // Crear usuario en Firebase Authentication
        const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
        const user = userCredential.user;
        const idToken = await user.getIdToken(true);

        console.log(`Usuario estudiante creado en Firebase Auth con UID: ${user.uid}`);

        // Enviar datos al backend
        const response = await fetch(`${API_URL}/api/auth/register/student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                name,
                email,
                role: "Estudiante",
                lupeLevel  
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nivel método LUPE?</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{lupeLevel}</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomShape} />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={levels}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setLupeLevel(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  dropdownText: {
    color: '#999',
  },
  registerButton: {
    left: 70,
    backgroundColor: '#333333',
    padding: 13,
    borderRadius: 18,
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  modalItem: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#2B8C96',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterStudent;