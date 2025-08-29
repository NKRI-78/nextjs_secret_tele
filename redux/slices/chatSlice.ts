import { ChatMessage } from "@/app/interfaces/botsecret/answer";
import {
  ChatAdminList,
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

export const chatAdminListAsync = createAsyncThunk(
  "chat/admin/list",
  async () => {
    const response = await ChatAdminList();
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

// export const AskAsync = createAsyncThunk(
//   "chat/ask",
//   async ({ data: data }: { data: any }) => {
//     const response = await AskAnswer(data);
//     return response;
//   }
// );

// export const getAnswerAsync = createAsyncThunk("chat/answer", async () => {
//   const response = await GetAnswer();
//   return response;
// });

interface ChatState {
  loading: boolean;
  // data: ChatResponse | null;
  // answer: AnswerItem[];
  message: ChatMessage[];
  error: string | null;
}

const initialState: ChatState = {
  // data: null,
  // answer: [],
  message: [],
  loading: false,
  error: null,
};

// clearChat

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // clearChat(state) {
    // state.data = null;
    // },
    clearChatMessage(state) {
      state.message = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(getAnswerAsync.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(
      //   getAnswerAsync.fulfilled,
      //   (state, action: PayloadAction<AnswerItem[]>) => {
      //     state.answer = action.payload;
      //     state.loading = false;
      //   }
      // )
      // .addCase(getAnswerAsync.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.error.message || "Failed to fetch answer data";
      // })
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
