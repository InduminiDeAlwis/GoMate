import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTransportItemDetails, fetchTimetableForPlace } from '../api/transportApi';

export const fetchDetails = createAsyncThunk('details/fetchDetails', async (id, { rejectWithValue }) => {
  try {
    const res = await fetchTransportItemDetails(id);
    // If remote returned no schedule but we have a raw object, try to fetch timetable for that place
    if (res && res.raw && (!res.schedule || res.schedule.length === 0)) {
      try {
        const timetable = await fetchTimetableForPlace(res.raw);
        if (timetable && timetable.length > 0) {
          res.schedule = timetable;
        }
      } catch (e) {
        // ignore timetable fetch errors
      }
    }
    return res;
  } catch (e) {
    return rejectWithValue(e.message || 'Failed to fetch details');
  }
});

// New action to refresh schedule data on demand
export const refreshSchedule = createAsyncThunk('details/refreshSchedule', async ({ id, raw }, { rejectWithValue, getState }) => {
  try {
    if (!raw) {
      throw new Error('No raw data available to refresh schedule');
    }
    const timetable = await fetchTimetableForPlace(raw);
    if (!timetable || timetable.length === 0) {
      throw new Error('No schedule data available');
    }
    return { id, schedule: timetable };
  } catch (e) {
    return rejectWithValue(e.message || 'Failed to refresh schedule');
  }
});

const detailsSlice = createSlice({
  name: 'details',
  initialState: { cache: {}, loading: false, error: null, scheduleLoading: false },
  reducers: {
    clearDetailsCache: (s) => {
      s.cache = {};
    },
  },
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
      })
      .addCase(refreshSchedule.pending, (s) => {
        s.scheduleLoading = true;
      })
      .addCase(refreshSchedule.fulfilled, (s, a) => {
        s.scheduleLoading = false;
        const { id, schedule } = a.payload;
        if (s.cache[id]) {
          s.cache[id].schedule = schedule;
        }
      })
      .addCase(refreshSchedule.rejected, (s, a) => {
        s.scheduleLoading = false;
        s.error = a.payload || a.error?.message;
      });
  },
});

export const { clearDetailsCache } = detailsSlice.actions;
export default detailsSlice.reducer;
