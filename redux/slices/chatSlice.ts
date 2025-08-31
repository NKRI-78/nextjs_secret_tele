import { ChatMessage } from "@/app/interfaces/botsecret/answer";
import {
  ChatMessageList,
  SendMessage,
  SendMessageBtn,
} from "@app/lib/chatService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const chatMessageListAsync = createAsyncThunk(
  "chat/message/list",
  async () => {
    const response = await ChatMessageList();
    return response;
  }
);

export const sendMsgButtonAsync = createAsyncThunk(
  "chat/button/send",
  async ({ formData: FormData }: { formData: FormData }) => {
    await SendMessageBtn(FormData);
  }
);

export const sendMsgAsync = createAsyncThunk(
  "chat/send",
  async ({ formData: FormData }: { formData: FormData }) => {
    await SendMessage(FormData);
  }
);


interface ChatState {
  loading: boolean;
  message: ChatMessage[];
  error: string | null;
}

const initialState: ChatState = {
  message: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearChatMessage(state) {
      state.message = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(chatMessageListAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        chatMessageListAsync.fulfilled,
        (state, action: PayloadAction<ChatMessage[]>) => {
          state.message = action.payload;
          state.loading = false;
        }
      )
      .addCase(chatMessageListAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch chat data";
      });
  },
});

export const { clearError, clearChatMessage } = chatSlice.actions;
export default chatSlice.reducer;
