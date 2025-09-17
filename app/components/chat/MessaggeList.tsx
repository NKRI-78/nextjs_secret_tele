"use client";

import type { ChatMessage } from "@/app/interfaces/botsecret/answer";
import { sendMsgAsync } from "@/redux/slices/chatSlice";
import type { AppDispatch, RootState } from "@redux/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Settings from "../settings/Settings";
import { ChatItem } from "./ChatWrapper";

function TopAvatar({ name, icon }: { name: string; icon: string }) {
  const ini =
    name
      .split(" ")
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";
  return <img src={icon} width={20} height={20} alt={name} />;
}

/* ---------- small helpers ---------- */
const keyMsgs = (chatKey: string) => `chat:messages:v2:${chatKey}`;
const keyDraft = (chatKey: string) => `chat:draft:v1:${chatKey}`;

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const MessageList = ({
  selected,
  onSubmitSuccess,
}: {
  selected: ChatItem | null;
  onSubmitSuccess?: () => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navbar = useSelector((state: RootState) => state.feature.navbar);
  const { error } = useSelector((state: RootState) => state.chat);

  const listRef = useRef<HTMLDivElement>(null);
  const username = "saya";

  // Derive a stable key per-chat
  const chatKey = useMemo(
    () => (selected?.id ? String(selected.id) : "no-chat"),
    [selected?.id]
  );

  // Local state (single source of truth)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [sendingMessage, setSendingMessage] = useState(false);

  /* ---------- load from LOCAL (per chat) ---------- */
  useEffect(() => {
    const storedMsgs = safeParse<ChatMessage[]>(
      typeof window !== "undefined"
        ? localStorage.getItem(keyMsgs(chatKey))
        : null,
      []
    );
    setMessages(Array.isArray(storedMsgs) ? storedMsgs : []);

    const storedDraft = safeParse<string>(
      typeof window !== "undefined"
        ? localStorage.getItem(keyDraft(chatKey))
        : null,
      ""
    );
    setInput(storedDraft || "");

    setUploadedFile(null);
    setPreviewUrl(null);
  }, [chatKey]);

  const persistNow = useCallback(
    (next: ChatMessage[]) => {
      try {
        localStorage.setItem(
          keyMsgs(chatKey),
          JSON.stringify(next.slice(-500))
        );
      } catch (e) {
        console.warn("Failed to persist local messages:", e);
      }
    },
    [chatKey]
  );

  const scrollSmart = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 4;
    if (hasOverflow) el.scrollTop = el.scrollHeight;
  }, []);
  useEffect(() => {
    scrollSmart();
  }, [messages, scrollSmart]);

  /* ---------- API payload -> local append (+persist inline) ---------- */
  const appendFromApiPayload = (payload: any) => {
    if (!payload) return;
    const asArray = Array.isArray(payload) ? payload : [payload];
    const normalized: ChatMessage[] = asArray
      .map((p) => ({
        id: p?.id ?? `local-${Date.now()}-${Math.random()}`,
        buttons: p?.buttons ?? [],
        chat_id: p?.chat_id ?? selected?.id ?? null,
        date: p?.date ?? new Date().toISOString(),
        file_name: p?.file_name ?? null,
        file_size: p?.file_size ?? null,
        mime_type: p?.mime_type ?? null,
        sender_id: p?.sender_id ?? null,
        text: typeof p?.text === "string" ? p.text : "",
        username: p?.username ?? "bot",
      }))
      .filter(Boolean);

    if (normalized.length) {
      setMessages((prev) => {
        const next = [...prev, ...normalized];
        // persistNow(next); // <-- persist immediately
        return next;
      });
    }
  };

  /* ---------- submit: optimistic + persist inline ---------- */
  const handleSubmit = async () => {
    if (sendingMessage) return;
    if (!selected) return;
    if (!input.trim() && !uploadedFile) return;

    const nowIso = new Date().toISOString();
    const localId = `local-${Date.now()}`;

    const myMsg: ChatMessage = {
      id: localId as unknown as number, // runtime is a string; cast is just for TS
      buttons: [],
      chat_id: (selected.id as unknown as number) ?? null,
      date: nowIso,
      file_name: uploadedFile?.name || null,
      file_size: uploadedFile ? String(uploadedFile.size) : null,
      mime_type: uploadedFile?.type || null,
      sender_id: 0,
      text: uploadedFile
        ? ""
        : `${selected?.command ?? ""} ${input.trim()}`.trim(),
      username,
    };

    // Append + persist synchronously
    setMessages((prev) => {
      const next = [...prev, myMsg];
      // persistNow(next); // <-- persist immediately when you add
      return next;
    });

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("chat", "@Wolf_botbot");
      if (uploadedFile) {
        formData.append("file", uploadedFile);
        formData.append("message", "");
      } else {
        formData.append(
          "message",
          `${selected?.command ?? ""} ${input.trim()}`.trim()
        );
      }

      const payload = await dispatch(sendMsgAsync({ formData })).unwrap();

      // Append any API response and persist
      appendFromApiPayload(payload);

      // Clear draft only after success
      setInput("");
      // localStorage.removeItem(keyDraft(chatKey));

      setUploadedFile(null);
      setPreviewUrl(null);

      onSubmitSuccess?.();
    } catch (err) {
      console.error("Send failed:", err);
      // mark the optimistic bubble as failed and persist that too
      setMessages((prev) => {
        const next = prev.map((m) =>
          String(m.id) === String(localId)
            ? {
                ...m,
                text: ((m.text || "") + "\n\n(❗ gagal terkirim)").trim(),
              }
            : m
        );
        // persistNow(next); // <-- persist failure state
        return next;
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (navbar === "settings") return <Settings />;

  return (
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* TOP NAVBAR */}
      <div className="sticky top-0 z-20 border-bottom-cyber bg-white/80 backdrop-blur">
        {selected ? (
          <div className="flex items-center gap-4 p-4 bg-cyber">
            <TopAvatar name={selected.name} icon={selected.icon} />
            <div className="min-w-0">
              <div className="font-medium text-white truncate">
                {selected.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 text-sm text-gray-500">Select a chat</div>
        )}
      </div>

      {/* MESSAGE LIST */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-5 bg-cyber">
        <div className="min-h-full flex flex-col justify-center px-1 space-y-3 pb-4 bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat">
          {[...messages]
            .filter(
              (msg) =>
                (msg.text && msg.text.trim() !== "") ||
                msg.mime_type === "image/jpeg" ||
                (msg.buttons && msg.buttons.length > 0)
            )
            .sort((a, b) => {
              const aNum =
                typeof a.id === "number"
                  ? a.id
                  : Number(String(a.id).replace("local-", ""));
              const bNum =
                typeof b.id === "number"
                  ? b.id
                  : Number(String(b.id).replace("local-", ""));
              return aNum - bNum;
            })
            .map((msg) => {
              const isMe = msg.username === username;

              return (
                <div
                  key={String(msg.id)}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative p-3 rounded-xl max-w-[75%] text-sm leading-snug shadow-md
                      ${
                        isMe
                          ? "bg-chatbot text-white rounded-br-none"
                          : "bg-chatbot text-gray-900 rounded-bl-none"
                      }
                    `}
                    style={{ wordBreak: "break-word" }}
                  >
                    {msg.text && (
                      <div className="whitespace-pre-wrap">{msg.text} </div>
                    )}

                    {msg.mime_type === "image/jpeg" && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_BASE_URL}/download-file?chat_id=${msg.chat_id}&message_id=${msg.id}`}
                        alt="Preview"
                        className="max-w-full rounded-lg shadow-lg mt-2"
                        onLoad={scrollSmart}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    <div
                      className={`text-[10px] ${
                        isMe ? "text-white" : "text-gray-400"
                      } mt-1 text-right select-none`}
                    >
                      {new Date(msg.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* subtle bubble tail accent */}
                    <div
                      className={`absolute -z-10 bottom-0 h-4 w-4 ${
                        isMe ? "right-2 bg-blue-600" : "left-2 bg-gray-100"
                      } rounded-full blur-[6px] opacity-30`}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* COMPOSER */}
      <div className="flex flex-wrap items-center bg-cyber p-5">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            const v = e.target.value;
            setInput(v);
            try {
              localStorage.setItem(keyDraft(chatKey), v); // <-- save draft immediately
            } catch (err) {
              console.warn("Failed to persist draft:", err);
            }
          }}
          onKeyDown={(e) =>
            !sendingMessage && e.key === "Enter" && handleSubmit()
          }
          disabled={sendingMessage || !selected}
          className="flex-1 border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={
            !selected
              ? "Select a chat"
              : sendingMessage
              ? "Sending..."
              : `${selected.placeholder}`
          }
        />

        <button
          onClick={handleSubmit}
          disabled={sendingMessage || !selected}
          className={`px-4 py-2 ml-4 bg-submit-chatbot rounded text-white transition ${
            sendingMessage || !selected
          } flex items-center gap-2`}
        >
          {sendingMessage ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Sending...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageList;
