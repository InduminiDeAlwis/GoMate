import React, {useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation';
import SplashScreen from './src/components/SplashScreen';
import store from './src/redux/store';
import { loadFavorites } from './src/redux/itemsSlice';
import { registerForPushNotificationsAsync } from './src/services/notificationService';

function RootApp() {
  const systemScheme = useColorScheme();
  const dispatch = useDispatch();
  const themeMode = useSelector((s) => s.theme.mode);
  const [showSplash, setShowSplash] = useState(true);

  React.useEffect(() => {
    dispatch(loadFavorites());
    
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('✅ Push notifications enabled');
      }
    });
  }, [dispatch]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigation />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootApp />
    </Provider>
  );
}
