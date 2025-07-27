import { ChatResponse } from "@app/interfaces/chat/chat";
import { ChatList, SendMessage } from "@app/lib/chatService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const chatListAsync = createAsyncThunk("chat/list", async () => {
  const response = await ChatList();
  return response;
});

export const sendMsgAsync = createAsyncThunk(
  "chat/send",
  async ({ msg }: { msg: string }) => {
    await SendMessage(msg);
  }
);

interface ChatState {
  loading: boolean;
  data: ChatResponse | null;
  error: string | null;
}

const initialState: ChatState = {
  data: null,
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
    clearChat(state) {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(chatListAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        chatListAsync.fulfilled,
        (state, action: PayloadAction<ChatResponse>) => {
          state.data = action.payload;
          state.loading = false;
        }
      )
      .addCase(chatListAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch chat data";
      });
  },
});

export const { clearError, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
