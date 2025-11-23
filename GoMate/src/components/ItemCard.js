import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import FavoriteButton from './FavoriteButton';
import {Feather} from '@expo/vector-icons';

export default function ItemCard({item, onPress}) {
  const statusColor = item.status === 'Active' ? '#34C759' : item.status === 'Popular' ? '#ff9500' : '#0a84ff';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{uri: item.thumbnail || item.images?.[0]}} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.rowTop}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <FavoriteButton item={item} />
        </View>

        <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color="#0a7ea4" />
            <Text style={styles.metaText}>{item.type || 'Transport'}</Text>
          </View>
          <View style={[styles.badge, {backgroundColor: statusColor}]}> 
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  desc: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#666',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
});
