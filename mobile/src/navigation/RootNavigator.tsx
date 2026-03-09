import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CaseListScreen } from '../screens/CaseListScreen';
import { CreateCaseScreen } from '../screens/CreateCaseScreen';
import { CreateProxyCaseScreen } from '../screens/CreateProxyCaseScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="CaseList" component={CaseListScreen} />
    <Stack.Screen name="CreateCase" component={CreateCaseScreen} />
    <Stack.Screen name="CreateProxyCase" component={CreateProxyCaseScreen} />
  </Stack.Navigator>
);
