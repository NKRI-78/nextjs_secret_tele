import Swal from "sweetalert2";
import api from "@lib/axios";

export const ProductList = async () => {
  try {
    const response = await api.get(`/api/v1/product`);
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
