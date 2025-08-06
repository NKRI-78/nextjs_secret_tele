import axios from "axios";
import Swal from "sweetalert2";

export const UploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("folder", "bot-secret");
  formData.append("subfolder", "fr");
  formData.append("media", file);

  try {
    const response = await axios.post(
      `https://api-media.inovatiftujuh8.com/api/v1/media/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
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
