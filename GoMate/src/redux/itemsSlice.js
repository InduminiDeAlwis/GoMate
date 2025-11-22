import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchTransportItems as fetchFromApi} from '../api/transportApi';

const DUMMY_FALLBACK = [
  {id: 1, title: 'Compact Car', description: 'A compact vehicle for city travel', thumbnail: 'https://picsum.photos/200/200?random=1'},
  {id: 2, title: 'Motorbike', description: 'Two-wheeler for quick trips', thumbnail: 'https://picsum.photos/200/200?random=2'},
  {id: 3, title: 'SUV', description: 'Spacious SUV for family travel', thumbnail: 'https://picsum.photos/200/200?random=3'},
];

export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  try {
    const res = await fetchFromApi();
    if (!res || !res.products) return DUMMY_FALLBACK;
    return res.products;
  } catch (e) {
    return DUMMY_FALLBACK;
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
        s.items = DUMMY_FALLBACK;
      })
      .addCase(loadFavorites.fulfilled, (s, a) => {
        s.favorites = a.payload || [];
      });
  },
});

export const {addFavorite, removeFavorite} = itemsSlice.actions;
export default itemsSlice.reducer;
