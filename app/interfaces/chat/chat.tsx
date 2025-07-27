export interface ChatResponse {
  chat: string;
  messages: Message[];
}

export interface Message {
  id: number;
  username: string;
  chat_id: number;
  sender_id: number;
  date: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  text: string;
}


