import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert, Platform, Modal, TextInput} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import {fetchDetails} from '../redux/detailsSlice';
import {bookItem} from '../redux/bookingsSlice';

export default function DetailsScreen({route}) {
  const passed = route.params?.item;
  const id = passed?.id || route.params?.id;
  const [item, setItem] = useState(passed || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const cached = useSelector((s) => (id ? s.details.cache[id] : null));
  const user = useSelector((s) => s.auth.user);
  const bookingState = useSelector((s) => s.bookings || {bookings: [], loading: false});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [passengerName, setPassengerName] = useState(user?.firstName || user?.username || '');
  const [seats, setSeats] = useState(1);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const [lastBooking, setLastBooking] = useState(null);

  useEffect(() => {
    let mounted = true;

    // If there is a cached detail, use it immediately
    if (cached) {
      setItem((prev) => ({...(prev || {}), ...cached}));
    }

    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        // dispatch Redux thunk to fetch + cache details
        const action = await dispatch(fetchDetails(id));
        const details = action.payload;
        if (mounted && details) setItem((prev) => ({...(prev || {}), ...details}));
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load details');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Fetch updated details in background (will use cache if available)
    load();

    return () => {
      mounted = false;
    };
  }, [id, cached, dispatch]);

  if (!item && loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>No details available.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
      <Image source={{uri: item.thumbnail || item.images?.[0]}} style={styles.image} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[styles.badge, {backgroundColor: item.status === 'Active' ? '#34C759' : item.status === 'Popular' ? '#ff9500' : '#0a84ff'}]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{item.description}</Text>

      {item.type ? <Text style={styles.meta}>Type: {item.type}</Text> : null}

      {loading ? (
        <View style={{marginTop: 12}}>
          <ActivityIndicator />
        </View>
      ) : null}

      {error ? (
        <Text style={{color: '#ff3b30', marginTop: 12}}>{error}</Text>
      ) : null}

      {item.schedule ? (
        <View style={{width: '100%', marginTop: 16}}>
          <Text style={{fontWeight: '700', marginBottom: 8}}>Schedule</Text>
          {item.schedule.map((s, idx) => (
            <View key={idx} style={styles.scheduleRow}>
              <Text style={styles.scheduleTime}>{s.time}</Text>
              <Text style={styles.scheduleDest}>{s.dest}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {item.stops ? (
        <View style={{width: '100%', marginTop: 16}}>
          <Text style={{fontWeight: '700', marginBottom: 8}}>Stops</Text>

          {/* Map showing stops if coordinates available */}
          {item.stops.some((s) => s.latitude && s.longitude) ? (
            <MapView
              style={{width: '100%', height: 220, borderRadius: 8}}
              initialRegion={{
                latitude: item.stops[0].latitude,
                longitude: item.stops[0].longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              {item.stops.map((s, idx) => (
                <Marker key={idx} coordinate={{latitude: s.latitude, longitude: s.longitude}} title={s.name} />
              ))}
            </MapView>
          ) : (
            item.stops.map((s, idx) => <Text key={idx} style={styles.stopItem}>• {s.name}</Text>)
          )}

          {/* Actions: Book / Directions */}
          <View style={{flexDirection: 'row', marginTop: 12, width: '100%', justifyContent: 'space-between'}}>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: '#0a84ff'}]}
              onPress={() => {
                // open interactive booking modal
                setPassengerName(user?.firstName || user?.username || '');
                setSeats(1);
                setSelectedScheduleIndex(0);
                setBookingModalVisible(true);
              }}
            >
              <Text style={[styles.actionText, {color: 'white'}]}>Book</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: '#0a84ff'}]}
              onPress={() => {
                // Open directions to first stop
                const s = item.stops[0];
                if (!s || !s.latitude || !s.longitude) {
                  Alert.alert('No coordinates', 'No coordinates available for directions');
                  return;
                }
                const lat = s.latitude;
                const lon = s.longitude;
                const label = encodeURIComponent(s.name || item.title || 'Destination');
                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
                Linking.openURL(url).catch(() => {
                  Alert.alert('Unable to open maps');
                });
              }}
            >
              <Text style={[styles.actionText, {color: 'white'}]}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScrollView>
    {/* Booking modal */}
    <Modal visible={bookingModalVisible} transparent animationType="slide" onRequestClose={() => setBookingModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book: {item.title}</Text>

          {item.schedule && item.schedule.length > 0 ? (
            <View style={{marginBottom: 8}}>
              <Text style={{fontWeight: '700', marginBottom: 6}}>Choose schedule</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {item.schedule.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedScheduleIndex(idx)}
                    style={[styles.scheduleChip, selectedScheduleIndex === idx ? styles.scheduleChipActive : null]}
                  >
                    <Text style={selectedScheduleIndex === idx ? {color: 'white', fontWeight: '700'} : {}}>{s.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <Text style={{fontWeight: '700', marginBottom: 6}}>Passenger name</Text>
          <TextInput value={passengerName} onChangeText={setPassengerName} placeholder="Name" style={styles.input} />

          <Text style={{fontWeight: '700', marginTop: 8}}>Seats</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
            <TouchableOpacity onPress={() => setSeats(Math.max(1, seats - 1))} style={styles.seatBtn}><Text>-</Text></TouchableOpacity>
            <Text style={{marginHorizontal: 12, fontWeight: '700'}}>{seats}</Text>
            <TouchableOpacity onPress={() => setSeats(seats + 1)} style={styles.seatBtn}><Text>+</Text></TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', marginTop: 16}}>
            <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#eee'}]} onPress={() => setBookingModalVisible(false)}>
              <Text style={{fontWeight: '700'}}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={async () => {
                try {
                  setBookingLoading(true);
                  const schedule = item.schedule && item.schedule[selectedScheduleIndex] ? item.schedule[selectedScheduleIndex] : null;
                  const payload = {itemId: id, user: {...(user || {}), passengerName, seats, schedule}};
                  const action = await dispatch(bookItem(payload));
                  const booking = action.payload;
                  setBookingLoading(false);
                  setBookingModalVisible(false);
                  setLastBooking(booking);
                  if (booking && booking.confirmationCode) {
                    Alert.alert('Booking confirmed', `Code: ${booking.confirmationCode}`);
                  } else {
                    Alert.alert('Booked', `You booked ${item.title}`);
                  }
                } catch (e) {
                  setBookingLoading(false);
                  Alert.alert('Booking failed', e.message || 'Unable to complete booking');
                }
              }}
            >
              {bookingLoading ? <ActivityIndicator color="white" /> : <Text style={{color: 'white', fontWeight: '700'}}>Confirm</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

// Booking modal component is rendered inside DetailsScreen file via state; below are styles for modal elements.


const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: '#fff', alignItems: 'flex-start'},
  image: {width: '100%', height: 220, borderRadius: 8, marginBottom: 12},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 8, flex: 1},
  badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12},
  badgeText: {color: 'white', fontWeight: '700'},
  desc: {fontSize: 16, color: '#444', marginTop: 8},
  meta: {fontSize: 14, color: '#666', marginTop: 8},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scheduleRow: {flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
  scheduleTime: {width: 80, fontWeight: '700'},
  scheduleDest: {flex: 1},
  stopItem: {paddingVertical: 4, color: '#444'},
  actionButton: {flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center', marginRight: 8},
  actionText: {fontWeight: '700'},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center'},
  modalContent: {width: '90%', backgroundColor: 'white', padding: 16, borderRadius: 12},
  modalTitle: {fontSize: 18, fontWeight: '800', marginBottom: 8},
  input: {borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, backgroundColor: '#fff'},
  seatBtn: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'},
  scheduleChip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f2f2f2', marginRight: 8, marginBottom: 8},
  scheduleChipActive: {backgroundColor: '#0a84ff'},
  modalButton: {flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8},
  modalButtonPrimary: {backgroundColor: '#0a84ff'},
});