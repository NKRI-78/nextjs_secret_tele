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
  username: string;
  chat_id: number;
  sender_id: number;
  date: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  text: string;
  buttons: unknown[];
}

export interface BotApiResponse {
  error: string | null;
  results: BotResult[];
  status: string;
}
