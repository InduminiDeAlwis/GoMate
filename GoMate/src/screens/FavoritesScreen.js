import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, Animated} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSelector} from 'react-redux';
import ItemCard from '../components/ItemCard';
import {Feather} from '@expo/vector-icons';

export default function FavoritesScreen({navigation}) {
  const favorites = useSelector((s) => s.items.favorites);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scrollY] = useState(new Animated.Value(0));
  const [headerIconScale] = useState(new Animated.Value(1));
  
  useEffect(() => {
    // Set navigation header
    navigation.setOptions({
      title: '',
      headerStyle: {
        backgroundColor: '#ff6b6b',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '800',
        fontSize: 20,
      },
      headerLeft: () => (
        <View style={{marginLeft: 16, flexDirection: 'row', alignItems: 'center'}}>
          <Animated.View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            transform: [{scale: pulseAnim}],
          }}>
            <Feather name="heart" size={20} color="#fff" />
          </Animated.View>
          <Text style={{color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5}}>Favorites</Text>
        </View>
      ),
      headerRight: () => (
        <View style={{marginRight: 16, flexDirection: 'row', alignItems: 'center'}}>
          <View style={{
            backgroundColor: '#fff',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
          }}>
            <Text style={{color: '#ff6b6b', fontWeight: '700', fontSize: 14}}>
              {favorites.length} {favorites.length === 1 ? 'route' : 'routes'}
            </Text>
          </View>
        </View>
      ),
    });
    
    // Pulse animation for heart icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [navigation, favorites.length, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View>
        <LinearGradient
          colors={['#ff6b6b', '#ff8e53', '#ffa94d']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.iconRow}>
              </View>
              <Text style={styles.tagline}>Your saved routes ❤️</Text>
              <Text style={styles.subtitle}>Quick access to your favorite journeys</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <FlatList
        data={favorites}
        keyExtractor={(i) => String(i.id)}
        renderItem={({item}) => (
          <ItemCard item={item} onPress={() => navigation.navigate('Details', {item})} />
        )}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false}
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          favorites.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View style={styles.titleWithIcon}>
                <Feather name="heart" size={20} color="#ff6b6b" style={{marginRight: 8}} />
                <Text style={styles.sectionTitle}>Saved Routes</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.sectionCount}>{favorites.length}</Text>
              </View>
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="heart" size={80} color="#ffcccb" style={{marginBottom: 24}} />
            <Text style={styles.emptyTitle}>❤️ No favorites yet</Text>
            <Text style={styles.emptySubtitle}>Start adding your favorite routes from the Home screen</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f7fa'},
  gradientHeader: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    paddingTop: 8,
  },
  welcomeSection: {
    marginBottom: 0,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heartContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  travelBadge: {
    marginLeft: 8,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    color: '#ffe6e6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#ffd4d4',
    fontSize: 14,
    fontWeight: '400',
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
    backgroundColor: '#ff6b6b',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
