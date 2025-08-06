import { AnswerItem } from "@app/interfaces/botsecret/answer";
import { ChatResponse } from "@app/interfaces/chat/chat";
import {
  AskAnswer,
  ChatAdminList,
  ChatList,
  GetAnswer,
  SendMessage,
} from "@app/lib/chatService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const chatListAsync = createAsyncThunk("chat/list", async () => {
  const response = await ChatList();
  return response;
});

export const chatAdminListAsync = createAsyncThunk(
  "chat/admin/list",
  async () => {
    const response = await ChatAdminList();
    return response;
  }
);

export const sendMsgAsync = createAsyncThunk(
  "chat/send",
  async ({ formData: FormData }: { formData: FormData }) => {
    await SendMessage(FormData);
  }
);

export const AskAsync = createAsyncThunk(
  "chat/ask",
  async ({ data: data }: { data: any }) => {
    const response = await AskAnswer(data);
    return response;
  }
);

export const getAnswerAsync = createAsyncThunk("chat/answer", async () => {
  const response = await GetAnswer();
  return response;
});

interface ChatState {
  loading: boolean;
  data: ChatResponse | null;
  answer: AnswerItem[];
  error: string | null;
}

const initialState: ChatState = {
  data: null,
  answer: [],
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
      .addCase(getAnswerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAnswerAsync.fulfilled,
        (state, action: PayloadAction<AnswerItem[]>) => {
          state.answer = action.payload;
          state.loading = false;
        }
      )
      .addCase(getAnswerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch answer data";
      })
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
function chatAdminList() {
  throw new Error("Function not implemented.");
}
