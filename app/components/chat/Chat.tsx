"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import type { AppDispatch, RootState } from "@redux/store";
import { UploadFile } from "@/app/lib/mediaService";
import type {
  ChatButton,
  ChatMessage,
} from "@/app/interfaces/botsecret/answer";
import {
  chatMessageListAsync,
  sendMsgAsync,
  sendMsgButtonAsync,
} from "@/redux/slices/chatSlice";

const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL_SOCKET as string);

function InlineKeyboard({
  buttons,
  onClick,
  disabled,
}: {
  buttons: ChatButton[];
  onClick: (b: ChatButton) => void;
  disabled?: boolean;
}) {
  if (!buttons?.length) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {buttons.map((b) => (
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
            bg-white/70 backdrop-blur border-gray-200 shadow-sm flex items-center gap-2`}
        >
          <span>{b.text}</span>
        </button>
      ))}
    </div>
  );
}

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message, loading, error } = useSelector(
    (state: RootState) => state.chat
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  const username = "saya";

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      } catch (e) {
        console.error("Invalid JSON in bot_msg:", e);
      }
    };

    socket.on("bot_msg", handler);
    return () => {
      socket.off("bot_msg", handler);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length !== prevLengthRef.current) {
      scrollToBottom();
      prevLengthRef.current = messages.length;
    }
  }, [messages]);

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

  const [pendingBtn, setPendingBtn] = useState<string | null>(null);

  const handleInlineClick = useCallback(
    async (btn: ChatButton, _: ChatMessage) => {
      if (pendingBtn) return;
      setPendingBtn(btn.data);

      const formData = new FormData();
      formData.append("chat", "@OSngrok_bot");
      formData.append("button_data", btn.data);

      try {
        await dispatch(sendMsgButtonAsync({ formData })).unwrap();

        setTimeout(async () => {
          try {
            await dispatch(chatMessageListAsync()).unwrap();
            scrollToBottom();
          } catch (err) {
            console.error("Failed to refetch:", err);
          }
        }, 150);
      } catch (e) {
        console.error(e);
      } finally {
        // a small UX delay to show pressed feedback
        setTimeout(() => setPendingBtn(null), 400);
      }
    },
    [dispatch, pendingBtn]
  );

  const handleSubmit = async () => {
    if (loading) return; // block double-click while thunk in flight
    if (!input.trim() && !uploadedFile) return;

    try {
      let mediaPath: string | undefined;
      let contentType = "text";

      if (uploadedFile) {
        const response = await UploadFile(uploadedFile);
        mediaPath = response.data.path;
        contentType = "media";
      }

      const formData = new FormData();
      formData.append("chat", "@OSngrok_bot");
      formData.append("message", input.trim());
      if (mediaPath) {
        formData.append("media", mediaPath);
        formData.append("contentType", contentType);
      }

      await dispatch(sendMsgAsync({ formData })).unwrap();

      setTimeout(async () => {
        try {
          await dispatch(chatMessageListAsync()).unwrap();
          scrollToBottom();
        } catch (err) {
          console.error("Failed to refetch:", err);
        }
      }, 150);

      setInput("");
      setUploadedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-md h-[500px] flex flex-col">
      {error && <div className="text-center text-red-500">{error}</div>}

      <div className="flex-1 overflow-y-auto space-y-3 mb-6 px-2">
        {[...messages]
          .filter(
            (msg) =>
              (msg.text && msg.text.trim() !== "") ||
              msg.mime_type === "image/jpeg" ||
              (msg.buttons && msg.buttons.length > 0)
          )
          .sort((a, b) => a.id - b.id)
          .map((msg) => {
            const isMe = msg.username === username;
            const showButtons = !isMe && msg.buttons && msg.buttons.length > 0;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative p-3 rounded-xl max-w-[75%] text-sm font-sans leading-snug shadow-md ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {msg.text && (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}

                  {msg.mime_type === "image/jpeg" && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/download-file?chat_id=${msg.chat_id}&message_id=${msg.id}`}
                      alt="Preview"
                      className="max-w-full max-h-full rounded-lg shadow-lg mt-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {showButtons && (
                    <InlineKeyboard
                      buttons={msg.buttons}
                      disabled={!!pendingBtn || loading} // also lock while sending main message
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
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-wrap items-center gap-4 border p-2 rounded-md bg-gray-50">
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
              disabled={loading}
            >
              Remove
            </button>
          </div>
        )}

        <label
          className={`cursor-pointer px-3 py-2 rounded-md ${
            loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          📎
          <input
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, .gif"
            disabled={loading}
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
          onKeyDown={(e) => !loading && e.key === "Enter" && handleSubmit()}
          disabled={loading}
          className="flex-1 border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={loading ? "Sending..." : "Type a message"}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } flex items-center gap-2`}
        >
          {loading ? (
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

export default Chat;
