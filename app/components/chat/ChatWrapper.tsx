"use client";

import { useMemo, useState } from "react";
import ResponsiveTwoPane from "./ChatTwopPane";
import Chat from "./Chat";
import MessageList from "./MessaggeList";
import MessageListResult from "./MessageListResult";
import MessageListCompany from "./MessageListCompany";

export type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  command: string;
  type?: string;
};

const INITIAL_CHATS: ChatItem[] = [
  {
    id: "1",
    name: "Hasil Pencarian",
    lastMessage: "",
    time: "00:00",
    command: "/result",
    type: "result",
  },
  {
    id: "2",
    name: "CEK KK",
    lastMessage: "",
    time: "00:00",
    command: "/cek KK",
    type: "cekkk",
  },
  {
    id: "3",
    name: "NIK",
    lastMessage: "",
    time: "00:00",
    command: "/cek NIK",
    type: "nik",
  },
  {
    id: "4",
    name: "Profiling",
    lastMessage: "",
    time: "00:00",
    command: "/profiling",
    type: "profiling",
  },
  {
    id: "5",
    name: "Perusahaan",
    lastMessage: "",
    time: "00:00",
    command: "-",
    type: "perusahaan",
  },
];

export default function ChatWrapper() {
  const [selectedId, setSelectedId] = useState<string>(INITIAL_CHATS[0].id);
  const selected = useMemo(
    () => INITIAL_CHATS.find((c) => c.id === selectedId) ?? null,
    [selectedId]
  );

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
            className="w-full border-b md:border-b-0 md:border-r bg-white min-h-[280px] md:min-h-0 md:h-[100dvh] overflow-y-auto"
            aria-label="Chat list"
          >
            <Chat
              items={INITIAL_CHATS}
              selectedId={selectedId}
              onSelect={(item) => setSelectedId(item.id)}
            />
          </div>
        ),
        right: (
          <main className="flex-1 min-h-0 md:h-[100dvh] overflow-hidden">
            {selectedId == "1" ? (
              <MessageListResult selected={selected} />
            ) : selectedId == "5" ? (
              <MessageListCompany selected={selected} />
            ) : (
              <MessageList selected={selected} />
            )}
          </main>
        ),
      }}
    </ResponsiveTwoPane>
  );
}
