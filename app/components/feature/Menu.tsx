"use client";

import {
  FaIdCard,
  FaUserPlus,
  FaUsers,
  FaMapMarkerAlt,
  FaWallet,
  FaBolt,
} from "react-icons/fa";

import {
  MdDirectionsCar,
  MdSimCard,
  MdSettings,
  MdPhoneIphone,
  MdPhoneAndroid,
} from "react-icons/md";

import { AiFillCreditCard } from "react-icons/ai";
import { BsQrCodeScan } from "react-icons/bs";
import Chat from "@components/chat/Chat";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { setNavbar, setFeature } from "@redux/slices/featureSlice";
import Settings from "../settings/Settings";

const features = [
  { label: "NIK", icon: <FaIdCard />, command: "nik" },
  { label: "REGISTER", icon: <FaUserPlus />, command: "register" },
  { label: "CEK KK", icon: <FaUsers />, command: "cek-kk" },
  { label: "CEK POS", icon: <FaMapMarkerAlt />, command: "cek-pos" },
  { label: "TRACE NIK", icon: <MdSettings />, command: "trace-nik" },
  { label: "NOPOL", icon: <MdDirectionsCar />, command: "nopol" },
  { label: "NOKA", icon: <MdSimCard />, command: "noka" },
  { label: "NOSIN", icon: <MdSettings />, command: "nosin" },
  { label: "PLN", icon: <FaBolt />, command: "pln" },
  { label: "TRACE IMEI", icon: <MdPhoneAndroid />, command: "trace-wifi" },
  { label: "E-WALLET", icon: <FaWallet />, command: "e-wallet" },
  {
    label: "CEK REKENING",
    icon: <AiFillCreditCard />,
    command: "cek-rekening",
  },
  { label: "IMEI 2 PHONE", icon: <MdPhoneIphone />, command: "ime2-phone" },
  { label: "PHONE 2 IMEI", icon: <BsQrCodeScan />, command: "phone2-imei" },
  { label: "GSM TRACKER", icon: <MdSettings />, command: "gsm-tracker" },
  { label: "BILL", icon: <AiFillCreditCard />, command: "bill" },
  { label: "PHISHING", icon: <MdSettings />, command: "phishing" },
  { label: "CEK IMEI", icon: <MdSimCard />, command: "cek-imei" },
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
              <Chat selectedCommand={feature} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeatureMenu;
