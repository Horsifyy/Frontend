import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterStudentScreen from './src/screens/auth/RegisterStudentScreen';
import RegisterTeacherScreen from './src/screens/auth/RegisterTeacherScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import StudentHomeScreen from './src/screens/navigation/StudentHomeScreen';
import TeacherHomeScreen from './src/screens/navigation/TeacherHomeScreen';
import TeacherDashboardScreen from './src/screens/navigation/TeacherDashboardScreen';
import RegisterEvaluationScreen from './src/screens/evaluations/RegisterEvaluationScreen';
import GetMetricsScreen from './src/screens/evaluations/GetMetricsScreen';
import StudentDashboardScreen from './src/screens/navigation/StudentDashboardScreen';
import ProgressReportScreen from './src/screens/evaluations/ProgressReportScreen';
import EvaluationHistoryScreen from './src/screens/evaluations/EvaluationHistoryScreen';
import ScheduleClassScreen from './src/screens/schedule/ScheduleClassScreen';
import StudentClassesScreen from './src/screens/schedule/StudentClassesScreen ';
import ClassConfirmationScreen from './src/screens/schedule/ClassConfirmationScreen';
import StudentProfileScreen from './src/screens/profile/StudentProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import StudentListScreen from './src/screens/navigation/StudentListScreen';
import TeacherScheduleScreen from './src/screens/schedule/TeacherScheduleScreen';
import TeacherProfileScreen from './src/screens/profile/TeacherProfileScreen';
import EditTeacherProfileScreen from './src/screens/profile/EditTeacherProfileScreen';
import RewardsScreen from './src/screens/rewards/RewardsScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} />
        <Stack.Screen name="RegisterTeacher" component={RegisterTeacherScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
        <Stack.Screen name="RegisterEvaluation" component={RegisterEvaluationScreen} />
        <Stack.Screen name="GetMetrics" component={GetMetricsScreen} />
        <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
        <Stack.Screen name="ProgressReport" component={ProgressReportScreen} />
        <Stack.Screen name="EvaluationHistory" component={EvaluationHistoryScreen} />
        <Stack.Screen name="ScheduleClass" component={ScheduleClassScreen} />
        <Stack.Screen name="StudentClasses" component={StudentClassesScreen} />
        <Stack.Screen name="ClassConfirmation" component={ClassConfirmationScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="StudentList" component={StudentListScreen} />
        <Stack.Screen name="TeacherSchedule" component={TeacherScheduleScreen} />
        <Stack.Screen name="TeacherProfileScreen" component={TeacherProfileScreen} />
        <Stack.Screen name="EditTeacherProfileScreen" component={EditTeacherProfileScreen} />
        <Stack.Screen name="RewardsScreen" component={RewardsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;