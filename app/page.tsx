import type { Metadata } from "next";
import ChatWrapper from "./components/chat/ChatWrapper";
import HomeResult from "./components/v2/home/HomeResult";

export const metadata: Metadata = {
  title: "Bot",
  description: "Bot",
};

export default function HomePage() {
  // return <HomeResult />;
  return <ChatWrapper />; //v1
}
