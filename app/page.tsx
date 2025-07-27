import type { Metadata } from "next";
import Chat from "./components/chat/Chat";

export const metadata: Metadata = {
  title: "Chats",
  description: "Chats",
};

const HomePage: React.FC = () => {
  return <Chat></Chat>;
};

export default HomePage;
