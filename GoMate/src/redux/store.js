import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import itemsReducer from './itemsSlice';
import themeReducer from './themeSlice';
import detailsReducer from './detailsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
    theme: themeReducer,
    details: detailsReducer,
  },
});

export default store;
