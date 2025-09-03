import type { Metadata } from "next";
import ChatWrapper from "./components/chat/ChatWrapper";

export const metadata: Metadata = {
  title: "Bot",
  description: "Bot",
};

export default function HomePage() {
  return <ChatWrapper />;
}
