import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios"; 

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallbackMessage;

// --- ASYNC THUNKS ---

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const isFormData = userData instanceof FormData;
      const config = isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
      const { data } = await api.post("/auth/register", userData, config);

      if (data.token) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Registration failed"));
    }
  },
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", userData);
      if (data.token) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Login failed"));
    }
  },
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.get("/auth/logout");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return "Logout successful";
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue(getErrorMessage(error, "Logout failed"));
    }
  },
);

export const getUserProfile = createAsyncThunk(
  "user/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue(getErrorMessage(error, "Failed to get user"));
    }
  },
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/auth/me/update", userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update profile"),
      );
    }
  },
);

export const updatePassword = createAsyncThunk(
  "user/updatePassword",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/auth/password/update", userData);
      if (data.token) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update password"),
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/forgot-password", userData);
      return data.message || "Password reset link sent to your email";
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to send reset link"),
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ token, passwordData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/auth/password/reset/${token}`,
        passwordData,
      );
      if (data.token) {
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to reset password"),
      );
    }
  },
);

export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found"); // Handled cleanly in extraReducers

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue("Token expired/invalid"); // Silent fail for user
    }
  },
);

// Admin Thunks (Using separate loading state)
export const getAllUsersAdmin = createAsyncThunk(
  "user/getAllAdmin",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("admin/users", { params });
      console.log(data);
      console.log(data.users);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch users"));
    }
  },
);

export const updateUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update user"));
    }
  },
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/user/${id}`);
      return { id, message: data.message || "User deleted successfully" };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete user"));
    }
  },
);

// --- SLICE ---

const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  loading: false, // Used for general auth actions
  adminLoading: false, // Used specifically for admin table actions
  authChecked: false,
  error: null,
  message: null,
  isUpdating: false,
  usersCount: 0,
  currentPage: 1,
  totalPages: 1,
  resultPerPage: 10,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearUpdating: (state) => {
      state.isUpdating = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    // Helper to reduce repetition for auth thunks
    const handleAuthPending = (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    };
    const handleAuthReject = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Register
      .addCase(registerUser.pending, handleAuthPending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.token) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.message = action.payload.message;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Login
      .addCase(loginUser.pending, handleAuthPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.pending, handleAuthPending)
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Get Profile
      .addCase(getUserProfile.pending, handleAuthPending)
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Check Auth (App Start)
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        // Don't set error on app start check fail
        state.loading = false;
        state.authChecked = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })

      // Update Profile
      .addCase(updateProfile.pending, handleAuthPending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null; // Mirrors your Zustand logic
      })

      // Update Password
      .addCase(updatePassword.pending, handleAuthPending)
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, handleAuthPending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Reset Password
      .addCase(resetPassword.pending, handleAuthPending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.message = action.payload.message || "Password reset successfully";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // --- ADMIN THUNKS ---
      .addCase(getAllUsersAdmin.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(getAllUsersAdmin.fulfilled, (state, action) => {
        state.users = action.payload.users;
        const { currentPage, totalPages, totalUsers, limit } = action.payload.pagination;

        state.usersCount = totalUsers || 0;
        state.currentPage = currentPage || 1;
        state.totalPages = totalPages || 1; 
        state.resultPerPage = limit || 10;
        state.adminLoading = false;
      })
      .addCase(getAllUsersAdmin.rejected, (state, action) => {
        state.error = action.payload;
        state.adminLoading = false;
      })

      .addCase(updateUserRole.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload.user._id ? action.payload.user : u,
        );
        state.adminLoading = false;
        state.message = action.payload.message || "User updated successfully";
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload;
        state.adminLoading = false;
      })

      .addCase(deleteUser.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.adminLoading = false;
        state.message = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
        state.adminLoading = false;
      });
  },
});

export const { clearError, clearMessage, clearUpdating, clearUser } =
  userSlice.actions;
export default userSlice.reducer;
