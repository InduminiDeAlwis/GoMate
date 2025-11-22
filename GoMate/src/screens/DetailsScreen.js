import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert, Platform} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useDispatch, useSelector} from 'react-redux';
import {fetchDetails} from '../redux/detailsSlice';

export default function DetailsScreen({route}) {
  const passed = route.params?.item;
  const id = passed?.id || route.params?.id;
  const [item, setItem] = useState(passed || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const cached = useSelector((s) => (id ? s.details.cache[id] : null));

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
              style={styles.actionButton}
              onPress={() => Alert.alert('Booked', `You booked ${item.title}`)}
            >
              <Text style={styles.actionText}>Book</Text>
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
  );
}

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
});