import type { Metadata } from "next";

import BottomNavbar from "@components/bottom/Navbar";
import FeatureMenu from "@components/feature/Menu";

export const metadata: Metadata = {
  title: "Chats",
  description: "Chats",
};

const HomePage: React.FC = () => {
  return (
    <div className="relative w-[90%] md:w-[40%] min-h-screen bg-gray-100">
      <FeatureMenu />
      <BottomNavbar />
    </div>
  );
};

export default HomePage;
