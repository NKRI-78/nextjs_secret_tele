// export interface AnswerItem {
//   request_id: number;
//   request_content: string;
//   request_content_type: string;
//   request_media: string;
//   request_time: string;
//   request_sender: number;
//   request_receiver: number;
//   answer_id: number | null;
//   answer_content: string | null;
//   answer_content_type: string | null;
//   answer_media: string | null;
//   answer_time: string | null;
// }

export type ChatButton = {
  text: string;
  data: string;
};

export type ChatMessage = {
  id: number;
  username: string | null;
  chat_id: number;
  sender_id: number;
  date: string; // ISO
  file_name: string | null;
  mime_type: string | null;
  file_size: string | number | null;
  text: string | null;
  buttons: ChatButton[];
};

// export type ChatPayload = {
//   chat: string;
//   messages: ChatMessage[];
// };
