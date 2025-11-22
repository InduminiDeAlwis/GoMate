import React, {useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';
import AppNavigation from './src/navigation/AppNavigation';
import store from './src/redux/store';
import { loadFavorites } from './src/redux/itemsSlice';

function RootApp() {
  const systemScheme = useColorScheme();
  const dispatch = useDispatch();
  const themeMode = useSelector((s) => s.theme.mode);

  React.useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

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
