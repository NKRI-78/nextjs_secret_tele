"use client";

import { classNames, initials } from "@/app/lib/utils";
import { useMemo, useState } from "react";

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  type?: string;
};

export default function Chat({
  items,
  selectedId,
  onSelect,
}: {
  items: ChatItem[];
  selectedId: string;
  onSelect: (item: ChatItem) => void;
}) {
  const [query, setQuery] = useState("");

  const { location, profiling, result } = useMemo(() => {
    const list = items.filter((c) =>
      (c.name + " " + c.lastMessage).toLowerCase().includes(query.toLowerCase())
    );
    return {
      result: list.filter((c) => c.type == "result"),
      location: list.filter((c) => c.type == "location"),
      profiling: list.filter((c) => c.type == "profiling"),
    };
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2 p-3">
          <div className="text-lg font-semibold">Chats</div>
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
        {result.length > 0 && (
          <Section title="Hasil Pencarian">
            {result.map((c) => (
              <ChatRow
                key={c.id}
                item={c}
                selected={selectedId === c.id}
                onClick={() => onSelect(c)}
              />
            ))}
          </Section>
        )}
        <Section title="Lokasi">
          {location.map((c) => (
            <ChatRow
              key={c.id}
              item={c}
              selected={selectedId === c.id}
              onClick={() => onSelect(c)}
            />
          ))}
        </Section>
        <Section title="Profiling">
          {profiling.map((c) => (
            <ChatRow
              key={c.id}
              item={c}
              selected={selectedId === c.id}
              onClick={() => onSelect(c)}
            />
          ))}
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
      <Avatar name={item.name} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{item.name}</span>
          <span className="ml-auto text-xs text-gray-500">{item.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-gray-600">
            {item.lastMessage}
          </span>
        </div>
      </div>
    </button>
  );
}

function Avatar({ name }: { name: string }) {
  const ini = initials(name);
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
        {ini || "?"}
      </div>
    </div>
  );
}
