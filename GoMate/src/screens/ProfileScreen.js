import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, FlatList, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {logout, updateProfile} from '../redux/authSlice';
import {setTheme} from '../redux/themeSlice';
import {loadBookings} from '../redux/bookingsSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.theme.mode);
  const bookings = useSelector((s) => s.bookings.bookings || []);
  const navigation = useNavigation();

  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [editingImage, setEditingImage] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  useEffect(() => {
    dispatch(loadBookings());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatarWrap}>
          {imageUrl ? (
            <Image source={{uri: imageUrl}} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{(user?.firstName || user?.username || 'U').slice(0,1).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={{flex: 1, marginLeft: 12}}>
          <Text style={styles.title}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'User'}</Text>
          <Text style={{color: '#666'}}>@{user?.username ?? '—'}</Text>
        </View>
      </View>
      {editingImage ? (
        <View style={{marginTop: 8}}>
          <TextInput placeholder="Image URL" value={imageUrl} onChangeText={setImageUrl} style={styles.input} />
          <View style={{flexDirection: 'row', marginTop: 8}}>
            <TouchableOpacity style={[styles.saveBtn, {flex: 1, marginRight: 8}]} onPress={() => setEditingImage(false)}>
              <Text style={{color: 'white', fontWeight: '700'}}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, {flex: 1, backgroundColor: '#ccc'}]} onPress={() => {setImageUrl(''); setEditingImage(false);}}>
              <Text style={{color: '#111', fontWeight: '700'}}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={{marginTop: 8}} onPress={() => setEditingImage(true)}>
          <Text style={{color: '#0a84ff', fontWeight: '700'}}>Edit Photo</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.label}>Username</Text>
      <Text style={styles.value}>{user?.username ?? '—'}</Text>

      <Text style={styles.label}>First name</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />

      <Text style={styles.label}>Last name</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />

      <View style={{flexDirection: 'row', marginTop: 12}}>
        <TouchableOpacity
          style={[styles.saveBtn, {flex: 1, marginRight: 8}]}
          onPress={() => dispatch(updateProfile({firstName: firstName.trim(), lastName: lastName.trim(), imageUrl: imageUrl || ''}))}
        >
          <Text style={{color: 'white', fontWeight: '700'}}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveBtn, {flex: 1, backgroundColor: '#ccc'}]} onPress={() => {setFirstName(user?.firstName || ''); setLastName(user?.lastName || '');}}>
          <Text style={{color: '#111', fontWeight: '700'}}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowSpaced}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={theme === 'dark'} onValueChange={(v) => dispatch(setTheme(v ? 'dark' : 'light'))} />
      </View>

      <Text style={[styles.title, {marginTop: 18}]}>Recent Bookings</Text>
      <FlatList data={bookings.slice(0,4)} keyExtractor={(b) => b.id} renderItem={({item}) => (
        <View style={styles.bookingRow}>
          <Text style={{fontWeight: '700'}}>{item.confirmationCode}</Text>
          <Text>{item.bookedAt ? new Date(item.bookedAt).toLocaleString() : ''}</Text>
        </View>
      )} ListEmptyComponent={() => <Text style={{color: '#666', marginTop: 8}}>No bookings yet.</Text>} />

      <TouchableOpacity style={[styles.saveBtn, {marginTop: 12}]} onPress={() => navigation.navigate('RecentBookings')}>
        <Text style={{color: 'white', fontWeight: '700'}}>View All Bookings</Text>
      </TouchableOpacity>

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
  input: {borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, backgroundColor: '#fff', marginTop: 6, marginBottom: 8},
  saveBtn: {backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center'},
  bookingRow: {paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between'},
});
