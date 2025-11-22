import React, {useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchItems} from '../redux/itemsSlice';
import ItemCard from '../components/ItemCard';

export default function HomeScreen({navigation}) {
  const dispatch = useDispatch();
  const {items, loading} = useSelector((s) => s.items);
  const username = useSelector((s) => s.auth.user?.username) || '';

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  useEffect(() => {
    navigation.setOptions({title: `Welcome, ${username}`});
  }, [navigation, username]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
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
