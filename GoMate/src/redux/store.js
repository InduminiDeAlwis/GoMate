import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import itemsReducer from './itemsSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
    theme: themeReducer,
  },
});

export default store;
