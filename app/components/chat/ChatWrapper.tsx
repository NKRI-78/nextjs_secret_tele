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
  icon: string;
  lastMessage: string;
  time: string;
  command: string;
  type?: "result" | "profiling" | "nik" | "cekkk" | "perusahaan";
  placeholder: string;
};

const INITIAL_CHATS: ChatItem[] = [
  {
    id: "1",
    name: "HASIL PENCARIAN",
    icon: "",
    lastMessage: "",
    time: "00:00",
    command: "/result",
    type: "result",
    placeholder: "result",
  },
  {
    id: "2",
    name: "Kartu Keluarga",
    icon: "/images/kk.png",
    lastMessage: "",
    time: "00:00",
    command: "/kk",
    type: "profiling",
    placeholder: "Kartu Keluarga",
  },
  {
    id: "3",
    name: "N.I.K",
    icon: "/images/nik.png",
    lastMessage: "",
    time: "00:00",
    command: "/nik",
    type: "profiling",
    placeholder: "N.I.K",
  },
  {
    id: "4",
    name: "Registrasi Nomor Telepon",
    icon: "/images/profiling.png",
    lastMessage: "",
    time: "00:00",
    command: "/reg",
    type: "profiling",
    placeholder: "Registrasi Nomor Telepon",
  },
  {
    id: "5",
    name: "Nama Perusahaan",
    icon: "/images/company.png",
    lastMessage: "",
    time: "00:00",
    command: "-",
    type: "perusahaan",
    placeholder: "Nama Perusahaan",
  },
  // {
  //   id: "6",
  //   name: "Face Recognition",
  //   icon: "/images/fr.png",
  //   lastMessage: "",
  //   time: "00:00",
  //   command: "-",
  //   type: "profiling",
  //   placeholder: "Face Recognition",
  // },
];

export default function ChatWrapper() {
  const [items] = useState<ChatItem[]>(INITIAL_CHATS);
  const [selectedId, setSelectedId] = useState<string>(items[0].id);

  const selected = useMemo(
    () => items.find((c) => c.id === selectedId) ?? null,
    [items, selectedId],
  );

  const goToResult = () => {
    const result = items.find((i) => i.type === "result");
    if (result) setSelectedId(result.id);
  };

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
            className="w-full bg-cyber h-[100dvh] overflow-y-auto"
            aria-label="Chat list"
          >
            <Chat
              items={items}
              selectedId={selectedId}
              onSelect={(item) => setSelectedId(item.id)}
            />
          </div>
        ),
        right: (
          <main className="flex-1 min-h-0 md:h-[100dvh] overflow-hidden">
            {selected?.type === "result" ? (
              <MessageListResult selected={selected} />
            ) : selected?.type === "perusahaan" ? (
              <MessageListCompany selected={selected} />
            ) : (
              <MessageList selected={selected} onSubmitSuccess={goToResult} />
            )}
          </main>
        ),
      }}
    </ResponsiveTwoPane>
  );
}
