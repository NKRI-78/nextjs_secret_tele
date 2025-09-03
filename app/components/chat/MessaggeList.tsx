"use client";

import type {
  ChatButton,
  ChatMessage,
} from "@/app/interfaces/botsecret/answer";
import {
  chatMessageListAsync,
  sendMsgAsync,
  sendMsgButtonAsync,
} from "@/redux/slices/chatSlice";
import type { AppDispatch, RootState } from "@redux/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import Settings from "../settings/Settings";
import { ChatItem } from "./ChatWrapper";

const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL_SOCKET as string);

// simple avatar here (decoupled from Chat.tsx)
function TopAvatar({ name }: { name: string }) {
  const ini =
    name
      .split(" ")
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
      {ini}
    </div>
  );
}

/* ---------- INLINE KEYBOARD: per-button loading ---------- */
function InlineKeyboard({
  buttons,
  onClick,
  disabledAll,
  loadingId,
}: {
  buttons: ChatButton[];
  onClick: (b: ChatButton) => void;
  disabledAll?: boolean;
  loadingId?: string | null;
}) {
  if (!buttons?.length) return null;
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {buttons.map((b) => {
        const isLoading = loadingId === b.data;
        const disabled = disabledAll || isLoading;
        return (
          <button
            key={b.data}
            type="button"
            onClick={() => onClick(b)}
            disabled={disabled}
            title={b.data}
            className={`w-full rounded-xl border px-3 py-2 text-sm transition
              ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-gray-100 active:scale-[0.99]"
              }
              bg-white/70 backdrop-blur border-gray-200 shadow-sm flex items-center gap-2 justify-center`}
          >
            {isLoading && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
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
            )}
            <span className="truncate">{b.text}</span>
          </button>
        );
      })}
    </div>
  );
}

const MessageList = ({ selected }: { selected: ChatItem | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { message, error } = useSelector((state: RootState) => state.chat);
  const navbar = useSelector((state: RootState) => state.feature.navbar);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // scroll container for messages
  const listRef = useRef<HTMLDivElement>(null);
  const username = "saya";

  // local loadings
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pendingByMsg, setPendingByMsg] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    dispatch(chatMessageListAsync());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      const incoming: ChatMessage[] = message.map((msg) => ({
        id: msg.id,
        buttons: msg.buttons,
        chat_id: msg.chat_id,
        date: msg.date,
        file_name: msg.file_name,
        file_size: msg.file_size,
        mime_type: msg.mime_type,
        sender_id: msg.sender_id,
        text: msg.text,
        username: msg.username,
      }));
      setMessages(incoming);
    }
  }, [message]);

  useEffect(() => {
    socket.emit("room:lobby:join", "Hello");

    const handler = (msg: any) => {
      try {
        const parsed: ChatMessage = JSON.parse(msg);
        const dataMsg: ChatMessage = {
          id: parsed.id,
          buttons: parsed.buttons,
          chat_id: parsed.chat_id,
          date: parsed.date,
          file_name: parsed.file_name,
          file_size: parsed.file_size,
          mime_type: parsed.mime_type,
          sender_id: parsed.sender_id,
          text: parsed.text,
          username: parsed.username,
        };
        setMessages((prev) => [...prev, dataMsg]);
        setPendingByMsg({}); // clear inline button loadings after bot reply
      } catch (e) {
        console.error("Invalid JSON in bot_msg:", e);
      }
    };

    socket.on("bot_msg", handler);
    return () => {
      socket.off("bot_msg", handler);
    };
  }, []);

  const scrollSmart = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 4;
    if (hasOverflow) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollSmart();
  }, [messages, scrollSmart]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleInlineClick = useCallback(
    async (btn: ChatButton, msg: ChatMessage) => {
      const key = String(msg.id);
      if (pendingByMsg[key]) return; // prevent double-tap on THAT message

      setPendingByMsg((prev) => ({ ...prev, [key]: btn.data }));

      const formData = new FormData();
      formData.append("chat", "@OSngrok_bot");
      formData.append("button_data", btn.data);

      try {
        await dispatch(sendMsgButtonAsync({ formData })).unwrap();
        await dispatch(chatMessageListAsync()).unwrap();
        // loading cleared on socket reply
      } catch (e) {
        console.error(e);
        setPendingByMsg((prev) => ({ ...prev, [key]: null }));
      }
    },
    [dispatch, pendingByMsg]
  );

  const handleSubmit = async () => {
    if (sendingMessage) return;
    if (!input.trim() && !uploadedFile) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("chat", "@OSngrok_bot");
      formData.append("message", input.trim());
      if (uploadedFile) {
        formData.append("file", uploadedFile);
        formData.append("message", "");
      }

      await dispatch(sendMsgAsync({ formData })).unwrap();
      await dispatch(chatMessageListAsync()).unwrap();

      setInput("");
      setUploadedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (navbar === "settings") return <Settings />;

  return (
    /* Full width & height container, no fixed width/height, no centering box */
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* TOP NAVBAR with selected chat info */}
      <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        {selected ? (
          <div className="flex items-center gap-4 p-4">
            <TopAvatar name={selected.name} />
            <div className="min-w-0">
              <div className="font-medium truncate">{selected.name}</div>
            </div>
          </div>
        ) : (
          <div className="p-3 text-sm text-gray-500">Select a chat</div>
        )}
      </div>

      {/* MESSAGE LIST: flex-1 scroll area */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center px-1 space-y-3 pb-4">
          {[...messages]
            .filter(
              (msg) =>
                (msg.text && msg.text.trim() !== "") ||
                msg.mime_type === "image/jpeg" ||
                (msg.buttons && msg.buttons.length > 0)
            )
            .sort((a, b) => (a.id as number) - (b.id as number))
            .map((msg) => {
              const isMe = msg.username === username;
              const showButtons =
                !isMe && msg.buttons && msg.buttons.length > 0;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative p-3 rounded-xl max-w-[75%] text-sm leading-snug shadow-md
                      ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {msg.text && (
                      <div className="whitespace-pre-wrap">
                        {msg.text.includes("Mengirim permintaan…")
                          ? "Sedang diproses.."
                          : msg.text}
                      </div>
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

                    {showButtons && (
                      <InlineKeyboard
                        buttons={msg.buttons}
                        disabledAll={false}
                        loadingId={pendingByMsg[String(msg.id)] ?? null}
                        onClick={(b) => handleInlineClick(b, msg)}
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

      {/* COMPOSER: fixed at bottom inside this component, not sticky to viewport */}
      <div className="mt-3 flex flex-wrap items-center gap-4 border p-2 rounded-md bg-gray-50">
        {uploadedFile && (
          <div className="flex items-center space-x-4 border p-2 rounded-md bg-gray-50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="text-gray-700">📎 {uploadedFile.name}</div>
            )}
            <button
              onClick={() => {
                setUploadedFile(null);
                setPreviewUrl(null);
              }}
              className="text-red-500 hover:underline text-sm"
              disabled={sendingMessage}
            >
              Remove
            </button>
          </div>
        )}

        <label
          className={`cursor-pointer px-3 py-2 rounded-md ${
            sendingMessage
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          📎
          <input
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, .gif"
            disabled={sendingMessage}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </label>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            !sendingMessage && e.key === "Enter" && handleSubmit()
          }
          disabled={sendingMessage}
          className="flex-1 border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={sendingMessage ? "Sending..." : "Type /start to begin"}
        />

        <button
          onClick={handleSubmit}
          disabled={sendingMessage}
          className={`px-4 py-2 rounded text-white transition ${
            sendingMessage
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
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
