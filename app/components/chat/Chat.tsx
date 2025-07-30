"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatListAsync, sendMsgAsync } from "@/redux/slices/chatSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Message } from "@/app/interfaces/chat/chat";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL_SOCKET);

const Chat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: chatData,
    loading,
    error,
  } = useSelector((state: RootState) => state.chat);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = 655325290;
  const userId = 1496400227;
  const username = "saya";

  const cleanText = (text: string): string => {
    return text
      .replace(/```/g, "") // remove backticks (```)
      .replace(/\*\*/g, "") // remove bold (**)
      .replace(/^-+/gm, "") // remove markdown-style separators
      .replace(/=+@=|=@=-?/g, "") // remove specific custom markers
      .trim(); // remove leading/trailing spaces
  };

  // Load initial messages from Redux
  useEffect(() => {
    dispatch(chatListAsync());
  }, [dispatch]);

  // Update local messages when Redux data changes
  useEffect(() => {
    if (chatData?.messages) {
      const incomingMessages: Message[] = chatData.messages.map((msg) => ({
        id: msg.id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        text: msg.text,
        username: msg.username,
        date: msg.date,
        file_name: msg.file_name,
        file_size: msg.file_size,
        mime_type: msg.mime_type,
      }));
      setMessages(incomingMessages);
    }
  }, [chatData]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);

    // Preview for image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null); // no preview for non-image files
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket.IO connection
  useEffect(() => {
    // Join the lobby room
    socket.emit("room:lobby:join", chatId);

    // Listen for 'bot_msg' from the server
    socket.on("bot_msg", (msg: any) => {
      try {
        const parsed: Message = JSON.parse(msg);

        const dataMsg: Message = {
          id: parsed.id,
          chat_id: parsed.chat_id,
          sender_id: parsed.sender_id,
          text: parsed.text,
          username: parsed.username,
          date: parsed.date,
          file_name: parsed.file_name || "",
          file_size: parsed.file_size || 0,
          mime_type: parsed.mime_type || "",
        };

        setMessages((prev) => [...prev, dataMsg]);
      } catch (error) {
        console.error("Invalid JSON in bot_msg:", error);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("bot_msg");
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random(),
      text: input.trim(),
      sender_id: userId,
      username,
      chat_id: chatId,
      date: new Date().toISOString(),
      file_name: "",
      file_size: 0,
      mime_type: "",
    };

    setMessages((prev) => [...prev, userMessage]);

    const formData = new FormData();
    if (uploadedFile) {
      formData.append("file", uploadedFile);
    }
    formData.append("chat", "@squad_ibot");
    formData.append("message", input.trim());

    dispatch(sendMsgAsync({ formData }));

    socket.emit("message:send", userMessage);

    setInput("");
    setUploadedFile(null);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-md h-[500px] flex flex-col">
      {loading && (
        <div className="flex items-center justify-center h-screen">
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}

      {error && <div className=" text-center text-red-500">{error}</div>}

      <div className="flex-1 overflow-y-auto space-y-3 mb-6 px-2">
        {[...messages]
          .filter(
            (msg) =>
              (msg.text && msg.text.trim() !== "") ||
              msg.mime_type === "image/jpeg"
          )
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.username === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative p-3 rounded-xl max-w-[75%] text-sm font-sans leading-snug shadow-md ${
                  msg.username === username
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

                <div
                  className={`text-[10px] ${
                    msg.username === username ? "text-white" : "text-gray-400"
                  } mt-1 text-right select-none`}
                >
                  {new Date(msg.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-wrap items-center gap-4 border p-2 rounded-md bg-gray-50">
        {/* Preview section */}
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
            >
              Remove
            </button>
          </div>
        )}

        {/* File upload */}
        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-md">
          📎
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files![0];
              if (file) {
                handleFileUpload(file); // Define this function in your component
              }
            }}
          />
        </label>

        {/* Text input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Type a message..."
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
