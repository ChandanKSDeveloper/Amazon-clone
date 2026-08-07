import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from "redux-persist/es/storage";
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice'
import orderReducer from './slices/orderSlice'

// 1. Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  product: productReducer,
  order : orderReducer
});

// 2. Define persist config
const persistConfig = {
  key: 'root', // key for localStorage
  storage,
  // Whitelist: ONLY cart is persisted. (User is handled via token + checkAuth)
  whitelist: ['cart'] 
};

// 3. Wrap rootReducer in persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Create store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  // Optional: Add middleware to ignore non-serializable checks caused by redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 5. Create persistor
export const persistor = persistStore(store);