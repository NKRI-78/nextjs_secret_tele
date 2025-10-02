export type ResultSource = "BOT_TELE" | string;

export interface BotResult {
  id: number;
  result_text: string;
  file_url: string;
  mime_type: string | null;
  username: string;
  message_id: number;
  chat_id: number;
  result_from: ResultSource;
  created_at: string;
  updated_at: string;
}

export interface BotResultSocket {
  id: number;
  result_text: string;
  file_url: string;
  mime_type: string | null;
  username: string;
  message_id: number;
  chat_id: number;
  result_from: string;
  search_user_id?: string | number;
  created_at: string;
  updated_at: string;
}

export interface BotApiResponse {
  error: string | null;
  results: BotResult[];
  status: string;
}
