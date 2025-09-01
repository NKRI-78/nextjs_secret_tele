"use client";

import { useMemo, useState } from "react";

/* ---------- dummy data ---------- */
type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string; // e.g., "09:12"
  unread?: number;
  online?: boolean;
  pinned?: boolean;
};

const DUMMY_CHATS: ChatItem[] = [
  {
    id: "1",
    name: "Agam (You)",
    lastMessage: "Otw deploy fix cookies…",
    time: "21:45",
    online: true,
    pinned: true,
  },
  {
    id: "2",
    name: "Rakhsa Team",
    lastMessage: "Socket connected ✅",
    time: "20:18",
    unread: 3,
    pinned: true,
  },
  {
    id: "3",
    name: "Artiq Studio",
    lastMessage: "Landing page draft done.",
    time: "18:02",
  },
  {
    id: "4",
    name: "CaptBridge",
    lastMessage: "COF tables updated.",
    time: "16:41",
    unread: 1,
  },
  {
    id: "5",
    name: "HP3KI Admin",
    lastMessage: "Share latest APK pls.",
    time: "15:03",
    online: true,
  },
  {
    id: "6",
    name: "PT TJL HR",
    lastMessage: "CV list sudah dikirim.",
    time: "14:27",
  },
  {
    id: "7",
    name: "Node/Nest Squad",
    lastMessage: "TypeORM config merged.",
    time: "13:10",
  },
  {
    id: "8",
    name: "Flutter Devs",
    lastMessage: "PhotoViewGallery ok.",
    time: "12:56",
    unread: 2,
  },
  {
    id: "9",
    name: "Go Backend",
    lastMessage: "GORM migration passed.",
    time: "11:22",
  },
  {
    id: "10",
    name: "Web3 Lab",
    lastMessage: "HTK faucet cooldown 24h.",
    time: "10:15",
  },
  {
    id: "11",
    name: "Design Squad",
    lastMessage: "Tailwind grids updated.",
    time: "09:44",
  },
  {
    id: "12",
    name: "Family Group",
    lastMessage: "Dinner jam 7 ya.",
    time: "08:12",
    unread: 5,
    online: true,
  },
];

/* ---------- helpers ---------- */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* ---------- components ---------- */
export default function Chat() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("1");

  const { pinned, others } = useMemo(() => {
    const list = DUMMY_CHATS.filter((c) =>
      (c.name + " " + c.lastMessage).toLowerCase().includes(query.toLowerCase())
    );
    return {
      pinned: list.filter((c) => c.pinned),
      others: list.filter((c) => !c.pinned),
    };
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2 p-3">
          <div className="text-lg font-semibold">Chats</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
              title="New chat"
              type="button"
            >
              + New
            </button>
          </div>
        </div>
        <div className="p-3 pt-0">
          <label className="block">
            <span className="sr-only">Search</span>
            <div className="flex items-center rounded-xl border bg-white px-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mr-2 opacity-60"
              >
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats…"
                className="h-10 w-full bg-transparent outline-none"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto">
        {pinned.length > 0 && (
          <Section title="Pinned">
            {pinned.map((c) => (
              <ChatRow
                key={c.id}
                item={c}
                selected={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
          </Section>
        )}
        <Section title="All chats">
          {others.map((c) => (
            <ChatRow
              key={c.id}
              item={c}
              selected={selectedId === c.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
          {others.length === 0 && pinned.length === 0 && (
            <div className="px-3 pb-6 text-sm text-gray-500">
              No chats found.
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-2">
      <div className="px-3 pb-2 pt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ChatRow({
  item,
  selected,
  onClick,
}: {
  item: ChatItem;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "group flex w-full items-center gap-3 px-3 py-2 transition",
        "hover:bg-gray-50",
        selected && "bg-gray-100"
      )}
    >
      <Avatar name={item.name} online={item.online} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.name}</span>
          {item.pinned && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              PINNED
            </span>
          )}
          <span className="ml-auto text-xs text-gray-500">{item.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-gray-600">
            {item.lastMessage}
          </span>
          {typeof item.unread === "number" && item.unread > 0 && (
            <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
              {item.unread > 99 ? "99+" : item.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function Avatar({ name, online }: { name: string; online?: boolean }) {
  const ini = initials(name);
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
        {ini || "?"}
      </div>
      {online && (
        <span
          title="Online"
          className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
        />
      )}
    </div>
  );
}
