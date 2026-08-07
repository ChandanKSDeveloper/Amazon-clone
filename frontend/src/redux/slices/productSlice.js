import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios"; // Adjust path as needed

// Helper function (can also be a utility file)
const getErrorMessage = (error, fallbackMessage) =>
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMessage;

// -------------------- THUNKS (Async Actions) --------------------

// 1. Get All Products
export const getAllProducts = createAsyncThunk(
    "product/getAllProducts",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.keyword) queryParams.append('keyword', params.keyword);
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.category) queryParams.append('category', params.category);
            if (params.priceMin) queryParams.append('priceMin', params.priceMin);
            if (params.priceMax) queryParams.append('priceMax', params.priceMax);
            if (params.rating) queryParams.append('rating', params.rating);

            const { data } = await api.get("/products", { params });

            console.log(data)
            return data; // This gets passed to extraReducers as 'action.payload'
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch products"));
        }
    }
);

// 2. Get Product By ID
export const getProductById = createAsyncThunk(
    "product/getProductById",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/product/${id}`);
            console.log(data)
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch product"));
        }
    }
);

// 3. Create Product (Admin)
export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/admin/product/new", payload,  {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to create product"));
        }
    }
);

// 4. Update Product (Admin)
export const updateProduct = createAsyncThunk(
    "product/updateProduct",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/admin/product/${id}`, payload,   {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to update product"));
        }
    }
);

// 5. Delete Product (Admin)
export const deleteProduct = createAsyncThunk(
    "product/deleteProduct",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.delete(`/admin/product/${id}`);
            return { ...data, deletedId: id }; // Pass ID so we can filter it out of state
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to delete product"));
        }
    }
);

// 6. Create Review
export const createProductReview = createAsyncThunk(
    "product/createProductReview",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.put("/review", payload);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to save review"));
        }
    }
);

// 7. Get Product Reviews
export const getProductReviews = createAsyncThunk(
    "product/getProductReviews",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/reviews", { params: { id } });
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to fetch reviews"));
        }
    }
);

// 8. Delete Review
export const deleteProductReview = createAsyncThunk(
    "product/deleteProductReview",
    async ({ productId, id }, { rejectWithValue }) => {
        try {
            const { data } = await api.delete("/reviews", { params: { productId, id } });
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to delete review"));
        }
    }
);

// -------------------- SLICE DEFINITION --------------------

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: [],
        product: null,
        reviews: [],
        loading: false,
        error: null,
        message: null,
        count: 0,
        productsCount: 0,
        currentPage: 1,
        resultPerPage: 10,
        totalPages: 0,
        filteredProductsCount: 0,
        isChangingPage: false,
        
        // Review-specific state
        reviewLoading: false,
        reviewError: null,
        submitReviewSuccess: false,
    },
    reducers: {
        // Sync actions go here
        clearError: (state) => { state.error = null; },
        clearMessage: (state) => { state.message = null; },
        clearReviewState: (state) => {
            state.reviewLoading = false;
            state.reviewError = null;
            state.submitReviewSuccess = false;
        },
        setProducts: (state, action) => { state.products = action.payload; },
        setProduct: (state, action) => { state.product = action.payload; },
    },
    extraReducers: (builder) => {
        builder
            // ---------- GET ALL PRODUCTS ----------
            .addCase(getAllProducts.pending, (state, action) => {
                state.loading = true;
                state.isChangingPage = action.meta.arg?.page > 1;
                state.error = null;
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.isChangingPage = false;
                state.products = Array.isArray(action.payload.products) ? action.payload.products : [];
                state.count = action.payload.count ?? 0;
                state.productsCount = action.payload.productsCount ?? 0;
                state.currentPage = parseInt(action.meta.arg?.page) || 1;
                state.resultPerPage = action.payload.resultPerPage ?? 10;
                state.totalPages = Math.ceil(action.payload.productsCount / action.payload.resultPerPage);
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.isChangingPage = false;
                state.products = [];
                state.error = action.payload;
            })
            // ---------- GET PRODUCT BY ID ----------
            .addCase(getProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload.product ?? null;
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.loading = false;
                state.product = null;
                state.error = action.payload;
            })
            // ---------- CREATE PRODUCT ----------
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload.product ?? null;
                state.message = "Product created successfully";
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ---------- UPDATE PRODUCT ----------
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload.product ?? null;
                state.message = "Product updated successfully";
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ---------- DELETE PRODUCT ----------
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter((p) => p._id !== action.payload.deletedId);
                if (state.product?._id === action.payload.deletedId) state.product = null;
                state.message = action.payload.message ?? "Product deleted successfully";
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ---------- CREATE REVIEW ----------
            .addCase(createProductReview.pending, (state) => {
                state.reviewLoading = true;
                state.reviewError = null;
                state.submitReviewSuccess = false;
            })
            .addCase(createProductReview.fulfilled, (state, action) => {
                state.reviewLoading = false;
                state.submitReviewSuccess = true;
                state.message = action.payload.message ?? "Review saved successfully";
            })
            .addCase(createProductReview.rejected, (state, action) => {
                state.reviewLoading = false;
                state.reviewError = action.payload;
                state.submitReviewSuccess = false;
            })
            // ---------- GET REVIEWS ----------
            .addCase(getProductReviews.pending, (state) => {
                state.reviewLoading = true;
                state.reviewError = null;
            })
            .addCase(getProductReviews.fulfilled, (state, action) => {
                state.reviews = Array.isArray(action.payload.reviews) ? action.payload.reviews : [];
                state.reviewLoading = false;
            })
            .addCase(getProductReviews.rejected, (state, action) => {
                state.reviews = [];
                state.reviewLoading = false;
                state.reviewError = action.payload;
            })
            // ---------- DELETE REVIEW ----------
            .addCase(deleteProductReview.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(deleteProductReview.fulfilled, (state, action) => {
                state.reviews = Array.isArray(action.payload.reviews) ? action.payload.reviews : [];
                state.loading = false;
                state.message = action.payload.message ?? "Review deleted successfully";
            })
            .addCase(deleteProductReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearMessage, clearReviewState, setProducts, setProduct } = productSlice.actions;
export default productSlice.reducer;