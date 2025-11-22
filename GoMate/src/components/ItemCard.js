import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import FavoriteButton from './FavoriteButton';

export default function ItemCard({item, onPress}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{uri: item.thumbnail || item.images?.[0]}} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
      </View>
      <FavoriteButton item={item} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6},
  image: {width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#eee'},
  content: {flex: 1},
  title: {fontSize: 16, fontWeight: '700', marginBottom: 4},
  desc: {color: '#666'},
});
