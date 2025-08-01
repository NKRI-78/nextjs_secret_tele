import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FeatureState {
  navbar: string;
  feature: string;
}

const initialState: FeatureState = {
  navbar: "feature",
  feature: "",
};

const featureSlice = createSlice({
  name: "feature",
  initialState,
  reducers: {
    setNavbar(state, action: PayloadAction<string>) {
      state.navbar = action.payload;
    },
    setFeature(state, action: PayloadAction<string>) {
      state.feature = action.payload;
    },
  },
});

export const { setNavbar, setFeature } = featureSlice.actions;
export default featureSlice.reducer;
