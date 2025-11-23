import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, RefreshControl, Image, Alert, Animated} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
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
  const [searchFocused, setSearchFocused] = useState(false);
  const searchAnimation = useState(new Animated.Value(0))[0];

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
      <LinearGradient
        colors={['#0a7ea4', '#1e90ff', '#4db8ff']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <View style={styles.iconRow}>
              <Feather name="map" size={28} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.appTitle}>GoMate</Text>
            </View>
            <Text style={styles.tagline}>Your journey starts here ✈️</Text>
            <Text style={styles.subtitle}>Explore transport schedules & destinations</Text>
          </View>
          
          {/* Quota warning banner */}
          {showQuotaWarning ? (
            <View style={styles.quotaWarning}>
              <Feather name="alert-circle" size={16} color="#ff9500" style={{marginRight: 8}} />
              <Text style={styles.quotaText}>
                📊 Sample data mode (API resets in 24h)
              </Text>
            </View>
          ) : null}
          
          <View style={[styles.searchRow, searchFocused && styles.searchRowFocused]}>
            <View style={styles.searchIcon}>
              <Feather name="search" size={20} color="#0a7ea4" />
            </View>
            <TextInput 
              placeholder="Search stops, stations, routes..." 
              placeholderTextColor="#999"
              value={query} 
              onChangeText={setQuery}
              onFocus={() => {
                setSearchFocused(true);
                Animated.spring(searchAnimation, {
                  toValue: 1,
                  useNativeDriver: false,
                }).start();
              }}
              onBlur={() => {
                setSearchFocused(false);
                Animated.spring(searchAnimation, {
                  toValue: 0,
                  useNativeDriver: false,
                }).start();
              }}
              style={styles.searchInput} 
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Feather name="x-circle" size={18} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        renderItem={({item}) => (
          <ItemCard item={item} onPress={() => navigation.navigate('Details', {item})} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor="#0a7ea4" colors={['#0a7ea4', '#1e90ff']} />}
        ListHeaderComponent={() => (
          filtered.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View style={styles.titleWithIcon}>
                <Feather name="navigation" size={20} color="#0a7ea4" style={{marginRight: 8}} />
                <Text style={styles.sectionTitle}>Available Transport</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.sectionCount}>{filtered.length}</Text>
              </View>
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="compass" size={64} color="#ddd" style={{marginBottom: 16}} />
            <Text style={styles.emptyTitle}>🧳 No journeys found</Text>
            <Text style={styles.emptySubtitle}>{query ? 'Try a different search term' : 'Pull down to discover routes'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f7fa'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  gradientHeader: {
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    color: '#e6f7ff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#b3e0ff',
    fontSize: 14,
    fontWeight: '400',
  },
  quotaWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  quotaText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 4,
    height: 52,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchRowFocused: {
    elevation: 6,
    shadowOpacity: 0.2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchIcon: {
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 12,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 10,
    marginRight: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  countBadge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 36,
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});
