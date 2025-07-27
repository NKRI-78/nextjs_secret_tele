import { LoginModel } from "@/app/interfaces/auth/login";
import { Login } from "@lib/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const loginAdminAsync = createAsyncThunk(
  "auth/login",
  async ({ val, password }: { val: string; password: string }) => {
    const response = await Login(val, password);
    return response;
  }
);

interface AuthState {
  loading: boolean;
  data: LoginModel | null;
  isAuthenticated: boolean;
  showPassword: boolean;
  val: string;
  password: string;
  token: string | null;
  error: string | null;
}

const initialState: AuthState = {
  data: null,
  loading: false,
  isAuthenticated: false,
  showPassword: false,
  password: "",
  val: "",
  token: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setVal(state, action: PayloadAction<string>) {
      state.val = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setShowPassword(state, action: PayloadAction<boolean>) {
      state.showPassword = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearToken(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdminAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAdminAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loginAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to login";
      });
  },
});

export const { setVal, setLoading, setPassword, setShowPassword, setError } =
  authSlice.actions;
export default authSlice.reducer;
