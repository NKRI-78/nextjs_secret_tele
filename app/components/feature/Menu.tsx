"use client";

import {
  FaIdCard,
  FaImage,
  FaInfo,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

import { MdDirectionsCar, MdSettings, MdSimCard } from "react-icons/md";

import Chat from "@/app/components/chat/MessaggeList";
import { setFeature, setNavbar } from "@redux/slices/featureSlice";
import { AppDispatch, RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import Settings from "../settings/Settings";

const features = [
  { label: "NIK", icon: <FaIdCard />, command: "nik" },
  { label: "CEK KK", icon: <FaUsers />, command: "kk" },
  { label: "CEK POS", icon: <FaMapMarkerAlt />, command: "cp" },
  { label: "NOPOL", icon: <MdDirectionsCar />, command: "nopol" },
  { label: "NOKA", icon: <MdSimCard />, command: "noka" },
  { label: "NOSIN", icon: <MdSettings />, command: "nosin" },
  { label: "NAMA", icon: <FaSearch />, command: "nama" },
  { label: "FR", icon: <FaImage />, command: "fr" },
  { label: "PHONE", icon: <FaPhone />, command: "phone" },
  { label: "HP2NIK", icon: <FaIdCard />, command: "hp2nik" },
  { label: "INFO", icon: <FaInfo />, command: "info" },
];

const FeatureMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const navbar = useSelector((state: RootState) => state.feature.navbar);
  const feature = useSelector((state: RootState) => state.feature.feature);

  const handleFeatureClick = (feature: string) => {
    dispatch(setFeature(feature));
    dispatch(setNavbar("feature"));
  };

  return (
    <div className="w-full flex justify-center px-4">
      {navbar == "settings" ? (
        <Settings />
      ) : (
        <div>
          <h1 className="text-xl font-bold text-center my-6">
            Fitur {feature}
          </h1>
          {!feature ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {features.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center bg-white shadow-md rounded-xl p-4 hover:bg-blue-50 transition"
                    onClick={() => handleFeatureClick(item.command)}
                  >
                    <div className="text-3xl text-blue-600 mb-2">
                      {item.icon}
                    </div>
                    <div className="text-xs text-center font-semibold text-gray-700">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4">
              <button
                onClick={() => dispatch(setFeature(""))}
                className="mb-4 text-blue-500 underline text-sm"
              >
                ← Kembali
              </button>
              <Chat />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeatureMenu;
