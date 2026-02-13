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
  const isFR = selected?.name === "Face Recognition";

  // Derive a stable key per-chat
  const chatKey = useMemo(
    () => (selected?.id ? String(selected.id) : "no-chat"),
    [selected?.id],
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
      [],
    );
    setMessages(Array.isArray(storedMsgs) ? storedMsgs : []);

    const storedDraft = safeParse<string>(
      typeof window !== "undefined"
        ? localStorage.getItem(keyDraft(chatKey))
        : null,
      "",
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
          JSON.stringify(next.slice(-500)),
        );
      } catch (e) {
        console.warn("Failed to persist local messages:", e);
      }
    },
    [chatKey],
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
      formData.append("chat", "@AnakAsuhanRembolan_iBot");
      if (uploadedFile) {
        formData.append("file", uploadedFile);
        formData.append("message", "/fr");
      } else {
        formData.append(
          "message",
          `${selected?.command ?? ""} ${input.trim()}`.trim(),
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

      console.log("Send success:", payload);

      if (payload?.status == 200) {
        onSubmitSuccess?.();
      }
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
            : m,
        );
        // persistNow(next); // <-- persist failure state
        return next;
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (navbar === "settings") return <Settings />;

  const isNumericInput = [
    "Kartu Keluarga",
    "N.I.K",
    "Registrasi Nomor Telepon",
  ].includes(selected?.name ?? "");

  return (
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
      {error && <div className="text-center text-red-500">{error}</div>}

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

      <div className="flex flex-col flex-1">
        <div ref={listRef} className="flex-1 overflow-y-auto p-5 bg-cyber">
          <div className="min-h-[100dvh] flex flex-col items-center justify-center px-1 space-y-6 bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat">
            <h1 className="text-2xl font-semibold text-white text-center">
              {selected?.name}
              <br />
              <h3 className="text-sm font-normal text-gray-200">
                {selected?.name === "Kartu Keluarga"
                  ? "Masukkan nomor kartu keluarga yang ingin anda cari"
                  : selected?.name === "Nomor Induk Kependudukan"
                    ? "Masukkan nomor induk kependudukan yang ingin anda cari"
                    : selected?.name === "Registrasi Nomor Telepon"
                      ? "Masukkan nomor telepon yang ingin anda cari"
                      : selected?.name === "Face Recognition"
                        ? "Masukkan foto wajah yang ingin anda cari"
                        : selected?.name === "Nama Lengkap"
                          ? "Masukkan nama yang ingin Anda cari"
                          : "Isi data dengan benar agar proses berjalan lancar"}
              </h3>
            </h1>

            {/* Composer di tengah */}
            <div className="mx-auto max-w-3xl w-full">
              {/* ===== MODE NORMAL ===== */}
              {!isFR && (
                <div className="w-full flex items-center gap-3">
                  <input
                    type={isNumericInput ? "tel" : "text"}
                    inputMode={isNumericInput ? "numeric" : "text"}
                    value={input}
                    onChange={(e) => {
                      const value = isNumericInput
                        ? e.target.value.replace(/\D/g, "")
                        : e.target.value;
                      setInput(value);
                    }}
                    onKeyDown={(e) =>
                      !sendingMessage && e.key === "Enter" && handleSubmit()
                    }
                    disabled={sendingMessage || !selected}
                    className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:ring focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              )}

              {/* ===== MODE FACE RECOGNITION ===== */}
              {isFR && (
                <div className="w-full flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="fr-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploadedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }}
                    disabled={sendingMessage}
                  />

                  {previewUrl && (
                    <div className="w-full flex justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[250px] rounded-xl shadow-lg border border-white/20"
                      />
                    </div>
                  )}

                  <div className="w-full flex items-center gap-3">
                    <label
                      htmlFor="fr-upload"
                      className="flex-1 cursor-pointer rounded-full border border-dashed border-white/60 bg-white/10 px-4 py-3 text-sm text-white text-center hover:bg-white/20 transition"
                    >
                      {uploadedFile ? uploadedFile.name : "Upload foto wajah"}
                    </label>

                    <button
                      onClick={handleSubmit}
                      disabled={sendingMessage || !selected || !uploadedFile}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
