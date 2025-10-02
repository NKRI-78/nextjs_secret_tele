import Swal from "sweetalert2";
import api from "./axios";
import axios from "axios";
import { CompanyDoc } from "../interfaces/botsecret/company";
import Cookies from "js-cookie";

export const ChatMessageList = async () => {
  try {
    const response = await api.get("/messages/@AnakAsuhanRembolan_iBot?limit=10");
    const data = response?.data?.messages;
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

export const ChatMessageListResult = async () => {
  try {
    const token = Cookies.get("token");
    const response = await api.get("/get_search_results/v2", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response?.data?.results;
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

export const ChatMessageListCompany = async (formData: FormData) => {
  try {
    const response = await api.post("/search_perusahaan", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = response?.data?.data as CompanyDoc[];
    return data;
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e?.response?.data?.message || e.message,
      timer: 2000,
      showConfirmButton: false,
    });
    throw e;
  }
};

export const SendMessage = async (formData: FormData) => {
  try {
    const token = Cookies.get("token");
    const rsponse = await api.post(`/send`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return rsponse;
  } catch (e: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: (e?.response?.data?.detail || e.message).replace("401:", ""),
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

export const SendMessageBtn = async (formData: FormData) => {
  try {
    await api.post("/click_button", formData, {
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
