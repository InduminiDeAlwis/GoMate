import React, {useEffect, useRef} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSelector} from 'react-redux';
import {Feather} from '@expo/vector-icons';
import {Animated, View, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailsScreen from '../screens/DetailsScreen';
import RecentBookingsScreen from '../screens/RecentBookingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  return (
    <Tab.Navigator 
      initialRouteName="Home" 
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => {
            const scale = useRef(new Animated.Value(1)).current;
            
            useEffect(() => {
              Animated.spring(scale, {
                toValue: focused ? 1.2 : 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
              }).start();
            }, [focused]);
            
            return (
              <Animated.View style={[styles.iconContainer, {transform: [{scale}]}]}>
                {focused && (
                  <View style={styles.iconBg}>
                    <LinearGradient
                      colors={['#0a7ea4', '#1e90ff']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.gradient}
                    />
                  </View>
                )}
                <Feather name="map" color={focused ? '#fff' : color} size={size} />
              </Animated.View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => {
            const scale = useRef(new Animated.Value(1)).current;
            const rotate = useRef(new Animated.Value(0)).current;
            
            useEffect(() => {
              if (focused) {
                Animated.parallel([
                  Animated.spring(scale, {
                    toValue: 1.2,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                  }),
                  Animated.sequence([
                    Animated.timing(rotate, {
                      toValue: 1,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(rotate, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                  ]),
                ]).start();
              } else {
                Animated.spring(scale, {
                  toValue: 1,
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }).start();
              }
            }, [focused]);
            
            const rotateInterpolate = rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '15deg'],
            });
            
            return (
              <Animated.View style={[styles.iconContainer, {transform: [{scale}, {rotate: rotateInterpolate}]}]}>
                {focused && (
                  <View style={styles.iconBg}>
                    <LinearGradient
                      colors={['#ff6b6b', '#ff8e53']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.gradient}
                    />
                  </View>
                )}
                <Feather name="heart" color={focused ? '#fff' : color} size={size} />
              </Animated.View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => {
            const scale = useRef(new Animated.Value(1)).current;
            const spin = useRef(new Animated.Value(0)).current;
            
            useEffect(() => {
              if (focused) {
                Animated.parallel([
                  Animated.spring(scale, {
                    toValue: 1.2,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                  }),
                  Animated.timing(spin, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                  }),
                ]).start();
              } else {
                Animated.spring(scale, {
                  toValue: 1,
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }).start();
                spin.setValue(0);
              }
            }, [focused]);
            
            const spinInterpolate = spin.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            });
            
            return (
              <Animated.View style={[styles.iconContainer, {transform: [{scale}, {rotate: spinInterpolate}]}]}>
                {focused && (
                  <View style={styles.iconBg}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.gradient}
                    />
                  </View>
                )}
                <Feather name="compass" color={focused ? '#fff' : color} size={size} />
              </Animated.View>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBg: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerBadge: {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

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
          <Stack.Screen 
            name="Details" 
            component={DetailsScreen} 
            options={{
              title: 'Route Details',
              headerStyle: {
                backgroundColor: '#0a7ea4',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '800',
                fontSize: 18,
              },
              headerLeft: (props) => (
                <Animated.View style={{marginLeft: 8}}>
                  <Feather 
                    name="arrow-left" 
                    size={24} 
                    color="#fff" 
                    onPress={props.onPress}
                  />
                </Animated.View>
              ),
              headerRight: () => (
                <View style={{marginRight: 16, flexDirection: 'row', alignItems: 'center'}}>
                  <View style={styles.headerBadge}>
                    <Feather name="map-pin" size={16} color="#0a7ea4" />
                  </View>
                </View>
              ),
            }} 
          />
          <Stack.Screen 
            name="RecentBookings" 
            component={RecentBookingsScreen} 
            options={{
              title: 'My Bookings',
              headerStyle: {
                backgroundColor: '#0a7ea4',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '800',
                fontSize: 18,
              },
              headerLeft: (props) => (
                <Animated.View style={{marginLeft: 8}}>
                  <Feather 
                    name="arrow-left" 
                    size={24} 
                    color="#fff" 
                    onPress={props.onPress}
                  />
                </Animated.View>
              ),
              headerRight: () => (
                <View style={{marginRight: 16, flexDirection: 'row', alignItems: 'center'}}>
                  <View style={styles.headerBadge}>
                    <Feather name="ticket" size={16} color="#0a7ea4" />
                  </View>
                </View>
              ),
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
