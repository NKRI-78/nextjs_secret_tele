import axios from "axios";
import Swal from "sweetalert2";

export const Login = async (val: string, password: string) => {
  try {
    const response = await axios.post(
      `https://api-sabi.langitdigital78.com/api/v1/auth`,
      {
        email: val,
        password: password,
      }
    );
    const data = response.data;
    console.log(data);
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
