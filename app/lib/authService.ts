import axios from "axios";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export const Login = async (val: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/login`,
      {
        val: val,
        password: password,
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
