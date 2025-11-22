import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSelector} from 'react-redux';
import {Feather} from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: true}}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({color, size}) => <Feather name="heart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => <Feather name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const auth = useSelector((s) => s.auth);

  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      {!auth.isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{headerShown: false}} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{title: 'Details'}} />
        </>
      )}
    </Stack.Navigator>
  );
}
