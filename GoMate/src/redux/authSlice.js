import {createSlice} from '@reduxjs/toolkit';

const initialState = {user: null, isLoggedIn: false};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = {username: action.payload.username};
      state.isLoggedIn = true;
    },
    register(state, action) {
      state.user = {username: action.payload.username};
      state.isLoggedIn = true;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const {login, register, logout} = authSlice.actions;
export default authSlice.reducer;
