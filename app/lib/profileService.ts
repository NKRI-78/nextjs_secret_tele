import axios from "axios";
import Swal from "sweetalert2";

import Cookies from "js-cookie";
import api from "@lib/axios";

export const GetProfile = async () => {
  try {
    const response = await api.get("/api/v1/profile");
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

export const UpdateProfile = async (fullname: string) => {
  const token = Cookies.get("token");

  try {
    const response = await axios.post(
      `https://api-sabi.langitdigital78.com/api/v1/profile`,
      {
        avatar_link: "-",
        fullname: fullname,
        phone: "-",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
