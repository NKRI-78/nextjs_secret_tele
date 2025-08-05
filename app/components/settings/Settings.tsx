"use client";

import Cookies from "js-cookie";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { getUserName } from "@/app/lib/utils";

const Settings = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user_id");

    router.push("/auth/login");
  };

  return (
    <div className="w-full my-4 mx-4">
      <h2 className="text-lg font-bold mb-4">Profil</h2>

      <div className="flex items-center gap-4 mb-6">
        <FaUserCircle className="w-14 h-14 text-gray-400" />
        <div>
          <p className="text-sm text-gray-600">Username</p>
          <p className="text-base font-semibold">{getUserName()}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition"
      >
        <FiLogOut />
        Logout
      </button>
    </div>
  );
};

export default Settings;
