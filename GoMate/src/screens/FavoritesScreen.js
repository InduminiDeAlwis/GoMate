import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSelector} from 'react-redux';
import ItemCard from '../components/ItemCard';
import {Feather} from '@expo/vector-icons';

export default function FavoritesScreen({navigation}) {
  const favorites = useSelector((s) => s.items.favorites);

  if (!favorites || favorites.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#ff6b6b', '#ff8e53', '#ffa94d']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconRow}>
              <Feather name="heart" size={28} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.headerTitle}>My Favorites</Text>
            </View>
            <Text style={styles.headerSubtitle}>Save your frequent routes here</Text>
          </View>
        </LinearGradient>
        <View style={styles.emptyState}>
          <Feather name="heart" size={80} color="#ffcccb" style={{marginBottom: 24}} />
          <Text style={styles.emptyTitle}>❤️ No favorites yet</Text>
          <Text style={styles.emptySubtitle}>Start adding your favorite routes from the Home screen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ff6b6b', '#ff8e53', '#ffa94d']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconRow}>
            <Feather name="heart" size={28} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.headerTitle}>My Favorites</Text>
          </View>
          <Text style={styles.headerSubtitle}>{favorites.length} saved {favorites.length === 1 ? 'route' : 'routes'}</Text>
        </View>
      </LinearGradient>
      <FlatList
        data={favorites}
        keyExtractor={(i) => String(i.id)}
        renderItem={({item}) => (
          <ItemCard item={item} onPress={() => navigation.navigate('Details', {item})} />
        )}
        contentContainerStyle={styles.listContent}
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#ffe6e6',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
