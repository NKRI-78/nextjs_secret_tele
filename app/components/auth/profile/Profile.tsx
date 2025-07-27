"use client";

import Cookies from "js-cookie";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@redux/store";
import { setFullname, updateProfileAsync } from "@redux/slices/profileSlice";
import { useRouter } from "next/navigation";
import { GetProfile } from "@/app/lib/profileService";
import { useEffect } from "react";

const Profile: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const fullname = useSelector((state: RootState) => state.profile.fullname);
    const loading = useSelector((state: RootState) => state.profile.loading);

    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await GetProfile();
            if (profile?.data?.profile.fullname) {
                dispatch(setFullname(profile.data.profile.fullname));
            }
        };
        fetchProfile();
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await dispatch(updateProfileAsync({ fullname })).unwrap();

        Cookies.set("username", fullname, {
            expires: 365,
            secure: true,
            sameSite: "strict",
        });

        router.push("/");
    };

    return (
        <div className="flex w-full items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-gray-800">Update Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-600">
                        Fullname
                    </label>
                    <input
                    type="text"
                    id="fullname"
                    value={fullname}
                    onChange={(e) => dispatch(setFullname(e.target.value))}
                    className="w-full px-4 text-black py-2 mt-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                    required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 mt-4 font-semibold text-white bg-blue rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                >
                    {loading ? "Updating..." : "Update Profile"}
                </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
