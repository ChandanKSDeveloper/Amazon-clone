import {
  createSlice,
  createAsyncThunk,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import api from "../../config/axios";

const getErrorMessage = (error, fallbackMessage) => {
  if (error?.response) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallbackMessage
    );
  }

  return error?.message || fallbackMessage;
};

// asynce thunks

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/order/new", orderData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "failed to create order"));
    }
  },
);


export const getMyOrders = createAsyncThunk(
    "order/getMyOrders",
    async(_, {rejectWithValue}) => {
        try {
            const {data} = await api.get('/orders/me');
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "failed to get your order"));
        }
    }
)

export const getOrderDetails = createAsyncThunk(
    'order/getOrderDetails',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/order/${id}`);
            return data; // Expects { order: {...} }
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch order details'));
        }
    }
);

export const getAllOrders = createAsyncThunk(
    'order/getAllOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/admin/orders');
            return data; // Expects { orders: [...] }
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch all orders'));
        }
    }
);

// 5. Admin: Update Order Status
export const updateOrder = createAsyncThunk(
    'order/updateOrder',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/admin/order/${id}`, { status });
            return data; // Expects { order: {...} }
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to update order'));
        }
    }
);

// 6. Admin: Delete Order
export const deleteOrder = createAsyncThunk( 
    'order/deleteOrder',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/order/${id}/cancel`);
            return { ...data, id }; // Pass the ID back so we can filter it out of state
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to delete order'));
        }
    }
);


const initialState = {
    order: null,
    orders: [],
    loading: false,
    error: null,
    success: false,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        // Sync actions for resetting UI state
        clearOrderErrors: (state) => {
            state.error = null;
        },
        clearOrderSuccess: (state) => {
            state.success = false;
        },
        resetSingleOrder: (state) => {
            state.order = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- CREATE ORDER ---
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload.order;
                state.success = true;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // --- GET MY ORDERS ---
            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- GET ORDER DETAILS ---
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload.order;
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- ADMIN: GET ALL ORDERS ---
            .addCase(getAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
            })
            .addCase(getAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- ADMIN: UPDATE ORDER ---
            .addCase(updateOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updatedOrder = action.payload.order;
                
                // Update the order in the main list if it exists there
                state.orders = state.orders.map((o) => o._id === updatedOrder._id ? updatedOrder : o);
                
                // Also update the single order view if the user is looking at it
                if (state.order?._id === updatedOrder._id) {
                    state.order = updatedOrder;
                }
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // --- ADMIN: DELETE ORDER ---
            .addCase(deleteOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const deletedId = action.payload.id;
                
                // Remove from list
                state.orders = state.orders.filter((o) => o._id !== deletedId);
                
                // Clear single view if it was deleted
                if (state.order?._id === deletedId) {
                    state.order = null;
                }
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { clearOrderErrors, clearOrderSuccess, resetSingleOrder } = orderSlice.actions;
export default orderSlice.reducer;