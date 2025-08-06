import Swal from "sweetalert2";
import api from "./axios";
import axios from "axios";

export const ChatList = async () => {
  try {
    const response = await api.get(``);
    const data = response.data;
    return data;
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e?.response?.data?.message || e.message,
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

export const ChatAdminList = async () => {
  try {
    const response = await api.get(``);
    const data = response.data;
    return data;
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e?.response?.data?.message || e.message,
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

export const SendMessage = async (formData: FormData) => {
  try {
    await api.post(`/send`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e?.response?.data?.message || e.message,
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

export const AskAnswer = async (data: any) => {
  try {
    await axios.post(
      `https://socketio-capbridge.langitdigital78.com/ask-bot-secret`,
      {
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        content: data.content,
        content_type: data.content_type,
        media: data.media,
        prefix: data.prefix,
        type: data.type,
      }
    );
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e?.response?.data?.message || e.message,
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

export const GetAnswer = async () => {
  try {
    const response = await axios.get(
      `https://socketio-capbridge.langitdigital78.com/answer-bot-secret`
    );
    const data = response.data.data.answer;
    return data;
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e?.response?.data?.message || e.message,
      timer: 2000,
      showConfirmButton: false,
    });
  }
};
