import { ChatMessage } from "@/app/interfaces/botsecret/answer";
import { CompanyDoc } from "@/app/interfaces/botsecret/company";
import { BotResult } from "@/app/interfaces/botsecret/result";
import {
  ChatMessageList,
  ChatMessageListCompany,
  ChatMessageListResult,
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

export const chatMessageListResultAsync = createAsyncThunk(
  "chat/message/list/result",
  async () => {
    const response = await ChatMessageListResult();
    return response;
  }
);

export const chatMessageListCompanyAsync = createAsyncThunk<
  CompanyDoc[],
  { formData: FormData }
>("chat/message/list/company", async ({ formData }) => {
  const response = await ChatMessageListCompany(formData);
  return response ?? [];
});

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
  result: BotResult[];
  company: CompanyDoc[];
  error: string | null;
}

const initialState: ChatState = {
  message: [],
  result: [],
  company: [],
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
    clearCompany(state) {
      state.company = [];
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

    builder
      .addCase(chatMessageListResultAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        chatMessageListResultAsync.fulfilled,
        (state, action: PayloadAction<BotResult[]>) => {
          state.result = action.payload;
          state.loading = false;
        }
      )
      .addCase(chatMessageListResultAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch chat data";
      });

    builder
      .addCase(chatMessageListCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        chatMessageListCompanyAsync.fulfilled,
        (state, action: PayloadAction<CompanyDoc[]>) => {
          state.company = action.payload; // <-- store companies
          state.loading = false;
        }
      )
      .addCase(chatMessageListCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch company data";
      });
  },
});

export const { clearError, clearChatMessage, clearCompany } = chatSlice.actions;
export default chatSlice.reducer;
