import React, {useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {loadBookings} from '../redux/bookingsSlice';

export default function RecentBookingsScreen() {
  const dispatch = useDispatch();
  const bookings = useSelector((s) => s.bookings.bookings || []);

  useEffect(() => {
    dispatch(loadBookings());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={styles.code}>{item.confirmationCode}</Text>
            <Text style={styles.meta}>{item.itemId} • {item.bookedAt ? new Date(item.bookedAt).toLocaleString() : ''}</Text>
          </View>
        )}
        ListEmptyComponent={() => <Text style={{color: '#666'}}>No bookings yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 12},
  row: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
  code: {fontWeight: '700'},
  meta: {color: '#666', marginTop: 4},
});
