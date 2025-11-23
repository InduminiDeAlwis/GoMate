import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {bookTransportItem as apiBookTransportItem} from '../api/transportApi';
import {sendBookingConfirmation, scheduleDepartureReminder} from '../services/notificationService';

const BOOKINGS_KEY = '@bookings';

export const loadBookings = createAsyncThunk('bookings/load', async () => {
  try {
    const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
});

export const bookItem = createAsyncThunk('bookings/bookItem', async ({itemId, user}, thunkAPI) => {
  // call API (mock) to create booking
  const res = await apiBookTransportItem(itemId, {user});
  
  // Send booking confirmation notification
  await sendBookingConfirmation(res);
  
  // Schedule departure reminder (30 minutes before)
  await scheduleDepartureReminder(res, 30);
  
  // read current stored bookings and append
  try {
    const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [res, ...existing];
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    // ignore storage errors
  }
  return res;
});

const slice = createSlice({
  name: 'bookings',
  initialState: {bookings: [], loading: false, error: null},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBookings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loadBookings.fulfilled, (s, a) => {
        s.loading = false;
        s.bookings = a.payload || [];
      })
      .addCase(loadBookings.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      })
      .addCase(bookItem.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(bookItem.fulfilled, (s, a) => {
        s.loading = false;
        s.bookings.unshift(a.payload);
      })
      .addCase(bookItem.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error?.message;
      });
  },
});

export default slice.reducer;
