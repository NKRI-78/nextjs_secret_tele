"use client";

import Cookies from "js-cookie";

import { classNames, initials } from "@/app/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const first =
        menuRef.current?.querySelector<HTMLElement>("[role='menuitem']");
      first?.focus();
    }
  }, [open]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user_id");

    router.push("/auth/login");

    setOpen(false);
  };

  const { perusahaan, nik, cekKK, profiling, result } = useMemo(() => {
    const list = items.filter((c) =>
      (c.name + " " + c.lastMessage).toLowerCase().includes(query.toLowerCase())
    );
    return {
      result: list.filter((c) => c.type == "result"),
      nik: list.filter((c) => c.type == "nik"),
      profiling: list.filter((c) => c.type == "profiling"),
      cekKK: list.filter((c) => c.type == "cekkk"),
      perusahaan: list.filter((c) => c.type == "perusahaan"),
    };
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2 p-3">
          <div className="text-lg font-semibold">Chats</div>
          <div className="ml-auto flex items-center gap-2">
            {/* User menu */}
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Account"
              >
                <span className="sr-only">Open user menu</span>
                {/* avatar/icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path
                    fill="currentColor"
                    d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                  />
                </svg>

                {open && (
                  <div
                    ref={menuRef}
                    role="menu"
                    aria-label="User menu"
                    className="absolute right-2 z-50 mt-14 w-44 overflow-hidden rounded-lg border bg-white shadow-lg"
                  >
                    <button
                      role="menuitem"
                      tabIndex={0}
                      className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus:bg-red-50"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </button>
            </div>
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
        <Section title="CEK KK">
          {cekKK.map((c) => (
            <ChatRow
              key={c.id}
              item={c}
              selected={selectedId === c.id}
              onClick={() => onSelect(c)}
            />
          ))}
        </Section>
        <Section title="NIK">
          {nik.map((c) => (
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
        <Section title="Perusahaan">
          {perusahaan.map((c) => (
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
