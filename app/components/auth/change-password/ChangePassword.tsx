"use client";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import {
    setPassword,
    setShowPassword,
    updatePasswordAsync
} from "@redux/slices/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const password = useSelector((state: RootState) => state.auth.password);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const showPassword = useSelector((state: RootState) => state.auth.showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await dispatch(
      updatePasswordAsync({ password: password })
    ).unwrap();

    router.push("/");
  };

  return (
    <div className="flex w-full items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Update Password</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={password}
                onChange={(e) => dispatch(setPassword(e.target.value))}
                className="w-full px-4 text-black py-2 mt-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                required
              />
              <button
                type="button"
                onClick={() => dispatch(setShowPassword(!showPassword))}
                className="absolute right-3 top-0 transform translate-y-5 text-gray-500"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />} 
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 font-semibold text-white bg-blue rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
