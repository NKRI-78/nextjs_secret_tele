import { GetProfile, UpdateProfile } from "@app/lib/profileService";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProfileState {
  fullname: string;
  loading: boolean;
}

const initialState: ProfileState = {
  fullname: "",
  loading: false,
};

export const GetProfileAsync = createAsyncThunk(
  "profile/getProfile",
  async () => {
    const response = await GetProfile();
    return response;
  }
);

export const updateProfileAsync = createAsyncThunk(
  "profile/updateProfile",
  async ({ fullname }: { fullname: string }) => {
    const response = await UpdateProfile(fullname);
    return response;
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setFullname: (state, action) => {
      state.fullname = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfileAsync.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(GetProfileAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.fullname = action.payload?.data.fullname || "";
      })
      .addCase(GetProfileAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setFullname } = profileSlice.actions;

export default profileSlice.reducer;
