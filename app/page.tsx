import type { Metadata } from "next";

import BottomNavbar from "@components/bottom/Navbar";
import Chat from "./components/chat/Chat";

export const metadata: Metadata = {
  title: "Bot",
  description: "Bot",
};

const HomePage: React.FC = () => {
  return (
    <div className="relative w-[90%] md:w-[40%] min-h-screen bg-gray-100">
      <Chat />
      <BottomNavbar />
    </div>
  );
};

export default HomePage;
