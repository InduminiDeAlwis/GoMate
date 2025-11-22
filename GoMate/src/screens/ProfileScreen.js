import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../redux/authSlice';
import {setTheme} from '../redux/themeSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.theme.mode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Username</Text>
      <Text style={styles.value}>{user?.username ?? '—'}</Text>

      <View style={styles.rowSpaced}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={theme === 'dark'} onValueChange={(v) => dispatch(setTheme(v ? 'dark' : 'light'))} />
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => dispatch(logout())}>
        <Text style={{color: 'white', fontWeight: '600'}}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  title: {fontSize: 28, fontWeight: '700', marginBottom: 12},
  label: {fontSize: 14, color: '#666'},
  value: {fontSize: 18, marginBottom: 12},
  logout: {backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 24},
  rowSpaced: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12},
});
