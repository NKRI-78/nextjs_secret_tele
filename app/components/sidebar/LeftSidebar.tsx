"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@redux/store";
import { ChevronRight, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { setShowLogoutModal } from "@redux/slices/modalSlice";
import { GetProfile } from "@app/lib/profileService";
import { GetProfileAsync, setFullname } from "@redux/slices/profileSlice";

const LeftSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fullname = useSelector((state: RootState) => state.profile.fullname);
  const pathname = usePathname();

  useEffect(() => {
    dispatch(GetProfileAsync());
  }, [dispatch]);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white p-4 z-[110]">
      <div className="flex items-center gap-2 mb-4">
        <img
          src={"/favicon.ico"}
          alt="Logo"
          className="w-10 rounded-full bg-slate-200"
        />
        <h2 className="text-md font-bold">{fullname}</h2>
      </div>

      <ul>
        {/* <li className="mb-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="hover:text-gray-400 w-full text-left flex items-center justify-between"
          >
            <span>POS Features</span>
            {showDropdown ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {showDropdown && (
            <ul className="ml-4 mt-2 max-h-64 overflow-y-auto pr-2">
              {[
                { label: "Dashboard", path: "/dashboard" },
                { label: "Transactions", path: "/transactions" },
                { label: "Products", path: "/products" },
                { label: "Customers", path: "/customers" },
                { label: "Reports", path: "/reports" },
                { label: "Settings", path: "/settings" },
              ].map((item) => (
                <li key={item.path} className="mb-2">
                  <Link
                    href={item.path}
                    className={`hover:text-gray-300 ${
                      isActive(item.path) ? "text-green-400 font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li> */}

        <li className="mb-4">
          <Link
            href="/"
            className={`hover:text-gray-400 ${
              isActive("/") ? "text-green-400 font-bold" : ""
            }`}
          >
            Home
          </Link>
        </li>

        <li className="mb-4">
          <Link
            href="/products"
            className={`hover:text-gray-400 ${
              isActive("/products") ? "text-green-400 font-bold" : ""
            }`}
          >
            Products
          </Link>
        </li>

        <li className="mb-4">
          <button
            onClick={() => dispatch(setShowLogoutModal(true))}
            className="hover:text-gray-400"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default LeftSidebar;
