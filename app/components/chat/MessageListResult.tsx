"use client";

import { chatMessageListResultAsync } from "@/redux/slices/chatSlice";
import type { AppDispatch, RootState } from "@redux/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import Settings from "../settings/Settings";
import { ChatItem } from "./ChatWrapper";
import { BotResult, BotResultSocket } from "@/app/interfaces/botsecret/result";

const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL_SOCKET as string);

const MessageListResult = ({ selected }: { selected: ChatItem | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { result, error } = useSelector((state: RootState) => state.chat);
  const navbar = useSelector((state: RootState) => state.feature.navbar);

  const [messages, setMessages] = useState<BotResult[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const username = "saya";

  useEffect(() => {
    dispatch(chatMessageListResultAsync());
  }, [dispatch]);

  useEffect(() => {
    if (result) {
      const incoming: BotResult[] = result.map((msg) => ({
        id: msg.id,
        chat_id: msg.chat_id,
        file_url: msg.file_url,
        message_id: msg.message_id,
        mime_type: msg.mime_type,
        result_from: msg.result_from,
        result_text: msg.result_text,
        username: msg.username,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
      }));
      setMessages(incoming);
    }
  }, [result]);

  useEffect(() => {
    socket.emit("room:lobby:join", "");

    const handler = (msg: any) => {
      try {
        const parsed: BotResultSocket = JSON.parse(msg);
        const dataMsg: BotResult = {
          id: parsed.id,
          chat_id: parsed.chat_id,
          created_at: parsed.date,
          file_url: "",
          message_id: 0,
          mime_type: parsed.mime_type,
          result_from: "",
          result_text: parsed.text,
          updated_at: "",
          username: parsed.username,
        };
        setMessages((prev) => [...prev, dataMsg]);
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

  if (navbar === "settings") return <Settings />;

  return (
    /* Full width & height container, no fixed width/height, no centering box */
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* TOP NAVBAR with selected chat info */}
      <div className="sticky top-0 z-20 border-bottom-cyber bg-cyber backdrop-blur">
        {selected ? (
          <div className="flex items-center gap-4 p-4">
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

      {/* MESSAGE LIST: flex-1 scroll area */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-5 bg-cyber">
        <div className="min-h-full flex flex-col items-center justify-center px-1 space-y-6 bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat">
          {[...messages]
            .filter(
              (msg) =>
                (msg.result_text && msg.result_text.trim() !== "") ||
                msg.mime_type === "image/jpeg"
            )
            .sort((a, b) => (a.id as number) - (b.id as number))
            .map((msg) => {
              const isMe = msg.username === username;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative p-3 rounded-xl max-w-[75%] text-sm leading-snug shadow-md
                      ${
                        isMe
                          ? "bg-chatbot text-white rounded-br-none"
                          : "bg-chatbot text-white rounded-bl-none"
                      }`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {msg.result_text && (
                      <div className="whitespace-pre-wrap">
                        {msg.result_text.includes("Mengirim permintaan…")
                          ? "Sedang diproses.."
                          : msg.result_text}
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

                    <div
                      className={`text-[10px] ${
                        isMe ? "text-white" : "text-gray-400"
                      } mt-1 text-right select-none`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

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
    </div>
  );
};

export default MessageListResult;
