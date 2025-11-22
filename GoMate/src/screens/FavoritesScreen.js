import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import ItemCard from '../components/ItemCard';

export default function FavoritesScreen({navigation}) {
  const favorites = useSelector((s) => s.items.favorites);

  if (!favorites || favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{color: '#444'}}>No favorites yet. Add some from Home.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(i) => String(i.id)}
        renderItem={({item}) => (
          <ItemCard item={item} onPress={() => navigation.navigate('Details', {item})} />
        )}
        contentContainerStyle={{padding: 16}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
