import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert, Platform, Modal, TextInput, RefreshControl, Animated} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
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
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [successScale] = useState(new Animated.Value(0));
  const [successOpacity] = useState(new Animated.Value(0));
  const [checkmarkScale] = useState(new Animated.Value(0));

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

  // Animate modal appearance
  useEffect(() => {
    if (bookingModalVisible) {
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        })
      ]).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      pulseAnim.setValue(1);
    }
  }, [bookingModalVisible]);

  // Animate success modal
  useEffect(() => {
    if (successModalVisible) {
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Checkmark pop animation
      setTimeout(() => {
        Animated.spring(checkmarkScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5
        }).start();
      }, 200);
    } else {
      successScale.setValue(0);
      successOpacity.setValue(0);
      checkmarkScale.setValue(0);
    }
  }, [successModalVisible]);

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a7ea4" />
        }
      >
      {/* Hero Image with Gradient Overlay */}
      <View style={styles.heroContainer}>
        <Image source={{uri: item.thumbnail || item.images?.[0]}} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        />
        <View style={styles.heroContent}>
          <View style={[styles.badge, {backgroundColor: item.status === 'Active' ? '#34C759' : item.status === 'Popular' ? '#ff9500' : '#0a84ff'}]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
      <View style={styles.descriptionCard}>
        <View style={styles.cardHeader}>
          <Feather name="info" size={20} color="#0a7ea4" style={{marginRight: 8}} />
          <Text style={styles.cardTitle}>About this location</Text>
        </View>
        <Text style={styles.desc}>{item.description}</Text>
      </View>

      {/* Show technical identifiers and source info from raw API object if available */}
      {item.raw ? (
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Feather name="code" size={18} color="#666" style={{marginRight: 8}} />
            <Text style={styles.cardTitle}>Technical Details</Text>
          </View>
          {item.raw.atcocode ? <Text style={styles.meta}>🎫 ATCO code: {item.raw.atcocode}</Text> : null}
          {item.raw.station_code ? <Text style={styles.meta}>🚉 Station code: {item.raw.station_code}</Text> : null}
          {item.raw.tiploc_code ? <Text style={styles.meta}>📍 Tiploc: {item.raw.tiploc_code}</Text> : null}
          {item.raw.osm_id ? <Text style={styles.meta}>🗺️ OSM: {item.raw.osm_id}</Text> : null}
          {item.raw.description && item.raw.description !== item.description ? <Text style={styles.meta}>{item.raw.description}</Text> : null}
        </View>
      ) : null}

      {item.type ? (
        <View style={styles.typeChip}>
          <Feather name="tag" size={14} color="#0a7ea4" style={{marginRight: 6}} />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={{marginTop: 12}}>
          <ActivityIndicator />
        </View>
      ) : null}

      {error ? (
        <Text style={{color: '#ff3b30', marginTop: 12}}>{error}</Text>
      ) : null}
      </View>

      {item.schedule || scheduleLoading ? (
        <View style={styles.scheduleCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Feather name="clock" size={20} color="#0a7ea4" style={{marginRight: 8}} />
              <Text style={styles.sectionTitle}>Schedule</Text>
            </View>
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
        <View style={styles.mapCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Feather name="map" size={20} color="#0a7ea4" style={{marginRight: 8}} />
              <Text style={styles.sectionTitle}>Route & Location</Text>
            </View>
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
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.bookButton]}
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
              style={[styles.actionButton, styles.directionsButton]}
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
    {/* Enhanced Booking Modal */}
    <Modal visible={bookingModalVisible} transparent animationType="fade" onRequestClose={() => setBookingModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}]
        }]}>
          {/* Modal Header */}
          <LinearGradient
            colors={['#0a7ea4', '#1e90ff']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.modalHeader}
          >
            <View style={{flex: 1}}>
              <Text style={styles.modalTitle}>Book Your Journey</Text>
              <Text style={styles.modalSubtitle}>{item.title}</Text>
            </View>
            <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.modalCloseBtn}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody}>
            {/* Schedule Selection */}
            {item.schedule && item.schedule.length > 0 ? (
              <View style={styles.compactSection}>
                <Text style={styles.compactLabel}>⏰ Departure Time</Text>
                <View style={styles.scheduleChipsContainer}>
                  {item.schedule.map((s, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedScheduleIndex(idx)}
                      style={[styles.scheduleChipCompact, selectedScheduleIndex === idx ? styles.scheduleChipActive : null]}
                      activeOpacity={0.7}
                    >
                      <Text style={selectedScheduleIndex === idx ? styles.scheduleChipTextActive : styles.scheduleChipText}>
                        {s.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Passenger Name */}
            <View style={styles.compactSection}>
              <Text style={styles.compactLabel}>👤 Passenger Name</Text>
              <TextInput 
                value={passengerName} 
                onChangeText={setPassengerName} 
                placeholder="Enter your full name" 
                placeholderTextColor="#999"
                style={styles.compactInput} 
              />
            </View>

            {/* Seats Selection */}
            <View style={styles.compactSection}>
              <Text style={styles.compactLabel}>👥 Number of Seats</Text>
              <View style={styles.seatsCompact}>
                <TouchableOpacity 
                  onPress={() => {
                    setSeats(Math.max(1, seats - 1));
                    Animated.sequence([
                      Animated.timing(scaleAnim, {toValue: 0.95, duration: 100, useNativeDriver: true}),
                      Animated.timing(scaleAnim, {toValue: 1, duration: 100, useNativeDriver: true})
                    ]).start();
                  }} 
                  style={styles.seatBtnCompact}
                  disabled={seats <= 1}
                  activeOpacity={0.7}
                >
                  <Feather name="minus" size={18} color={seats <= 1 ? '#ccc' : '#0a7ea4'} />
                </TouchableOpacity>
                <Animated.Text style={[styles.seatsNumberCompact, {transform: [{scale: scaleAnim}]}]}>{seats}</Animated.Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSeats(seats + 1);
                    Animated.sequence([
                      Animated.timing(scaleAnim, {toValue: 0.95, duration: 100, useNativeDriver: true}),
                      Animated.timing(scaleAnim, {toValue: 1, duration: 100, useNativeDriver: true})
                    ]).start();
                  }} 
                  style={styles.seatBtnCompact}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={18} color="#0a7ea4" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.modalFooter}>
            <Animated.View style={{transform: [{scale: pulseAnim}], width: '100%'}}>
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.8}
              onPress={async () => {
                if (!passengerName.trim()) {
                  Alert.alert('⚠️ Required', 'Please enter passenger name');
                  return;
                }
                try {
                  setBookingLoading(true);
                  const schedule = item.schedule && item.schedule[selectedScheduleIndex] ? item.schedule[selectedScheduleIndex] : null;
                  const payload = {itemId: id, user: {...(user || {}), passengerName, seats, schedule}};
                  const action = await dispatch(bookItem(payload));
                  const booking = action.payload;
                  setBookingLoading(false);
                  setBookingModalVisible(false);
                  setLastBooking(booking);
                  
                  // Show custom success modal
                  setSuccessData({
                    confirmationCode: booking?.confirmationCode,
                    destination: item.title,
                    time: schedule?.time,
                    passenger: passengerName,
                    seats: seats
                  });
                  setSuccessModalVisible(true);
                } catch (e) {
                  setBookingLoading(false);
                  Alert.alert('❌ Booking Failed', e.message || 'Unable to complete booking. Please try again.');
                }
              }}
              disabled={bookingLoading || !passengerName.trim()}
            >
              {bookingLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="check-circle" size={20} color="white" style={{marginRight: 8}} />
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                </>
              )}
            </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>

    {/* Custom Success Modal */}
    <Modal visible={successModalVisible} transparent animationType="none" onRequestClose={() => setSuccessModalVisible(false)}>
      <View style={styles.successOverlay}>
        <Animated.View style={[styles.successModal, {
          opacity: successOpacity,
          transform: [{scale: successScale}]
        }]}>          
          {/* Success Icon */}
          <Animated.View style={[styles.successIconContainer, {
            transform: [{scale: checkmarkScale}]
          }]}>            
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.successIconGradient}
            >              
              <Feather name="check" size={48} color="#fff" />
            </LinearGradient>
          </Animated.View>
          
          {/* Success Title */}
          <Text style={styles.successTitle}>Booking Successful!</Text>
          <Text style={styles.successSubtitle}>Your journey is confirmed</Text>
          
          {/* Confirmation Details */}
          {successData && (
            <View style={styles.successDetails}>
              {successData.confirmationCode && (
                <View style={styles.confirmationCodeBox}>
                  <Feather name="award" size={20} color="#4CAF50" />
                  <View style={{marginLeft: 12}}>
                    <Text style={styles.confirmationLabel}>Confirmation Code</Text>
                    <Text style={styles.confirmationCode}>{successData.confirmationCode}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => setSuccessModalVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.successButtonText}>Great!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
    </>
  );
}

// Booking modal component is rendered inside DetailsScreen file via state; below are styles for modal elements.


const styles = StyleSheet.create({
  container: {paddingBottom: 24, backgroundColor: '#f5f7fa', alignItems: 'flex-start'},
  heroContainer: {width: '100%', height: 300, position: 'relative'},
  image: {width: '100%', height: 300, backgroundColor: '#e0e0e0'},
  imageGradient: {position: 'absolute', bottom: 0, left: 0, right: 0, height: 150},
  heroContent: {position: 'absolute', bottom: 20, left: 16, right: 16},
  title: {fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4},
  badge: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 12},
  badgeText: {color: 'white', fontWeight: '700', fontSize: 11, textTransform: 'uppercase'},
  contentSection: {width: '100%', paddingHorizontal: 16, paddingTop: 16},
  descriptionCard: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: {width: 0, height: 2}},
  detailsCard: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: {width: 0, height: 2}},
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#1a1a1a'},
  desc: {fontSize: 15, color: '#555', lineHeight: 22},
  meta: {fontSize: 14, color: '#666', marginTop: 6, lineHeight: 20},
  typeChip: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f7ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start'},
  typeText: {fontSize: 14, color: '#0a7ea4', fontWeight: '600'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa'},
  scheduleCard: {width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: {width: 0, height: 2}},
  mapCard: {width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: {width: 0, height: 2}},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  titleWithIcon: {flexDirection: 'row', alignItems: 'center'},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: '#1a1a1a'},
  refreshBtn: {padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0'},
  scheduleRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fafafa', paddingHorizontal: 14, borderRadius: 10, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: {width: 0, height: 1}},
  scheduleRowSelected: {backgroundColor: '#e3f2fd', borderColor: '#0a84ff', borderWidth: 2, elevation: 3},
  scheduleTimeBox: {backgroundColor: '#0a7ea4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 12},
  scheduleTime: {fontWeight: '700', fontSize: 15, color: '#fff'},
  platformText: {fontSize: 11, color: '#e6f7ff', fontWeight: '600', marginTop: 2},
  scheduleDest: {fontSize: 15, fontWeight: '600', color: '#1a1a1a'},
  scheduleOperator: {fontSize: 12, color: '#999', marginTop: 2},
  scheduleStatus: {fontSize: 12, color: '#ff3b30', marginTop: 2, fontWeight: '600'},
  delayBadge: {backgroundColor: '#ff3b30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
  delayText: {color: 'white', fontSize: 10, fontWeight: '700'},
  noData: {color: '#999', fontSize: 14, fontStyle: 'italic', paddingVertical: 12},
  stopItem: {paddingVertical: 4, color: '#444'},
  actionButtonsContainer: {flexDirection: 'row', marginTop: 16, width: '100%', justifyContent: 'space-between', gap: 12},
  actionButton: {flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: {width: 0, height: 2}},
  bookButton: {backgroundColor: '#0a84ff'},
  directionsButton: {backgroundColor: '#34C759'},
  actionText: {fontWeight: '700', fontSize: 15},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20},
  modalContent: {width: '100%', maxWidth: 450, backgroundColor: 'white', borderRadius: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: {width: 0, height: 4}, overflow: 'hidden'},
  modalHeader: {flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12},
  modalTitle: {fontSize: 20, fontWeight: '800', color: '#fff'},
  modalSubtitle: {fontSize: 14, color: '#e6f7ff', marginTop: 2},
  modalCloseBtn: {padding: 4},
  modalBody: {padding: 20, maxHeight: 400},
  compactSection: {marginBottom: 20},
  compactLabel: {fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10},
  compactInput: {backgroundColor: '#f8f9fa', borderRadius: 10, padding: 14, fontSize: 15, color: '#1a1a1a', fontWeight: '500', borderWidth: 1, borderColor: '#e0e0e0'},
  scheduleChipsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  scheduleChipCompact: {paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#e0e0e0'},
  scheduleChipActive: {backgroundColor: '#0a7ea4', borderColor: '#0a7ea4'},
  scheduleChipText: {fontSize: 14, fontWeight: '600', color: '#333'},
  scheduleChipTextActive: {fontSize: 14, fontWeight: '700', color: '#fff'},
  seatsCompact: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e0e0e0'},
  seatBtnCompact: {width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0', elevation: 3, shadowColor: '#0a7ea4', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: {width: 0, height: 2}},
  seatsNumberCompact: {fontSize: 24, fontWeight: '800', color: '#0a7ea4'},
  modalFooter: {padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0'},
  confirmButton: {flexDirection: 'row', backgroundColor: '#0a7ea4', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#0a7ea4', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: {width: 0, height: 6}},
  confirmButtonText: {fontSize: 16, fontWeight: '700', color: '#fff'},
  mapLegend: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#f8f9fa', borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#e8e8e8'},
  legendItem: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {width: 12, height: 12, borderRadius: 6, marginRight: 6},
  legendText: {fontSize: 12, color: '#666', fontWeight: '600'},
  clearMapBtn: {backgroundColor: '#0a84ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16},
  clearMapText: {color: 'white', fontSize: 12, fontWeight: '600'},
  successOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20},
  successModal: {width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: {width: 0, height: 10}},
  successIconContainer: {marginBottom: 24},
  successIconGradient: {width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#4CAF50', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: {width: 0, height: 4}},
  successTitle: {fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center'},
  successSubtitle: {fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center'},
  successDetails: {width: '100%', marginBottom: 24},
  confirmationCodeBox: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f8f4', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#4CAF50'},
  confirmationLabel: {fontSize: 12, color: '#666', marginBottom: 4, textTransform: 'uppercase', fontWeight: '600'},
  confirmationCode: {fontSize: 20, fontWeight: '800', color: '#4CAF50', letterSpacing: 1},
  successButton: {width: '100%', backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  successButtonText: {fontSize: 18, fontWeight: '700', color: '#fff'},
});