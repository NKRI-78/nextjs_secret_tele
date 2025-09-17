"use client";

import { chatMessageListCompanyAsync } from "@/redux/slices/chatSlice";
import type { AppDispatch, RootState } from "@redux/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Settings from "../settings/Settings";
import { ChatItem } from "./ChatWrapper";

const MessageListCompany = ({ selected }: { selected: ChatItem | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, company, loading } = useSelector(
    (state: RootState) => state.chat
  );
  const navbar = useSelector((state: RootState) => state.feature.navbar);

  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState(""); // NEW: freeze the submitted text

  const listRef = useRef<HTMLDivElement>(null);

  const scrollSmart = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 4;
    if (hasOverflow) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollSmart();
  }, [company, scrollSmart]);

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

  const handleSubmit = async () => {
    if (sendingMessage) return;
    const q = input.trim();
    if (!q) return; // file not used for company search

    setSendingMessage(true);
    setHasSearched(true);
    setLastQuery(q); // NEW: remember what was searched

    try {
      const formData = new FormData();
      formData.append("search", q);

      await dispatch(chatMessageListCompanyAsync({ formData })).unwrap();

      setInput(""); // keep this if you like clearing after search
      setUploadedFile(null);
      setPreviewUrl(null);
      scrollSmart();
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (navbar === "settings") return <Settings />;

  const showNoResult =
    !loading && hasSearched && (!company || company.length === 0);
  const noResultLabel = lastQuery || input.trim() || "company"; // NEW: use typed text

  return (
    <div className="w-full h-screen flex flex-col bg-cyber">
      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat p-5">
        <div className="min-h-full flex flex-col justify-center items-center space-y-6">
          {loading && <div className="text-white">Memuat...</div>}

          {company && company.length > 0 ? (
            <div className="rounded-lg border bg-chatbot w-full max-w-3xl">
              <div className="px-4 py-2 text-xs font-semibold text-white border-b">
                Hasil Pencarian Perusahaan
              </div>
              <ul className="p-3 space-y-2 bg-chatbot">
                {company.map((c) => {
                  const lastSegment =
                    c.url?.split("/").filter(Boolean).pop() ?? c.url;

                  return (
                    <li key={c.id}>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-2 rounded hover:bg-cyber"
                      >
                        <div className="font-medium text-white">{c.nama}</div>
                        <div className="text-xs text-gray-300">
                          {c.prefix} — {lastSegment}
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : showNoResult ? (
            <div className="text-center text-white">
              {noResultLabel} tidak ditemukan
            </div>
          ) : (
            !loading && (
              <div className="text-center text-gray-200">
                Ketik nama perusahaan di bawah lalu tekan{" "}
                <span className="font-medium">Search</span>.
              </div>
            )
          )}
        </div>
      </div>

      {/* FIXED COMPOSER */}
      <div className="sticky bottom-0 border-t border-white/10 bg-cyber/80 backdrop-blur-md p-3">
        <div className="mx-auto max-w-3xl w-full flex items-center gap-3 rounded-full p-2 shadow-lg bg-cyber/90">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={sendingMessage}
            className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:ring focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder={sendingMessage ? "Searching..." : "Cari perusahaan…"}
          />
          <button
            onClick={handleSubmit}
            disabled={sendingMessage}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white disabled:opacity-50 hover:scale-105 transition"
          >
            {sendingMessage ? (
              <svg
                className="h-5 w-5 animate-spin"
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
            ) : (
              "➤"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageListCompany;
