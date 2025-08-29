// export interface ChatResponse {
//   chat: string;
//   messages: Message[];
// }

// export interface Message {
//   id: number;
//   username: string;
//   chat_id: number;
//   sender_id: number;
//   date: string;
//   file_name: string | null;
//   mime_type: string | null;
//   file_size: number | null;
//   text: string;
// }

export type ChatMessage = {
  id: number;
  username: string | null;
  chat_id: number;
  sender_id: number;
  date: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: string | number | null;
  text: string | null;
  buttons: ChatButton[];
};

export type ChatButton = {
  text: string;
  data: string;
};

// export type ChatPayload = {
//   chat: string;
//   messages: ChatMessage[];
// };
