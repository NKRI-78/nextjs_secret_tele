import type { Metadata } from "next";
import Chat from "./components/chat/Chat";
import ResponsiveTwoPane from "./components/chat/ChatTwopPane";
import MessageList from "./components/chat/MessaggeList";

export const metadata: Metadata = {
  title: "Bot",
  description: "Bot",
};

export default function HomePage() {
  return (
    <ResponsiveTwoPane
      title="Bot"
      leftLabel="Chats"
      className="bg-gray-100"
      leftWidthMd="md:w-[340px] lg:w-[380px]"
    >
      {{
        left: (
          <div
            className="w-full border-b md:border-b-0 md:border-r bg-white
                       min-h-[280px] md:min-h-0 md:h-[100dvh] overflow-y-auto"
            aria-label="Chat list"
          >
            <Chat />
          </div>
        ),
        right: (
          <main className="flex-1 min-h-0 md:h-[100dvh] overflow-hidden">
            <MessageList />
          </main>
        ),
      }}
    </ResponsiveTwoPane>
  );
}
