import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {loginApi, registerApi} from '../api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {user: null, isLoggedIn: false, loading: false, error: null, token: null};

export const loginUser = createAsyncThunk('auth/loginUser', async ({username, password}, {rejectWithValue}) => {
  try {
    // Check locally stored users first (so users registered via app can login immediately)
    try {
      const raw = await AsyncStorage.getItem('@local_users');
      if (raw) {
        const users = JSON.parse(raw);
        const found = users.find((u) => u.username === username && u.password === password);
        if (found) {
          // return a consistent shape similar to dummyjson login response
          return {username: found.username, firstName: found.firstName || '', lastName: found.lastName || '', token: `local-${Date.now()}`};
        }
      }
    } catch (e) {
      // ignore local storage errors and continue to remote
    }

    const res = await loginApi({username, password});
    return res;
  } catch (e) {
    return rejectWithValue(e.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, {rejectWithValue}) => {
  try {
    // Save user to local storage so they can log in immediately
    try {
      const raw = await AsyncStorage.getItem('@local_users');
      const users = raw ? JSON.parse(raw) : [];
      const existing = users.find((u) => u.username === payload.username);
      if (!existing) {
        const newUser = {username: payload.username, password: payload.password, firstName: payload.firstName || '', lastName: payload.lastName || ''};
        users.push(newUser);
        await AsyncStorage.setItem('@local_users', JSON.stringify(users));
      }
    } catch (e) {
      // ignore storage errors
    }

    // Try to call remote register for demo purposes, but don't fail if remote doesn't allow
    try {
      const res = await registerApi(payload);
      // Try auto-login via remote
      try {
        const loginRes = await loginApi({username: payload.username, password: payload.password});
        return {...res, ...loginRes};
      } catch (e) {
        // remote login failed; return basic local user shape
        return {username: payload.username, firstName: payload.firstName || '', lastName: payload.lastName || '', token: `local-${Date.now()}`};
      }
    } catch (e) {
      // remote register failed/unsupported — still allow local registration
      return {username: payload.username, firstName: payload.firstName || '', lastName: payload.lastName || '', token: `local-${Date.now()}`};
    }
  } catch (e) {
    return rejectWithValue(e.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        // DummyJSON returns id, username, token, firstName, lastName, etc.
        s.user = {username: a.payload.username, firstName: a.payload.firstName, lastName: a.payload.lastName};
        s.isLoggedIn = true;
        s.token = a.payload.token || null;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message || 'Login failed';
      })
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = {username: a.payload.username, firstName: a.payload.firstName, lastName: a.payload.lastName};
        s.isLoggedIn = true;
        // Dummy add user doesn't return a token; leave token null
        s.token = a.payload.token || null;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message || 'Registration failed';
      });
  },
});

export const {logout} = authSlice.actions;
export default authSlice.reducer;
