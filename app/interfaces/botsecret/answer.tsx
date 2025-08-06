export interface AnswerItem {
  request_id: number;
  request_content: string;
  request_content_type: string;
  request_media: string;
  request_time: string;
  request_sender: number;
  request_receiver: number;
  answer_id: number | null;
  answer_content: string | null;
  answer_content_type: string | null;
  answer_media: string | null;
  answer_time: string | null;
}
