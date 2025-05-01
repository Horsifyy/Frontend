import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, styles, ScrollView, ActivityIndicator, Alert } from 'react-native';
import {API_URL} from '../../api/config'; // Asegúrate de que esta ruta sea correcta según tu proyecto


const PreviousEvaluationsScreen = ({ route }) => {
  const { studentId } = route.params; // Recibimos el studentId desde la ruta
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

   // Crear la función con useCallback para evitar que cambie en cada renderizado
   const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
        const response = await fetch(`${API_URL}/api/evaluations/students/${studentId}/evaluations`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error del servidor:", errorText);
          throw new Error("Error fetching evaluations: " + errorText);
        }
  
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          const errorText = await response.text();
          console.error("La respuesta no es JSON válido:", errorText);
          throw new Error("La respuesta no es un JSON válido");
        }
  
        const data = await response.json();
        setEvaluations(data);
  
      } catch (error) {
        console.error("Error fetching evaluations:", error.message);
      } finally {
        setLoading(false);
      }
    }, [studentId]);
  
    useEffect(() => {
      if (studentId) {
        fetchEvaluations();
      } else {
        console.error("studentId no definido");
      }
    }, [studentId, fetchEvaluations]);
  
    if (loading) {
      return <ActivityIndicator size="large" color="#1d8a9e" />;
    }
  
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Historial de Evaluaciones</Text>
        {evaluations.length > 0 ? (
          evaluations.map((evaluation, index) => (
            <View key={index} style={styles.evaluationCard}>
              <Text style={styles.dateText}>{evaluation.formattedDate || "Fecha no disponible"}</Text>
              <Text style={styles.lupeLevelText}>{evaluation.lupeLevel}</Text>
              <Text>{evaluation.exercises}</Text>
              <Text>{evaluation.comments}</Text>
            </View>
          ))
        ) : (
          <Text>No hay evaluaciones disponibles.</Text>
        )}
      </ScrollView>
    );
  };