import Cookies from "js-cookie";

import moment from "moment";

export const getUserId = (): string | undefined => {
  return Cookies.get("user_id");
};

export const getUserName = (): string | undefined => {
  return Cookies.get("username");
};

export const getToken = (): string | undefined => {
  return Cookies.get("token");
};

export const handleDescriptionTruncate = (
  description: string,
  maxLength: number = 100
) => {
  return description.length > maxLength
    ? `${description.substring(0, maxLength)}...`
    : description;
};

export const formatRupiah = (amount: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export const formatDate = (date: string | Date): string => {
  return moment(date).format("YYYY-MM-DD HH:mm:ss");
};
