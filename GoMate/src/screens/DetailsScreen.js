import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';

export default function DetailsScreen({route}) {
  const {item} = route.params || {};

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
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.meta}>Brand: {item.brand || '—'}</Text>
      <Text style={styles.meta}>Price: ${item.price ?? '—'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: '#fff', alignItems: 'center'},
  image: {width: '100%', height: 220, borderRadius: 8, marginBottom: 12},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 8},
  desc: {fontSize: 16, color: '#444', marginBottom: 12},
  meta: {fontSize: 14, color: '#666', marginBottom: 4},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
