import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert, Platform, Modal, TextInput, RefreshControl} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import {fetchDetails, refreshSchedule} from '../redux/detailsSlice';
import {bookItem} from '../redux/bookingsSlice';
import {Feather} from '@expo/vector-icons';

export default function DetailsScreen({route}) {
  const passed = route.params?.item;
  const id = passed?.id || route.params?.id;
  const [item, setItem] = useState(passed || null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
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
  const [selectedScheduleForMap, setSelectedScheduleForMap] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  // Refresh schedule data on demand
  const handleRefreshSchedule = useCallback(async () => {
    if (!item || !item.raw) return;
    try {
      setScheduleLoading(true);
      const action = await dispatch(refreshSchedule({id, raw: item.raw}));
      if (action.payload && action.payload.schedule) {
        setItem((prev) => ({...prev, schedule: action.payload.schedule}));
        Alert.alert('Success', 'Schedule updated');
      }
    } catch (e) {
      Alert.alert('Update failed', e.message || 'Could not refresh schedule');
    } finally {
      setScheduleLoading(false);
    }
  }, [item, id, dispatch]);

  // Pull to refresh entire details
  const onRefresh = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const action = await dispatch(fetchDetails(id));
      const details = action.payload;
      if (details) setItem((prev) => ({...(prev || {}), ...details}));
    } catch (e) {
      Alert.alert('Refresh failed', e.message || 'Unable to refresh');
    } finally {
      setRefreshing(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    let mounted = true;

    // If there is a cached detail, use it immediately
    if (cached) {
      setItem((prev) => ({...(prev || {}), ...cached}));
    }

    async function load() {
      if (!id) return;
      // If the passed item already contains coordinates or stops/schedule, prefer that and skip detail fetch
      const hasLocalData = passed && (passed.latitude || passed.longitude || (passed.stops && passed.stops.length > 0) || (passed.schedule && passed.schedule.length > 0));
      if (hasLocalData) {
        // no remote fetch necessary (quick UI) — still keep cached merge above
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // dispatch Redux thunk to fetch + cache details (only when necessary)
        const action = await dispatch(fetchDetails(id));
        const details = action.payload;
        if (mounted && details) {
          setItem((prev) => ({...(prev || {}), ...details}));
        } else if (mounted && !details) {
          setError('No details available for this item');
        }
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
  }, [id, cached, dispatch, passed]);

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
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <Image source={{uri: item.thumbnail || item.images?.[0]}} style={styles.image} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[styles.badge, {backgroundColor: item.status === 'Active' ? '#34C759' : item.status === 'Popular' ? '#ff9500' : '#0a84ff'}]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{item.description}</Text>

      {/* Show technical identifiers and source info from raw API object if available */}
      {item.raw ? (
        <View style={{marginTop: 12}}>
          <Text style={{fontWeight: '700', marginBottom: 6}}>Details</Text>
          {item.raw.atcocode ? <Text style={styles.meta}>ATCO code: {item.raw.atcocode}</Text> : null}
          {item.raw.station_code ? <Text style={styles.meta}>Station code: {item.raw.station_code}</Text> : null}
          {item.raw.tiploc_code ? <Text style={styles.meta}>Tiploc: {item.raw.tiploc_code}</Text> : null}
          {item.raw.osm_id ? <Text style={styles.meta}>OSM: {item.raw.osm_id}</Text> : null}
          {item.raw.description && item.raw.description !== item.description ? <Text style={styles.meta}>{item.raw.description}</Text> : null}
        </View>
      ) : null}

      {item.type ? <Text style={styles.meta}>Type: {item.type}</Text> : null}

      {loading ? (
        <View style={{marginTop: 12}}>
          <ActivityIndicator />
        </View>
      ) : null}

      {error ? (
        <Text style={{color: '#ff3b30', marginTop: 12}}>{error}</Text>
      ) : null}

      {item.schedule || scheduleLoading ? (
        <View style={{width: '100%', marginTop: 16}}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <TouchableOpacity 
              onPress={handleRefreshSchedule} 
              disabled={scheduleLoading}
              style={styles.refreshBtn}
            >
              {scheduleLoading ? (
                <ActivityIndicator size="small" color="#0a7ea4" />
              ) : (
                <Feather name="refresh-cw" size={18} color="#0a7ea4" />
              )}
            </TouchableOpacity>
          </View>
          {item.schedule && item.schedule.length > 0 ? (
            item.schedule.map((s, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.scheduleRow, selectedScheduleForMap?.time === s.time ? styles.scheduleRowSelected : null]}
                onPress={() => {
                  // Mock destination coordinates (offset from origin)
                  if (item.latitude && item.longitude) {
                    const destCoords = {
                      latitude: item.latitude + (Math.random() * 0.02 - 0.01),
                      longitude: item.longitude + (Math.random() * 0.02 - 0.01),
                    };
                    setSelectedScheduleForMap({...s, destination_coords: destCoords});
                  }
                }}
              >
                <View style={styles.scheduleTimeBox}>
                  <Text style={styles.scheduleTime}>{s.time || s.aimed_departure_time || s.departure_time || '-'}</Text>
                  {s.platform ? <Text style={styles.platformText}>Plat {s.platform}</Text> : null}
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.scheduleDest}>{s.dest || s.destination_name || s.to || '-'}</Text>
                  {s.operator ? <Text style={styles.scheduleOperator}>via {s.operator}</Text> : null}
                  {s.status && s.status.toLowerCase() !== 'on time' ? (
                    <Text style={styles.scheduleStatus}>{s.status}</Text>
                  ) : null}
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  {s.expected_departure_time && s.expected_departure_time !== s.time && s.expected_departure_time !== s.aimed_departure_time ? (
                    <View style={styles.delayBadge}>
                      <Text style={styles.delayText}>Delayed</Text>
                    </View>
                  ) : s.status && s.status.toLowerCase() === 'on time' ? (
                    <View style={[styles.delayBadge, {backgroundColor: '#34C759'}]}>
                      <Text style={styles.delayText}>On Time</Text>
                    </View>
                  ) : null}
                  <Feather name="map-pin" size={14} color="#999" style={{marginTop: 4}} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noData}>No schedule data available</Text>
          )}
        </View>
      ) : null}

      {/* Enhanced Map Section with Route and Destinations */}
      {(item.latitude && item.longitude) || (item.stops && item.stops.length > 0) ? (
        <View style={{width: '100%', marginTop: 16}}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Route & Location</Text>
            {selectedScheduleForMap ? (
              <TouchableOpacity onPress={() => setSelectedScheduleForMap(null)} style={styles.clearMapBtn}>
                <Text style={styles.clearMapText}>Show All</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Map showing route and destinations */}
          {item.stops && item.stops.some((s) => s.latitude && s.longitude) ? (
            <MapView
              style={{width: '100%', height: 280, borderRadius: 12, marginBottom: 8}}
              initialRegion={mapRegion || {
                latitude: item.stops[0].latitude,
                longitude: item.stops[0].longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              onRegionChangeComplete={setMapRegion}
            >
              {/* Origin marker (current stop/station) */}
              <Marker 
                coordinate={{latitude: item.stops[0].latitude, longitude: item.stops[0].longitude}} 
                title={item.title}
                description="Current Location"
                pinColor="#0a84ff"
              />
              
              {/* Other stops along the route */}
              {item.stops.slice(1).map((s, idx) => (
                <Marker 
                  key={idx} 
                  coordinate={{latitude: s.latitude, longitude: s.longitude}} 
                  title={s.name}
                  description={`Stop ${idx + 2}`}
                  pinColor="#34C759"
                />
              ))}
              
              {/* Destination markers from schedule */}
              {selectedScheduleForMap && selectedScheduleForMap.destination_coords ? (
                <Marker
                  coordinate={selectedScheduleForMap.destination_coords}
                  title={selectedScheduleForMap.dest}
                  description={`Arrives: ${selectedScheduleForMap.time}`}
                  pinColor="#ff3b30"
                />
              ) : null}
            </MapView>
          ) : item.latitude && item.longitude ? (
            // Single location map
            <MapView
              style={{width: '100%', height: 280, borderRadius: 12, marginBottom: 8}}
              initialRegion={{
                latitude: item.latitude,
                longitude: item.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <Marker 
                coordinate={{latitude: item.latitude, longitude: item.longitude}} 
                title={item.title}
                description="Current Location"
                pinColor="#0a84ff"
              />
            </MapView>
          ) : (
            // Fallback: list stops as text if coordinates not available
            <View style={{padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8}}>
              {(item.stops || []).map((s, idx) => (
                <Text key={idx} style={styles.stopItem}>• {s.name}</Text>
              ))}
            </View>
          )}
          
          {/* Map Legend */}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#0a84ff'}]} />
              <Text style={styles.legendText}>Current Stop</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#34C759'}]} />
              <Text style={styles.legendText}>Route Stops</Text>
            </View>
            {selectedScheduleForMap ? (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#ff3b30'}]} />
                <Text style={styles.legendText}>Destination</Text>
              </View>
            ) : null}
          </View>

          {/* Actions: Book / Directions */}
          <View style={{flexDirection: 'row', marginTop: 16, width: '100%', justifyContent: 'space-between'}}>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: '#0a84ff'}]}
              onPress={() => {
                if (!user) {
                  Alert.alert('Login required', 'Please log in to book');
                  return;
                }
                // open interactive booking modal
                setPassengerName(user?.firstName || user?.username || '');
                setSeats(1);
                setSelectedScheduleIndex(0);
                setBookingModalVisible(true);
              }}
            >
              <Feather name="calendar" size={18} color="white" style={{marginRight: 6}} />
              <Text style={[styles.actionText, {color: 'white'}]}>Book Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: '#34C759'}]}
              onPress={() => {
                // Open directions to first stop or fallback to item's coordinates
                let lat = null;
                let lon = null;
                if (item.stops && item.stops[0] && item.stops[0].latitude && item.stops[0].longitude) {
                  lat = item.stops[0].latitude;
                  lon = item.stops[0].longitude;
                } else if (item.latitude && item.longitude) {
                  lat = item.latitude;
                  lon = item.longitude;
                }

                if (!lat || !lon) {
                  Alert.alert('No coordinates', 'No coordinates available for directions');
                  return;
                }

                const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=transit`;
                Linking.openURL(url).catch(() => {
                  Alert.alert('Unable to open maps');
                });
              }}
            >
              <Feather name="navigation" size={18} color="white" style={{marginRight: 6}} />
              <Text style={[styles.actionText, {color: 'white'}]}>Get Directions</Text>
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
  container: {padding: 16, backgroundColor: '#f8f9fa', alignItems: 'flex-start'},
  image: {width: '100%', height: 240, borderRadius: 12, marginBottom: 16, backgroundColor: '#e0e0e0'},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'},
  title: {fontSize: 24, fontWeight: '800', marginBottom: 8, flex: 1, color: '#1a1a1a'},
  badge: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14},
  badgeText: {color: 'white', fontWeight: '700', fontSize: 11, textTransform: 'uppercase'},
  desc: {fontSize: 16, color: '#555', marginTop: 8, lineHeight: 24},
  meta: {fontSize: 14, color: '#666', marginTop: 8},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: '#1a1a1a'},
  refreshBtn: {padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0'},
  scheduleRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e8e8e8', backgroundColor: '#fff', paddingHorizontal: 12, borderRadius: 8, marginBottom: 6},
  scheduleRowSelected: {backgroundColor: '#e3f2fd', borderColor: '#0a84ff', borderWidth: 2},
  scheduleTimeBox: {backgroundColor: '#0a7ea4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 12},
  scheduleTime: {fontWeight: '700', fontSize: 15, color: '#fff'},
  scheduleDest: {fontSize: 15, fontWeight: '600', color: '#1a1a1a'},
  scheduleOperator: {fontSize: 12, color: '#999', marginTop: 2},
  delayBadge: {backgroundColor: '#ff3b30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
  delayText: {color: 'white', fontSize: 10, fontWeight: '700'},
  noData: {color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 12},
  stopItem: {paddingVertical: 4, color: '#444'},
  actionButton: {flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#eee', alignItems: 'center', marginRight: 8, flexDirection: 'row', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4},
  actionText: {fontWeight: '700', fontSize: 15},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center'},
  modalContent: {width: '90%', backgroundColor: 'white', padding: 16, borderRadius: 12},
  modalTitle: {fontSize: 18, fontWeight: '800', marginBottom: 8},
  input: {borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, backgroundColor: '#fff'},
  seatBtn: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center'},
  scheduleChip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f2f2f2', marginRight: 8, marginBottom: 8},
  scheduleChipActive: {backgroundColor: '#0a84ff'},
  modalButton: {flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8},
  modalButtonPrimary: {backgroundColor: '#0a84ff'},
  mapLegend: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#f8f9fa', borderRadius: 8, marginTop: 8},
  legendItem: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 6},
  legendText: {fontSize: 12, color: '#666'},
  clearMapBtn: {backgroundColor: '#0a84ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16},
  clearMapText: {color: 'white', fontSize: 12, fontWeight: '600'},
});