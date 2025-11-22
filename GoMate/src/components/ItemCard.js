import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import FavoriteButton from './FavoriteButton';
import {Feather} from '@expo/vector-icons';

export default function ItemCard({item, onPress}) {
  const statusColor = item.status === 'Active' ? '#34C759' : item.status === 'Popular' ? '#ff9500' : '#0a84ff';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{uri: item.thumbnail || item.images?.[0]}} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[styles.badge, {backgroundColor: statusColor}]}> 
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.metaText}>{item.type || 'Transport'}</Text>
        </View>
      </View>

      <FavoriteButton item={item} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6},
  image: {width: 90, height: 70, borderRadius: 8, marginRight: 12, backgroundColor: '#eee'},
  content: {flex: 1},
  rowTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 16, fontWeight: '700', marginRight: 8, flex: 1},
  desc: {color: '#666', marginTop: 6},
  badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start'},
  badgeText: {color: 'white', fontSize: 12, fontWeight: '700'},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  metaText: {color: '#666', marginLeft: 6, fontSize: 12},
});
