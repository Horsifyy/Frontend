import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5000'; 

const App = () => {
    const [message, setMessage] = useState('Conectando...');

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error al conectar con el backend:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>{message}</Text>
            <Button title="Recargar" onPress={fetchData} />
        </View>
    );
};

export default App;
