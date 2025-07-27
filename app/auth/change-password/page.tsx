import React from "react";

import type { Metadata } from "next";
import ChangePassword from "@components/auth/change-password/ChangePassword";

export const metadata: Metadata = {
  title: "Admin | Change Password",
  description: "Change Password",
};

const ChangePasswordPage: React.FC = () => {
  return (
    <ChangePassword />
  );
};

export default ChangePasswordPage;
