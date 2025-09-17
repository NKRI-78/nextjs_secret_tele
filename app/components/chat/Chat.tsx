"use client";

import Cookies from "js-cookie";
import { classNames, initials } from "@/app/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ChatItem = {
  id: string;
  name: string;
  icon: string;
  lastMessage: string;
  time: string;
  type?: string;
};

const TYPE_LABELS: Record<string, string> = {
  profiling: "Profiling",
  nik: "NIK",
  cekkk: "Cek KK",
  perusahaan: "Perusahaan",
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

  // state untuk menu user (sudah ada)
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // state untuk dropdown per type
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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

  // inisialisasi status open/close per group dari items
  useEffect(() => {
    const keys = Array.from(
      new Set(items.map((i) => i.type).filter(Boolean))
    ) as string[];
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const k of keys) if (next[k] === undefined) next[k] = true; // default: terbuka
      return next;
    });
  }, [items]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user_id");
    router.push("/auth/login");
    setOpen(false);
  };

  // ====== FILTER & GROUPING ======
  const { singleResult, groups } = useMemo(() => {
    const kw = query.toLowerCase();
    const list = items.filter((c) =>
      (c.name + " " + c.lastMessage).toLowerCase().includes(kw)
    );

    // result: hanya ambil satu (pertama yang ditemukan)
    const singleResult = list.find((c) => c.type === "result") ?? null;

    // kelompokkan selain "result" berdasarkan type
    const groups: Record<string, ChatItem[]> = {};
    for (const c of list) {
      if (c.type === "result") continue;
      const key = c.type ?? "lainnya";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return { singleResult, groups };
  }, [items, query]);

  const toggleGroup = (key: string) =>
    setOpenGroups((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-cyber backdrop-blur">
        <div className="flex items-center gap-4 p-5">
          {/* (opsional) kolom search, sudah ada state nya */}
          {/* <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari…"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Account"
              >
                <span className="sr-only">Open user menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white"
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
      </div>

      {/* ====== LIST ====== */}
      <div className="flex-1 overflow-y-auto p-5">
        {singleResult && (
          <div className="pb-2">
            <div className="space-y-1">
              <button
                key={singleResult.id}
                onClick={() => onSelect(singleResult)}
                className={classNames(
                  "section-title group flex w-full items-center gap-3 px-3 py-2 transition",
                  selectedId === singleResult.id && "bg-cyber-dark"
                )}
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {singleResult.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-gray-600" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* GROUPS (dropdown per type) */}
        {Object.entries(groups).map(([typeKey, list]) => (
          <CollapsibleSection
            key={typeKey}
            title={TYPE_LABELS[typeKey] ?? typeKey}
            open={!!openGroups[typeKey]}
            onToggle={() => toggleGroup(typeKey)}
          >
            {list.map((c) => (
              <ChatRow
                key={c.id}
                item={c}
                selected={selectedId === c.id}
                onClick={() => onSelect(c)}
              />
            ))}
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const sectionId = `sec-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="pb-2 pt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={sectionId}
        onClick={onToggle}
        className={classNames(
          "section-title",
          "flex w-full items-center justify-between px-3 pb-2 pt-3",
          "text-xs font-medium uppercase tracking-wide text-gray-500"
        )}
      >
        <span>{title}</span>
        <svg
          className={classNames(
            "h-4 w-4 transition-transform",
            open ? "rotate-180" : "rotate-0"
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        id={sectionId}
        className={classNames("space-y-1", !open && "hidden", "p-2 ml-8 mt-2")}
      >
        {children}
      </div>
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
        "group flex w-full items-center gap-4 px-3 py-2 border-radius-cyber-dark bg-cyber-dark transition",
        selected && "bg-cyber-dark-outlined"
      )}
    >
      <Avatar name={item.name} icon={item.icon} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-white">{item.name}</span>
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

function Avatar({ name, icon }: { name: string; icon: string }) {
  const ini = initials(name);
  return (
    <div className="relative">
      {icon ? (
        <img src={icon} width={20} height={20} alt={name} />
      ) : (
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[10px] font-semibold text-gray-700">
          {ini}
        </div>
      )}
    </div>
  );
}
