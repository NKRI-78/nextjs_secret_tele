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
  placeholder: string;
};

const INITIAL_CHATS: ChatItem[] = [
  {
    id: "1",
    name: "Hasil Pencarian",
    lastMessage: "",
    time: "00:00",
    command: "/result",
    type: "result",
    placeholder: "result",
  },
  {
    id: "2",
    name: "CEK KK",
    lastMessage: "",
    time: "00:00",
    command: "/kk",
    type: "cekkk",
    placeholder: "No KK",
  },
  {
    id: "3",
    name: "NIK",
    lastMessage: "",
    time: "00:00",
    command: "/nik",
    type: "nik",
    placeholder: "No NIK",
  },
  {
    id: "4",
    name: "Profiling",
    lastMessage: "",
    time: "00:00",
    command: "/profiling",
    type: "profiling",
    placeholder: "No HP",
  },
  {
    id: "5",
    name: "Perusahaan",
    lastMessage: "",
    time: "00:00",
    command: "-",
    type: "perusahaan",
    placeholder: "perusahaan",
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
