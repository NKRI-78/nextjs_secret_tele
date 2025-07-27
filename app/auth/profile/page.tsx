import React from "react";

import type { Metadata } from "next";
import Profile from "@app/components/auth/profile/Profile";

export const metadata: Metadata = {
  title: "Admin | Profile",
  description: "Profile",
};

const ProfilePage: React.FC = () => {
  return (
    <Profile />
  );
};

export default ProfilePage;
