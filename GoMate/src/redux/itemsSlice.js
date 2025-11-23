import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchTransportItems as fetchFromApi} from '../api/transportApi';

export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  try {
    const res = await fetchFromApi();
    // If API returns a products array use it. If not, return an empty array (no mock fallback).
    if (!res || !Array.isArray(res.products)) return [];
    return res.products;
  } catch (e) {
    // On error return empty array so UI shows no items instead of mocked data.
    return [];
  }
});

export const loadFavorites = createAsyncThunk('items/loadFavorites', async () => {
  try {
    const raw = await AsyncStorage.getItem('@favorites');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
});

const saveFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem('@favorites', JSON.stringify(favorites));
  } catch (e) {
    // ignore
  }
};

const itemsSlice = createSlice({
  name: 'items',
  initialState: {items: [], favorites: [], loading: false, error: null},
  reducers: {
    addFavorite(state, action) {
      const item = action.payload;
      if (!state.favorites.find((f) => f.id === item.id)) state.favorites.push(item);
      saveFavorites(state.favorites);
    },
    removeFavorite(state, action) {
      const id = action.payload;
      state.favorites = state.favorites.filter((f) => f.id !== id);
      saveFavorites(state.favorites);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchItems.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchItems.rejected, (s) => {
        s.loading = false;
        s.items = [];
      })
      .addCase(loadFavorites.fulfilled, (s, a) => {
        s.favorites = a.payload || [];
      });
  },
});

export const {addFavorite, removeFavorite} = itemsSlice.actions;
export default itemsSlice.reducer;
