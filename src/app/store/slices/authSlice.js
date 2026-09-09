import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../utils/api';
import {
  activatePortalSession,
  clearAllPortalSessions,
  clearPortalSession,
  getActivePortalRole,
  getPortalSession,
  migrateLegacySession,
  savePortalSession,
  updateStoredPortalUser,
} from '../../utils/authStorage';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const loginWithOtp = createAsyncThunk('auth/loginOtp', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.loginWithOtp(credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getProfile();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (body, { rejectWithValue }) => {
  try {
    const response = await authApi.updateProfile(body);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const applySession = (state, { user, token }) => {
  state.user = user;
  state.token = token;
  state.selectedRole = user.role;
  state.isAuthenticated = true;
  savePortalSession(user.role, { token, user });
};

const initialState = {
  user: null,
  token: null,
  selectedRole: null,
  isAuthenticated: false,
  isHydrated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromStorage: (state) => {
      migrateLegacySession();

      const activeRole = getActivePortalRole();
      const session = activeRole ? getPortalSession(activeRole) : null;

      if (session) {
        activatePortalSession(activeRole);
        state.user = session.user;
        state.token = session.token;
        state.selectedRole = session.user.role;
        state.isAuthenticated = true;
      } else {
        // Restore selectedRole for auth screens only (no active portal in this tab yet)
        state.user = null;
        state.token = null;
        state.selectedRole =
          (typeof window !== 'undefined' &&
            (sessionStorage.getItem('selectedRole') || localStorage.getItem('selectedRole'))) ||
          null;
        state.isAuthenticated = false;
      }

      state.isHydrated = true;
    },
    activateRoleSession: (state, action) => {
      const role = action.payload;
      const session = getPortalSession(role);
      if (!session || !activatePortalSession(role)) {
        return;
      }
      state.user = session.user;
      state.token = session.token;
      state.selectedRole = role;
      state.isAuthenticated = true;
      state.error = null;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedRole', action.payload);
        localStorage.setItem('selectedRole', action.payload);
      }
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('selectedRole');
        localStorage.removeItem('selectedRole');
      }
    },
    logout: (state) => {
      const role = state.user?.role || getActivePortalRole();
      clearPortalSession(role);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedRole = null;
      state.error = null;
    },
    logoutAllPortals: (state) => {
      clearAllPortalSessions();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.selectedRole = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (state, action) => {
      applySession(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        applySession(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.loading = false;
        applySession(state, action.payload);
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        applySession(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        updateStoredPortalUser(action.payload);
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        updateStoredPortalUser(action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  hydrateFromStorage,
  activateRoleSession,
  setSelectedRole,
  clearSelectedRole,
  logout,
  logoutAllPortals,
  clearError,
  setAuth,
} = authSlice.actions;
export default authSlice.reducer;
