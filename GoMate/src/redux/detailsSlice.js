import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTransportItemDetails } from '../api/transportApi';

export const fetchDetails = createAsyncThunk('details/fetchDetails', async (id, { rejectWithValue }) => {
  try {
    const res = await fetchTransportItemDetails(id);
    return res;
  } catch (e) {
    return rejectWithValue(e.message || 'Failed to fetch details');
  }
});

const detailsSlice = createSlice({
  name: 'details',
  initialState: { cache: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDetails.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchDetails.fulfilled, (s, a) => {
        s.loading = false;
        const data = a.payload;
        if (data && data.id) s.cache[data.id] = data;
      })
      .addCase(fetchDetails.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message;
      });
  },
});

export default detailsSlice.reducer;
