import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl, Image, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchItems} from '../redux/itemsSlice';
import ItemCard from '../components/ItemCard';
import {Feather} from '@expo/vector-icons';

export default function HomeScreen({navigation}) {
  const dispatch = useDispatch();
  const {items, loading, error} = useSelector((s) => s.items);
  const authUser = useSelector((s) => s.auth.user) || {};
  const username = authUser?.username || '';
  const displayName = authUser?.firstName ? `${authUser.firstName}${authUser.lastName ? ' ' + authUser.lastName : ''}` : username;
  const [query, setQuery] = useState('');
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'GoMate',
      headerRight: () => (
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => navigation.navigate('Profile')}>
          {authUser?.imageUrl ? (
            <Image source={{uri: authUser.imageUrl}} style={{width: 28, height: 28, borderRadius: 14, marginRight: 8}} />
          ) : (
            <Feather name="user" size={18} color="#007AFF" style={{marginRight: 6}} />
          )}
          <Text style={{color: '#007AFF', marginRight: 8}}>{displayName}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, username]);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Check if items are mock data (no atcocode means mock)
  useEffect(() => {
    if (items && items.length > 0 && items.some(item => item.id && item.id.toString().startsWith('mock_'))) {
      setShowQuotaWarning(true);
    } else {
      setShowQuotaWarning(false);
    }
  }, [items]);

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
      <View style={styles.headerSection}>
        <View style={styles.taglineWrap}>
          <Text style={styles.appTitle}>Welcome to GoMate</Text>
          <Text style={styles.tagline}>View public transport schedules or explore destinations</Text>
        </View>
        
        {/* Quota warning banner */}
        {showQuotaWarning ? (
          <View style={styles.quotaWarning}>
            <Feather name="alert-circle" size={16} color="#ff9500" style={{marginRight: 8}} />
            <Text style={styles.quotaText}>
              API quota exceeded - Showing sample data (resets in 24h)
            </Text>
          </View>
        ) : null}
        
        <View style={styles.searchRow}>
          <View style={styles.searchIcon}>
            <Feather name="search" size={18} color="#0a7ea4" />
          </View>
          <TextInput 
            placeholder="Search stops, stations, routes..." 
            placeholderTextColor="#999"
            value={query} 
            onChangeText={setQuery} 
            style={styles.searchInput} 
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Feather name="x-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({item}) => (
          <ItemCard item={item} onPress={() => navigation.navigate('Details', {item})} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor="#0a7ea4" />}
        ListHeaderComponent={() => (
          filtered.length > 0 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Transport</Text>
              <Text style={styles.sectionCount}>{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</Text>
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#ccc" style={{marginBottom: 12}} />
            <Text style={styles.emptyTitle}>No transport found</Text>
            <Text style={styles.emptySubtitle}>{query ? 'Try a different search term' : 'Pull to refresh'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  headerSection: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taglineWrap: {
    padding: 16,
    paddingBottom: 12,
  },
  quotaWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  quotaText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  tagline: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 4,
    height: 44,
  },
  searchIcon: {
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 8,
    marginRight: 4,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
});
