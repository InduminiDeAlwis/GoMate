import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {useDispatch, useSelector} from 'react-redux';
import {addFavorite, removeFavorite} from '../redux/itemsSlice';

export default function FavoriteButton({item}) {
  const dispatch = useDispatch();
  const favorites = useSelector((s) => s.items.favorites || []);
  const isFav = favorites.some((f) => f.id === item.id);

  function toggle() {
    if (isFav) dispatch(removeFavorite(item.id));
    else dispatch(addFavorite(item));
  }

  return (
    <TouchableOpacity onPress={toggle} style={styles.wrap}>
      <Feather name={isFav ? 'heart' : 'heart'} size={20} color={isFav ? '#ff2d55' : '#bbb'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 8},
});
