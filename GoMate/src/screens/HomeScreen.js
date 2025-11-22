import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchItems} from '../redux/itemsSlice';
import ItemCard from '../components/ItemCard';
import {Feather} from '@expo/vector-icons';

export default function HomeScreen({navigation}) {
  const dispatch = useDispatch();
  const {items, loading} = useSelector((s) => s.items);
  const username = useSelector((s) => s.auth.user?.username) || '';
  const [query, setQuery] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'Home',
      headerRight: () => (
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={18} color="#007AFF" style={{marginRight: 6}} />
          <Text style={{color: '#007AFF', marginRight: 8}}>{username}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, username]);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchItems());
    setRefreshing(false);
  };

  // Filter items by query
  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return (items || []).filter((it) => (it.title || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q));
  }, [items, query]);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color="#666" style={{marginHorizontal: 8}} />
        <TextInput placeholder="Search items" value={query} onChangeText={setQuery} style={styles.searchInput} />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} style={{padding: 8}}>
            <Feather name="x" size={16} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({item}) => (
          <ItemCard item={item} onPress={() => navigation.navigate('Details', {item})} />
        )}
        contentContainerStyle={{padding: 16}}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{color: '#666'}}>No items found.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
