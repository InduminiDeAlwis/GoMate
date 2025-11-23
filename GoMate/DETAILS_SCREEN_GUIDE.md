# Details Screen - State Management & Interactions Guide

## 📋 Overview
The Details Screen now features comprehensive **Redux Toolkit state management**, smooth **item interactions**, and enhanced **user experience** with real-time schedule updates from TransportAPI.

---

## 🎯 Key Features Implemented

### 1. **Redux Toolkit State Management**

#### **detailsSlice.js** - State Structure
```javascript
{
  cache: {},              // Cached item details by ID
  loading: false,         // Global loading state
  scheduleLoading: false, // Schedule refresh loading
  error: null            // Error messages
}
```

#### **Available Actions**
- `fetchDetails(id)` - Fetch complete item details with schedule
- `refreshSchedule({id, raw})` - Refresh timetable data on demand
- `clearDetailsCache()` - Clear all cached details

### 2. **Item Tap Interaction Flow**

```
HomeScreen (ItemCard) 
  → User taps item
  → navigation.navigate('Details', {item})
  → DetailsScreen receives full item object
  → Shows immediate UI (no loading)
  → Fetches additional details in background
```

**Benefits:**
- ✅ Instant UI display (uses passed item data)
- ✅ No unnecessary API calls when data exists
- ✅ Background refresh for updated schedules
- ✅ Redux caching prevents duplicate fetches

### 3. **Pull-to-Refresh**
Users can swipe down to refresh entire details view:
- Updates schedule data
- Refetches item details
- Shows loading indicator

### 4. **Schedule Refresh Button**
Dedicated refresh button in schedule section:
- Only fetches timetable data (efficient)
- Shows loading spinner during fetch
- Success/error alerts
- Uses TransportAPI free plan efficiently

---

## 🔄 State Management Flow

### **Initial Load**
```javascript
1. User taps item in HomeScreen
2. Navigation passes item object: {id, title, thumbnail, description, latitude, longitude, raw, ...}
3. DetailsScreen receives item → immediate UI render
4. Check Redux cache for cached details
5. If cache exists → merge with passed item
6. If no local data → dispatch fetchDetails(id)
7. fetchDetails calls transportApi.fetchTransportItemDetails(id)
8. If no schedule → calls fetchTimetableForPlace(raw)
9. Updates Redux cache
10. Updates local state → UI updates
```

### **Schedule Refresh**
```javascript
1. User taps refresh icon
2. dispatch refreshSchedule({id, raw: item.raw})
3. Calls fetchTimetableForPlace(raw)
4. Tries multiple endpoints:
   - bus/stop_timetables
   - train/station_timetables
   - bus/service_timetables
5. Updates Redux cache with new schedule
6. Updates local state
7. Shows success/error alert
```

---

## 🎨 Enhanced UI Components

### **Schedule Display**
- **Time Box**: Blue background with white text
- **Destination**: Bold title with operator info
- **Delay Badge**: Red badge for delayed services
- **Refresh Button**: Top-right icon with loading state
- **Empty State**: "No schedule data available" message

### **Action Buttons**
- **Book Now**: Calendar icon, blue background
  - Validates user login
  - Opens booking modal with schedule selection
- **Get Directions**: Navigation icon, green background
  - Opens Google Maps with transit mode
  - Uses item coordinates or first stop

### **Loading States**
- **Initial Load**: Full-screen activity indicator
- **Pull-to-Refresh**: Native refresh control
- **Schedule Refresh**: Icon spinner in refresh button
- **Booking**: Modal button spinner

---

## 📊 TransportAPI Integration

### **Free Plan Limits** (30 hits/day)
```
✅ places                              - Item search (HomeScreen)
✅ bus/stop_timetables (singular)      - Bus stop schedules
✅ train/station_timetables (singular) - Train station schedules
✅ bus/service_timetables (singular)   - Bus service timetables
✅ train/service_timetables (singular) - Train service timetables
```

### **Optimization Strategy**
1. **Cache in Redux**: Avoid duplicate API calls
2. **Local Data First**: Use passed item data before fetching
3. **Conditional Fetching**: Only fetch when necessary
4. **Background Updates**: Fetch details after showing UI
5. **Manual Refresh**: User-triggered schedule updates

---

## 🔧 Technical Implementation

### **DetailsScreen.js Key Functions**

#### `handleRefreshSchedule()`
```javascript
// Refresh only schedule data (efficient)
const handleRefreshSchedule = useCallback(async () => {
  if (!item || !item.raw) return;
  setScheduleLoading(true);
  const action = await dispatch(refreshSchedule({id, raw: item.raw}));
  if (action.payload?.schedule) {
    setItem(prev => ({...prev, schedule: action.payload.schedule}));
    Alert.alert('Success', 'Schedule updated');
  }
  setScheduleLoading(false);
}, [item, id, dispatch]);
```

#### `onRefresh()`
```javascript
// Refresh entire details view (pull-to-refresh)
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  const action = await dispatch(fetchDetails(id));
  if (action.payload) setItem(prev => ({...prev, ...action.payload}));
  setRefreshing(false);
}, [id, dispatch]);
```

### **Redux Actions in detailsSlice.js**

#### `fetchDetails`
```javascript
export const fetchDetails = createAsyncThunk('details/fetchDetails', 
  async (id, { rejectWithValue }) => {
    const res = await fetchTransportItemDetails(id);
    if (res?.raw && !res.schedule?.length) {
      const timetable = await fetchTimetableForPlace(res.raw);
      if (timetable?.length) res.schedule = timetable;
    }
    return res;
  }
);
```

#### `refreshSchedule`
```javascript
export const refreshSchedule = createAsyncThunk('details/refreshSchedule',
  async ({ id, raw }, { rejectWithValue }) => {
    const timetable = await fetchTimetableForPlace(raw);
    if (!timetable?.length) throw new Error('No schedule data');
    return { id, schedule: timetable };
  }
);
```

---

## 📱 User Experience Flow

### **Scenario 1: First-time View**
1. User taps "Seacole Bus Stop" in HomeScreen
2. DetailsScreen shows immediately (title, image, description)
3. Loading spinner appears briefly
4. Schedule section loads with departure times
5. Map shows stop location
6. Book Now & Get Directions buttons available

### **Scenario 2: Cached View**
1. User taps previously viewed item
2. DetailsScreen shows instantly with all data
3. No loading spinner (cached)
4. User can refresh schedule if needed

### **Scenario 3: Schedule Update**
1. User views details screen
2. Taps refresh icon in schedule section
3. Icon spins during fetch
4. New schedule data appears
5. Success alert: "Schedule updated"

### **Scenario 4: Booking Flow**
1. User taps "Book Now"
2. Login validation (redirects if not logged in)
3. Modal opens with schedule picker
4. User selects departure time, enters name, chooses seats
5. Taps Confirm → shows loading spinner
6. Success alert with confirmation code
7. Booking saved in Redux + AsyncStorage

---

## 🚀 Performance Optimizations

### **1. Conditional Fetching**
```javascript
const hasLocalData = passed?.latitude || passed?.schedule?.length;
if (hasLocalData) return; // Skip remote fetch
```

### **2. Redux Caching**
```javascript
if (cached) {
  setItem(prev => ({...prev, ...cached})); // Use cache immediately
}
```

### **3. Background Loading**
```javascript
// Show UI first, fetch in background
setItem(passed); // Immediate render
load(); // Background fetch
```

### **4. Memoized Callbacks**
```javascript
const handleRefreshSchedule = useCallback(async () => {...}, [item, id]);
const onRefresh = useCallback(async () => {...}, [id, dispatch]);
```

---

## 🎯 Best Practices Followed

✅ **Single Source of Truth**: Redux cache as central state  
✅ **Optimistic UI**: Show data before fetch completes  
✅ **Error Handling**: Try-catch blocks with user-friendly alerts  
✅ **Loading States**: Clear feedback for all async operations  
✅ **Accessibility**: activeOpacity, proper touch targets  
✅ **TypeScript-ready**: Clear prop types and state structure  
✅ **Clean Code**: Separated concerns, reusable actions  
✅ **User-Centric**: Login validation, helpful error messages  

---

## 📖 Usage Examples

### **Navigate to Details from Any Screen**
```javascript
navigation.navigate('Details', {
  item: {
    id: '1234',
    title: 'Seacole Bus Stop',
    description: 'Bus stop on Main Street',
    thumbnail: 'https://...',
    latitude: 51.5074,
    longitude: -0.1278,
    raw: { atcocode: '9100SEACOLE', ... }
  }
});
```

### **Dispatch Actions in Other Components**
```javascript
import { fetchDetails, refreshSchedule, clearDetailsCache } from '../redux/detailsSlice';

// Fetch details
dispatch(fetchDetails(itemId));

// Refresh schedule
dispatch(refreshSchedule({ id: itemId, raw: item.raw }));

// Clear cache
dispatch(clearDetailsCache());
```

---

## 🔍 Debugging Tips

### **Check Redux State**
```javascript
// In DetailsScreen or Redux DevTools
const detailsState = useSelector(s => s.details);
console.log('Cache:', detailsState.cache);
console.log('Loading:', detailsState.loading);
console.log('Error:', detailsState.error);
```

### **Monitor API Calls**
```javascript
// In transportApi.js
console.log('Fetching details for:', id);
console.log('Trying timetable endpoints for:', raw);
```

### **Track Navigation Params**
```javascript
// In DetailsScreen
console.log('Passed item:', route.params?.item);
console.log('Item ID:', id);
```

---

## 🎉 Summary

Your Details Screen now features:
- ✅ **Redux Toolkit** state management with caching
- ✅ **Smooth tap interactions** with instant UI
- ✅ **Pull-to-refresh** for entire view
- ✅ **Schedule refresh** button for efficient updates
- ✅ **Enhanced UI** with better visuals and feedback
- ✅ **Smart API usage** respecting free plan limits
- ✅ **User validation** for booking flows
- ✅ **Error handling** with friendly alerts

**Next Steps:**
1. Test item tap from HomeScreen → Details
2. Try pull-to-refresh gesture
3. Test schedule refresh button
4. Verify booking flow with login validation
5. Check Redux DevTools for state updates

Enjoy your fully-featured Details Screen! 🚀
