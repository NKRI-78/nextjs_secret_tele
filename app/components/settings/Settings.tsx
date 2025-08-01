"use client";
import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const Settings = () => {
  const [user, setUser] = useState<{
    username: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const mockUser = {
      username: "inovatif78",
      avatar: "",
    };
    setUser(mockUser);
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    setUser(null);
  };

  if (!user) {
    return (
      <div className="p-4 mt-6 text-center text-gray-600 text-sm">
        Anda belum login.
      </div>
    );
  }

  return (
    <div className="w-full my-4 mx-4">
      <h2 className="text-lg font-bold mb-4">Profil</h2>

      <div className="flex items-center gap-4 mb-6">
        <FaUserCircle className="w-14 h-14 text-gray-400" />
        <div>
          <p className="text-sm text-gray-600">Username</p>
          <p className="text-base font-semibold">{user.username}</p>
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
