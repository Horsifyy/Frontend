import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterStudentScreen from './src/screens/auth/RegisterStudentScreen';
import RegisterTeacherScreen from './src/screens/auth/RegisterTeacherScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} />
        <Stack.Screen name="RegisterTeacher" component={RegisterTeacherScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;