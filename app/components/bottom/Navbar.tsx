"use client";

import { setNavbar } from "@/redux/slices/featureSlice";
import { AppDispatch, RootState } from "@redux/store";
import { MdApps, MdSettings } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

const BottomNavbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navbar = useSelector((state: RootState) => state.feature.navbar);

  const handleChange = (value: string) => {
    dispatch(setNavbar(value));
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 w-full bg-white border-t shadow-inner flex justify-around items-center h-14 z-50">
      <button
        className={`flex flex-col items-center text-xs ${
          navbar === "feature" ? "text-blue-600" : "text-gray-500"
        }`}
        onClick={() => handleChange("feature")}
      >
        <MdApps className="text-lg mb-1" />
        Feature
      </button>
      <button
        className={`flex flex-col items-center text-xs ${
          navbar === "settings" ? "text-blue-600" : "text-gray-500"
        }`}
        onClick={() => handleChange("settings")}
      >
        <MdSettings className="text-lg mb-1" />
        Settings
      </button>
    </div>
  );
};

export default BottomNavbar;
