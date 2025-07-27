import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface modalState {
  showLogoutModal: boolean;
}

const initialState: modalState = {
  showLogoutModal: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setShowLogoutModal(state, action: PayloadAction<boolean>) {
      state.showLogoutModal = action.payload;
    },
  },
});

export const { setShowLogoutModal } = modalSlice.actions;
export default modalSlice.reducer;