import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from "../../config/axios";

const getErrorMessage = (error, fallbackMessage) => {
    if(error?.response){
        return error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        fallbackMessage;

    }

    return error?.message || fallbackMessage;
}

// fetch cart
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',

    async(_, { rejectWithValue }) => {
        try {
            const {data} = await api.get("/cart")
            return data;
        } catch (error) {
             return rejectWithValue(getErrorMessage(error , "Failed to fetch cart"));
        }
    }
)


// Add to Cart
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/cart/${productId}`, { quantity });
      // Backend returns: { success, cart }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error || 'Failed to add to cart'));
    }
  }
);

// Update Cart Quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      // Backend returns: { success, cart }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error || 'Failed to update quantity'));
    }
  }
);

// Remove from Cart
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      // Backend returns: { success, cart }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error || 'Failed to remove item'));
    }
  }
);

//  Clear Cart
export const clearCartApi = createAsyncThunk(
  'cart/clearCartApi',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete('/cart');
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error.response?.data?.message || 'Failed to clear cart'));
    }
  }
);

const initialState = {
    cartItems: [],
    shippingInfo: {},
    totalPrice: 0,
    totalItems: 0,
    cartCount: 0,
    loading: false,
    error: null,
};

const calculateAndSetTotals = (state, cartArray) => {
    state.cartItems = cartArray || [];
    state.totalItems = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    state.cartCount = state.cartItems.length;
    
    // Handles both Mongoose populated objects (item.product.price) and standard objects (item.price)
    state.totalPrice = state.cartItems.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + (price * item.quantity);
    }, 0);
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        updateQuantity: (state, action) => {
            const { productId, qty } = action.payload;
            const item = state.cartItems.find(i => i.product === productId);
            
            if (item) {
                // Clamp quantity between 1 and stock
                item.quantity = Math.min(Math.max(1, qty), item.stock);
            }
        },

        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
        },

        clearLocalCart: (state) => {
            state.cartItems = [];
            state.shippingInfo = {};
            state.totalPrice = 0;
            state.totalItems = 0;
            state.cartCount = 0;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers : (builder) => {
        builder
            .addCase('calculateTotals', (state, action) => {
                 const cart = action.payload || [];
                state.cartItems = cart;
                state.totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                state.cartCount = cart.length;
                state.totalPrice = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
            })
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.cart || [];
                state.totalPrice = action.payload.totalPrice || 0;
                state.totalItems = action.payload.totalItems || 0;
                state.cartCount = action.payload.cartCount || 0;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- ADD TO CART ---
            .addCase(addItemToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addItemToCart.fulfilled, (state, action) => {
                state.loading = false;
                const cart = action.payload.cart || [];
                state.cartItems = cart;
                state.totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                state.cartCount = cart.length;
                state.totalPrice = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- UPDATE QUANTITY ---
            .addCase(updateCartItemQuantity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                state.loading = false;
                const cart = action.payload.cart || [];
                state.cartItems = cart;
                state.totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                state.cartCount = cart.length;
                state.totalPrice = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
            })
            .addCase(updateCartItemQuantity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- REMOVE FROM CART ---
            .addCase(removeItemFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                state.loading = false;
                const cart = action.payload.cart || [];
                state.cartItems = cart;
                state.totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                state.cartCount = cart.length;
                state.totalPrice = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
            })
            .addCase(removeItemFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- CLEAR CART ---
            .addCase(clearCartApi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCartApi.fulfilled, (state) => {
                state.loading = false;
                state.cartItems = [];
                state.totalPrice = 0;
                state.totalItems = 0;
                state.cartCount = 0;
            })
            .addCase(clearCartApi.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { saveShippingInfo, clearLocalCart, recalculateTotals } = cartSlice.actions;
export default cartSlice.reducer;