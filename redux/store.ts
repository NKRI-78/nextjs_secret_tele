import { configureStore } from "@reduxjs/toolkit";

import modalReducer from "@redux/slices/modalSlice";
import profileReducer from "@redux/slices/profileSlice";
import authReducer from "@redux/slices/authSlice";
import featureReducer from "@redux/slices/featureSlice";
import chatReducer from "@redux/slices/chatSlice";

import { enableMapSet } from "immer";

enableMapSet();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feature: featureReducer,
    chat: chatReducer,
    modal: modalReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
