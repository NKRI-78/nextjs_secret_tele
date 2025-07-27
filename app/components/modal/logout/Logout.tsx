"use client";

import React from "react";

import Cookies from "js-cookie";

import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";

import { setShowLogoutModal } from "@redux/slices/modalSlice";

const ModalLogout: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();

    const showLogoutModal = useSelector((state: RootState) => state.modal.showLogoutModal);

    const router = useRouter();

    const handleLogout = async () => {
      Cookies.remove("token");
      Cookies.remove("user_id");
      
      router.push("/auth/login"); 

      dispatch(setShowLogoutModal(false))
    };
 
    return (   
       showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md w-96 text-center">
            <h3 className="text-md text-black font-semibold mb-4">Are you sure you want to logout?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => dispatch(setShowLogoutModal(false))}
                className="px-4 py-2 bg-gray-600 rounded text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )
    );
    
};

export default ModalLogout;