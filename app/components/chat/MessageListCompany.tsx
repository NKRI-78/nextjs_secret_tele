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
    if (!input.trim()) return; // file not used for company search

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("search", input.trim());

      await dispatch(
        chatMessageListCompanyAsync({ formData: formData })
      ).unwrap();

      setInput("");
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

  return (
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* RESULTS LIST */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-5">
        <div className="min-h-full flex flex-col space-y-3">
          {loading && <div className="text-xs text-gray-500">Memuat data…</div>}

          {company && company.length > 0 ? (
            <div className="rounded-lg border bg-gray-50">
              <div className="px-4 py-2 text-xs font-semibold text-gray-600 border-b">
                Hasil Pencarian Perusahaan
              </div>
              <ul className="p-3 space-y-2">
                {company.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-2 rounded hover:bg-white"
                    >
                      <div className="font-medium">{c.nama}</div>
                      <div className="text-xs text-gray-500">
                        {c.prefix} — {c.url}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !loading && (
              <div className="flex-1 grid place-items-center">
                <div className="text-center text-sm text-gray-500">
                  <div className="text-base font-medium text-gray-600">
                    Belum ada hasil
                  </div>
                  <p>
                    Ketik nama perusahaan di bawah lalu tekan{" "}
                    <span className="font-medium">Search</span>.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* COMPOSER */}
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

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            !sendingMessage && e.key === "Enter" && handleSubmit()
          }
          disabled={sendingMessage}
          className="flex-1 border rounded-md px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={sendingMessage ? "Searching..." : "Cari perusahaan…"}
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
              Searching...
            </>
          ) : (
            "Search"
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageListCompany;
