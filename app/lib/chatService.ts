import Swal from "sweetalert2";
import api from "./axios";

export const ChatList = async () => {
  try {
    const response = await api.get(`/messages/@squad_ibot?limit=10`);
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

export const SendMessage = async (msg: string) => {
  try {
    await api.post(`/send`, {
      chat: "@squad_ibot",
      message: msg,
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
