import React from "react";

import type { Metadata } from "next";
import ChatAdmin from "@components/chat/ChatAdmin";

export const metadata: Metadata = {
  title: "Bot | Secret",
  description: "Secret",
};

const AdminSecretPage: React.FC = () => {
  return <ChatAdmin />;
};

export default AdminSecretPage;
