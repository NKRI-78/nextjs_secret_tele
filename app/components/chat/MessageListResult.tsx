"use client";

import { chatMessageListResultAsync } from "@/redux/slices/chatSlice";
import type { AppDispatch, RootState } from "@redux/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import Settings from "../settings/Settings";
import { ChatItem } from "./ChatWrapper";
import { BotResult, BotResultSocket } from "@/app/interfaces/botsecret/result";
import { FaRegCopy, FaCheck } from "react-icons/fa";

const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL_SOCKET as string);

// ===========================
// Helper: hide intro messages
// ===========================
function isIntroText(text?: string | null): boolean {
  if (!text) return false;
  const s = text.trim();
  if (/^\/start\b/i.test(s)) return true;
  if (/akses\s+track\s+bts/i.test(s)) return true;
  return false;
}

function isHiddenText(text?: string | null): boolean {
  if (!text) return false;

  const s = text.replace(/\s+/g, " ").trim().toLowerCase();

  return (
    s.includes("foto fr berhasil dikirim!") ||
    s.includes("pastikan struktur wajah terang dan jelas") ||
    s.includes("please wait") ||
    s.includes("foto fr v1 diterima!") ||
    s.includes("pesan berhasil dikirim.") ||
    s.includes("pilih fitur:") ||
    s.includes("on proses") ||
    s.includes("silakan pilih dan kirim foto dari galeri anda") ||
    s.includes("mengirim") ||
    s.includes("akses cp digunakan sebanyak 3 kali hari ini. tunggu proses") ||
    s.includes("has been sent, don't spam.")
  );
}

// ---------------------------
// Parsing helpers (NIK-style)
// ---------------------------
type ParsedRecord = { [key: string]: string };

const FIELD_ORDER = [
  "NIK",
  "NKK",
  "NAMA",
  "TTL",
  "JK",
  "NIK IBU",
  "NAMA IBU",
  "NIK AYAH",
  "NAMA AYAH",
  "ALAMAT",
];

const FIELD_LABELS: Record<string, string> = {
  NIK: "NIK",
  NKK: "NKK",
  NAMA: "Nama",
  TTL: "Tempat/Tanggal Lahir",
  JK: "Jenis Kelamin",
  "NIK IBU": "NIK Ibu",
  "NAMA IBU": "Nama Ibu",
  "NIK AYAH": "NIK Ayah",
  "NAMA AYAH": "Nama Ayah",
  ALAMAT: "Alamat",
};

function stripCodeFence(raw: string): string {
  let s = (raw || "").trim();
  if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  s = s.replace(/\.::DON'T SHARE ANYWHERE::.\.?/gi, "").trim();
  return s;
}

function parsePopulationResult(rawText: string): ParsedRecord[] {
  if (!rawText) return [];
  const text = stripCodeFence(rawText);

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const indices: number[] = [];
  lines.forEach((l, i) => {
    if (/^NO\.\s*\d+/i.test(l)) indices.push(i);
  });

  const recordBlocks: string[][] = [];
  if (indices.length === 0) {
    recordBlocks.push(lines);
  } else {
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = i + 1 < indices.length ? indices[i + 1] : lines.length;
      recordBlocks.push(lines.slice(start, end));
    }
  }

  const records: ParsedRecord[] = [];

  for (const block of recordBlocks) {
    const rec: ParsedRecord = {};
    for (const line of block) {
      if (/^--\s*Found\s*Page/i.test(line)) continue;
      if (/^NO\.\s*\d+/i.test(line)) continue;

      const m = line.match(/^([A-Z .]+?)\s*:\s*(.*)$/i);
      if (m) {
        let key = m[1].trim().toUpperCase();
        const val = (m[2] || "").trim();

        key = key
          .replace(/\s+/g, " ")
          .replace(/IBU\s*$/i, "IBU")
          .replace(/AYAH\s*$/i, "AYAH");

        rec[key] = val;
      }
    }

    const hasAny =
      Object.keys(rec).length > 0 || block.some((l) => /^NIK\s*:\s*/i.test(l));

    if (hasAny) {
      if (!rec["NIK"]) {
        const nikLine = block.find((l) => /^NIK\s*:\s*/i.test(l));
        if (nikLine) {
          rec["NIK"] = nikLine.split(":").slice(1).join(":").trim();
        }
      }
      records.push(rec);
    }
  }

  if (records.length === 0) {
    const nikOnly = text.match(/NIK\s*:\s*([0-9]+)/i);
    if (nikOnly) records.push({ NIK: nikOnly[1] });
  }

  return records;
}

// ---------------------------
// Parsing helpers (Generic Phone/Wallet/Database)
// ---------------------------
type Person = { Name?: string; Email?: string; Phone?: string; DOB?: string };
type Wallets = Record<string, string>;
type GenericParsed = {
  found: boolean;
  queryPhone?: string;
  contact?: string;
  regData?: string;
  wallets?: Wallets;
  people: Person[];
  expedition?: string;
  recidivist?: string;
  vehicle?: string;
};

function readSection(
  lines: string[],
  startIdx: number,
): { end: number; rows: string[] } {
  const rows: string[] = [];
  let i = startIdx;
  for (; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) {
      if (rows.length) break;
      else continue;
    }
    if (/^[A-Za-z ]+information\s*:/i.test(l) && i !== startIdx) break;
    if (
      /^(Contact|Reg Data|Detail from Family Number Data)/i.test(l) &&
      i !== startIdx
    )
      break;
    rows.push(l);
  }
  return { end: i, rows };
}

function parseGeneric(rawText: string): GenericParsed {
  const out: GenericParsed = { found: false, people: [] };
  const text = stripCodeFence(rawText);
  const lines = text.split(/\r?\n/).map((s) => s.trim());

  if (!lines.length) return out;

  const phoneLine = lines.find((l) => /^Phone\s+\S+/i.test(l));
  if (phoneLine) {
    const m = phoneLine.match(/^Phone\s+(.+)$/i);
    if (m) out.queryPhone = m[1].trim();
  }

  const contactIdx = lines.findIndex((l) => /^Contact\s*:/i.test(l));
  if (contactIdx >= 0) {
    const next = lines[contactIdx + 1] || "";
    out.contact = next || "-";
  }

  const regIdx = lines.findIndex((l) => /^Reg Data\s*:/i.test(l));
  if (regIdx >= 0) {
    const { rows } = readSection(lines, regIdx + 1);
    out.regData = rows.join(" ") || lines[regIdx + 1] || "";
  }

  const wIdx = lines.findIndex((l) => /^Wallet information\s*:/i.test(l));
  if (wIdx >= 0) {
    const { rows } = readSection(lines, wIdx + 1);
    const wallets: Wallets = {};
    for (const r of rows) {
      const m = r.match(/^([A-Za-z]+)\s+(.+)$/);
      if (m) wallets[m[1].toUpperCase()] = m[2].trim();
    }
    if (Object.keys(wallets).length) out.wallets = wallets;
  }

  const dIdx = lines.findIndex((l) => /^Database information\s*:/i.test(l));
  if (dIdx >= 0) {
    const { rows } = readSection(lines, dIdx + 1);
    let current: Person | null = null;
    const pushCurrent = () => {
      if (current && Object.values(current).some(Boolean))
        out.people.push(current);
      current = null;
    };
    for (const r of rows) {
      if (!r) {
        pushCurrent();
        continue;
      }
      const kv = r.match(/^([A-Za-z ]+)\s*:\s*(.*)$/);
      if (kv) {
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        if (key === "name") {
          pushCurrent();
          current = { Name: val };
        } else {
          if (!current) current = {};
          if (key === "email") current.Email = val;
          else if (key === "phone") current.Phone = val;
          else if (key === "dob") current.DOB = val;
        }
      }
    }
    pushCurrent();
  }

  const eIdx = lines.findIndex((l) => /^Expedition information\s*:/i.test(l));
  if (eIdx >= 0) out.expedition = readSection(lines, eIdx + 1).rows.join(" ");

  const rIdx = lines.findIndex((l) => /^Recidivist information\s*:/i.test(l));
  if (rIdx >= 0) out.recidivist = readSection(lines, rIdx + 1).rows.join(" ");

  const vIdx = lines.findIndex((l) => /^Vehicle Information\s*:/i.test(l));
  if (vIdx >= 0) out.vehicle = readSection(lines, vIdx + 1).rows.join(" ");

  out.found =
    !!out.queryPhone ||
    !!out.contact ||
    !!out.regData ||
    !!out.wallets ||
    out.people.length > 0 ||
    !!out.expedition ||
    !!out.recidivist ||
    !!out.vehicle;

  return out;
}

// ---------------------------
// Parsing helpers (KK / Family Number)
// ---------------------------
type KKMember = {
  NIK?: string;
  NAMA_LENGKAP?: string;
  TTL?: string;
  JK?: string;
  SHK?: string; // Hubungan
  STATUS_PERKAWINAN?: string;
  AGAMA?: string;
  GOLONGAN_DARAH?: string;
  PENDIDIKAN_TERAKHIR?: string;
  PEKERJAAN?: string;
  // Area
  ALAMAT?: string;
  PROVINSI?: string;
  KABUPATEN?: string;
  KECAMATAN?: string;
  KELURAHAN?: string;
  // Orang tua (BARU)
  NIK_IBU?: string;
  NAMA_IBU?: string;
  NIK_AYAH?: string;
  NAMA_AYAH?: string;
  // NKK (jika per-anggota ada)
  NKK?: string;
};

type KKParsed = {
  found: boolean;
  nkk?: string;
  area?: {
    ALAMAT?: string;
    PROVINSI?: string;
    KABUPATEN?: string;
    KECAMATAN?: string;
    KELURAHAN?: string;
  };
  members: KKMember[];
};

function isNameResult(text?: string | null): boolean {
  if (!text) return false;

  const hasHeader = /Data Ditemukan/i.test(text) && /💡\s*\d+/i.test(text);

  if (!hasHeader) return false;

  return /NAMA\s*:/i.test(text);
}

// === UPDATED: alias & normalizer diperluas ===
function normalizeKeyKK(k: string): keyof KKMember | "OTHER" {
  const t = k.trim().toUpperCase();

  if (t === "NIK") return "NIK";
  if (t === "NKK") return "NKK";
  if (t === "NAMA LENGKAP" || t === "NAMA") return "NAMA_LENGKAP";
  if (t === "TTL") return "TTL";
  if (t === "JENIS KELAMIN" || t === "JK") return "JK";
  if (t === "STATUS HUBUNGAN KELUARGA" || t === "HUBUNGAN") return "SHK";
  if (t === "STATUS PERKAWINAN" || t === "STATUS") return "STATUS_PERKAWINAN";
  if (t === "AGAMA") return "AGAMA";
  if (t === "GOLONGAN DARAH") return "GOLONGAN_DARAH";
  if (t === "PENDIDIKAN TERAKHIR" || t === "PENDIDIKAN")
    return "PENDIDIKAN_TERAKHIR";
  if (t === "PEKERJAAN") return "PEKERJAAN";

  if (t === "ALAMAT") return "ALAMAT";
  if (t === "PROVINSI" || t === "PROP") return "PROVINSI";
  if (t === "KABUPATEN" || t === "KAB") return "KABUPATEN";
  if (t === "KECAMATAN" || t === "KEC") return "KECAMATAN";
  if (t === "KELURAHAN" || t === "KEL") return "KELURAHAN";

  if (t === "NIK IBU") return "NIK_IBU";
  if (t === "NAMA IBU") return "NAMA_IBU";
  if (t === "NIK AYAH") return "NIK_AYAH";
  if (t === "NAMA AYAH") return "NAMA_AYAH";

  return "OTHER";
}

// === UPDATED: deteksi format KK lebih fleksibel (tanpa header) + deteksi NKK header ===
function parseKK(rawText: string): KKParsed {
  const out: KKParsed = { found: false, members: [] };
  const text = stripCodeFence(rawText);
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const hasHeaderOld =
    lines.some((l) => /^Detail from Family Number Data/i.test(l)) ||
    lines.some(
      (l) => /^NIK\s*:\s*/i.test(l) && /^NKK\s*:\s*/i.test(lines.join(" ")),
    );

  const nikCount = lines.filter((l) => /^NIK\s*:\s*/i.test(l)).length;
  const hasKKLikeBlocks =
    nikCount >= 2 &&
    (lines.some((l) => /^HUBUNGAN\s*:/i.test(l)) ||
      lines.some((l) => /^STATUS\s*:/i.test(l)) ||
      lines.some((l) => /^STATUS PERKAWINAN\s*:/i.test(l)) ||
      lines.some((l) => /^ALAMAT\s*:/i.test(l)) ||
      lines.some((l) => /^PROP\s*:/i.test(l)) ||
      lines.some((l) => /^KAB\s*:/i.test(l)) ||
      lines.some((l) => /^KEC\s*:/i.test(l)));

  const hasKKHeader = hasHeaderOld || hasKKLikeBlocks;
  if (!hasKKHeader) return out;

  const firstLine = lines[0] || "";
  const nkkHeader = firstLine.match(/^(\d{16})\s*:\s*$/)?.[1];

  const memberBlocks: string[][] = [];
  let curr: string[] = [];
  for (const line of lines) {
    if (/^NIK\s*:/i.test(line)) {
      if (curr.length) memberBlocks.push(curr);
      curr = [line];
    } else {
      if (curr.length) curr.push(line);
    }
  }
  if (curr.length) memberBlocks.push(curr);

  if (!memberBlocks.length) return out;

  const allNKK: string[] = [];
  const areaVotes = {
    ALAMAT: new Map<string, number>(),
    PROVINSI: new Map<string, number>(),
    KABUPATEN: new Map<string, number>(),
    KECAMATAN: new Map<string, number>(),
    KELURAHAN: new Map<string, number>(),
  };

  const members: KKMember[] = [];

  for (const block of memberBlocks) {
    const m: KKMember = {};
    for (const line of block) {
      const kv = line.match(/^([A-Z .]+?)\s*:\s*(.*)$/i);
      if (!kv) continue;
      const rawKey = kv[1].trim();
      const value = (kv[2] || "").trim();
      const key = normalizeKeyKK(rawKey);

      if (key !== "OTHER") {
        (m as any)[key] = value;

        if (key === "NKK" && value) allNKK.push(value);

        if (
          (key === "ALAMAT" ||
            key === "PROVINSI" ||
            key === "KABUPATEN" ||
            key === "KECAMATAN" ||
            key === "KELURAHAN") &&
          value
        ) {
          const map =
            key === "ALAMAT"
              ? areaVotes.ALAMAT
              : key === "PROVINSI"
                ? areaVotes.PROVINSI
                : key === "KABUPATEN"
                  ? areaVotes.KABUPATEN
                  : key === "KECAMATAN"
                    ? areaVotes.KECAMATAN
                    : areaVotes.KELURAHAN;
          map.set(value, (map.get(value) || 0) + 1);
        }
      }
    }
    members.push(m);
  }

  let nkk: string | undefined;
  if (allNKK.length) {
    const freq = new Map<string, number>();
    for (const n of allNKK) freq.set(n, (freq.get(n) || 0) + 1);
    const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
    nkk = entries[0]?.[0];
  }
  if (!nkk && nkkHeader) nkk = nkkHeader;

  function topOf(map: Map<string, number>): string | undefined {
    const entries = Array.from(map.entries());
    if (!entries.length) return undefined;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  const area = {
    ALAMAT: topOf(areaVotes.ALAMAT),
    PROVINSI: topOf(areaVotes.PROVINSI),
    KABUPATEN: topOf(areaVotes.KABUPATEN),
    KECAMATAN: topOf(areaVotes.KECAMATAN),
    KELURAHAN: topOf(areaVotes.KELURAHAN),
  };

  out.found = true;
  out.nkk = nkk || members.find((m) => m.NKK)?.NKK;
  out.area = area;
  out.members = members;
  return out;
}

// ---------------------------
// UI pieces
// ---------------------------

function CopyBadge({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="
  ml-2 p-1 rounded
  bg-white/10 hover:bg-white/20
  border border-white/20
  transition-transform
  hover:scale-110 active:scale-95
"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        } catch {
          console.log("Error");
        }
      }}
      title={label}
    >
      {done ? (
        <FaCheck size={12} className="text-emerald-400" />
      ) : (
        <FaRegCopy size={12} className="text-white/70" />
      )}
    </button>
  );
}

// Helper deteksi FR
function isFaceRecognitionResult(text?: string | null): boolean {
  if (!text) return false;
  return (
    /FACE\s+RECOGNITION\s+RESULT/i.test(text) ||
    (/--RESULT\s+\d+--/i.test(text) && /KEMIRIPAN\s*:/i.test(text))
  );
}

type FRRecord = {
  result: number;
  nik?: string;
  similarity?: string;
  nama?: string;
  ttl?: string;
  alamat?: string;
};

function parseFaceRecognition(rawText: string): FRRecord[] {
  if (!rawText) return [];

  const text = stripCodeFence(rawText);

  const blocks = text.split(/--RESULT\s+\d+--/i).slice(1);

  return blocks.map((block, idx) => {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}\\s*:\\s*(.+)`, "i"));
      return m?.[1]?.trim();
    };

    return {
      result: idx + 1,
      nik: get("NIK"),
      similarity: get("KEMIRIPAN"),
      nama: get("NAMA"),
      ttl: get("TTL"),
      alamat: get("ALAMAT"),
    };
  });
}

function parseNameResult(rawText: string): ParsedRecord[] {
  if (!rawText) return [];

  const text = stripCodeFence(rawText)
    // buang header
    .replace(/\+{3}[\s\S]*?\+{3}/i, "")
    .trim();

  // split berdasarkan 💡 nomor
  const blocks = text
    .split(/💡\s*\d+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const records: ParsedRecord[] = [];

  for (const block of blocks) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const rec: ParsedRecord = {};

    for (const line of lines) {
      const m = line.match(/^([A-Z\s]+?)\s*:\s*(.*)$/);
      if (!m) continue;

      const key = m[1].trim().toUpperCase();
      const val = (m[2] || "").trim();

      rec[key] = val;
    }

    if (Object.keys(rec).length) {
      records.push(rec);
    }
  }

  return records;
}

function ResultRecordTable({
  record,
  index,
}: {
  record: ParsedRecord;
  index: number;
}) {
  const known = FIELD_ORDER.filter((k) => record[k] && record[k].trim() !== "");
  const extras = Object.keys(record)
    .filter(
      (k) => !FIELD_ORDER.includes(k) && record[k] && record[k].trim() !== "",
    )
    .sort();

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10">
        Record {index + 1}
      </div>
      <table className="w-full text-xs">
        <tbody>
          {[...known, ...extras].map((key) => {
            const label = FIELD_LABELS[key] ?? key;
            const val = record[key];
            // const isNIK = key === "NIK" && val;
            const copyableKeys = [
              "NIK",
              "NAMA",
              "NIK IBU",
              "NAMA IBU",
              "NIK AYAH",
              "NAMA AYAH",
              "KK",
              "NKK",
              "NOMOR",
            ];

            const isCopyable = copyableKeys.includes(key) && val;

            return (
              <tr key={key} className="odd:bg-white/0 even:bg-white/5">
                <td className="w-[34%] px-3 py-2 text-white/80 align-top">
                  {label}
                </td>
                <td
                  className={
                    "px-3 py-2 text-white " +
                    ([
                      "NIK",
                      "NIK IBU",
                      "NIK AYAH",
                      "KK",
                      "NKK",
                      "NOMOR",
                    ].includes(key)
                      ? "whitespace-nowrap"
                      : "break-words")
                  }
                >
                  <div className="flex items-center gap-2 min-w-fit">
                    <span
                      className={
                        ([
                          "NIK",
                          "NIK IBU",
                          "NIK AYAH",
                          "KK",
                          "NKK",
                          "NOMOR",
                        ].includes(key)
                          ? "font-mono tabular-nums select-all hyphens-none "
                          : "") + (key === "NIK" ? "font-semibold" : "")
                      }
                      title={val || "-"}
                    >
                      {val || "-"}
                    </span>

                    {/* {isNIK && val ? <CopyBadge value={val} /> : null} */}
                    {isCopyable ? <CopyBadge value={val} /> : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ParsedResult({ records }: { records: ParsedRecord[] }) {
  if (!records.length) return null;
  return (
    <div className="mt-2">
      {records.map((rec, idx) => (
        <ResultRecordTable key={idx} record={rec} index={idx} />
      ))}
    </div>
  );
}

function PersonRecordTable({
  person,
  index,
}: {
  person: Person;
  index: number;
}) {
  const fields: Array<[string, string | undefined]> = [
    ["Name", person.Name],
    ["Email", person.Email],
    ["Phone", person.Phone],
    ["DOB", person.DOB],
  ];
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10">
        Database Record {index + 1}
      </div>
      <table className="w-full text-xs">
        <tbody>
          {fields.map(([k, v]) => (
            <tr key={k} className="odd:bg-white/0 even:bg-white/5">
              <td className="w-[34%] px-3 py-2 text-white/80 align-top">{k}</td>
              <td className="px-3 py-2 text-white break-words">{v || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WalletTable({ wallets }: { wallets: Wallets }) {
  const providers = Object.keys(wallets);
  if (!providers.length) return null;
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10">
        Wallet Information
      </div>
      <table className="w-full text-xs">
        <tbody>
          {providers.map((p) => (
            <tr key={p} className="odd:bg-white/0 even:bg-white/5">
              <td className="w-[34%] px-3 py-2 text-white/80 align-top">{p}</td>
              <td className="px-3 py-2 text-white break-words">{wallets[p]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NameResultTable({ records }: { records: ParsedRecord[] }) {
  if (!records.length) return null;

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10">
        Hasil Pencarian Nama
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-xs table-auto">
          <thead className="bg-white/10">
            <tr>
              <th className="px-3 py-2 text-left">NIK</th>
              <th className="px-3 py-2 text-left">No KK</th>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">TTL</th>
              <th className="px-3 py-2 text-left">JK</th>
              <th className="px-3 py-2 text-left">Nama Ibu</th>
              <th className="px-3 py-2 text-left">Nama Ayah</th>
              <th className="px-3 py-2 text-left">Alamat</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, i) => (
              <tr key={r.NIK || i} className="odd:bg-white/0 even:bg-white/5">
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.NIK ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums">{r.NIK}</span>
                      <CopyBadge value={r.NIK} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {r.NKK ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums">{r.NKK}</span>
                      <CopyBadge value={r.NKK} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-3 py-2">
                  {r.NAMA ? (
                    <div className="flex items-center gap-2">
                      <span>{r.NAMA}</span>
                      <CopyBadge value={r.NAMA} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-3 py-2">{r.TTL || "-"}</td>
                <td className="px-3 py-2">{r.JK || "-"}</td>

                <td className="px-3 py-2">{r["NAMA IBU"] || "-"}</td>

                <td className="px-3 py-2">{r["NAMA AYAH"] || "-"}</td>

                <td className="px-3 py-2 break-words min-w-[300px]">
                  {r.ALAMAT || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// KK Family table
function KKFamilyTable({
  nkk,
  area,
  members,
}: {
  nkk?: string;
  area?: KKParsed["area"];
  members: KKMember[];
}) {
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10 flex items-center justify-between">
        <div>
          <div className="font-semibold">Kartu Keluarga</div>
          {nkk ? (
            <div className="text-[11px] mt-1">
              NKK: <span className="font-medium">{nkk}</span>{" "}
              <CopyBadge value={nkk} />
            </div>
          ) : null}
        </div>
        <div className="text-[11px] text-right leading-tight opacity-90">
          {area?.ALAMAT ? <div>Alamat: {area.ALAMAT}</div> : null}
          {area?.KELURAHAN ? <div>Kelurahan: {area.KELURAHAN}</div> : null}
          {area?.KECAMATAN ? <div>Kecamatan: {area.KECAMATAN}</div> : null}
          {area?.KABUPATEN ? <div>Kabupaten: {area.KABUPATEN}</div> : null}
          {area?.PROVINSI ? <div>Provinsi: {area.PROVINSI}</div> : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1600px] text-xs table-auto">
          <thead className="bg-white/10">
            <tr>
              <th className="px-3 py-2 text-left">NIK</th>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-left">TTL</th>
              <th className="px-3 py-2 text-left">JK</th>
              <th className="px-3 py-2 text-left">SHK</th>
              <th className="px-3 py-2 text-left">Status Kawin</th>
              <th className="px-3 py-2 text-left">Agama</th>
              <th className="px-3 py-2 text-left">Gol Darah</th>
              <th className="px-3 py-2 text-left">Pendidikan</th>
              <th className="px-3 py-2 text-left">Pekerjaan</th>
              <th className="px-3 py-2 text-left">NIK Ibu</th>
              <th className="px-3 py-2 text-left">Nama Ibu</th>
              <th className="px-3 py-2 text-left">NIK Ayah</th>
              <th className="px-3 py-2 text-left">Nama Ayah</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i} className="odd:bg-white/0 even:bg-white/5">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2 min-w-fit">
                    <span
                      className="font-medium font-mono tabular-nums select-all hyphens-none"
                      title={m.NIK || "-"}
                    >
                      {m.NIK || "-"}
                    </span>
                    {m.NIK ? <CopyBadge value={m.NIK} /> : null}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {m.NAMA_LENGKAP ? (
                    <div className="flex items-center gap-2">
                      <span>{m.NAMA_LENGKAP}</span>
                      <CopyBadge value={m.NAMA_LENGKAP} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-3 py-2">{m.TTL || "-"}</td>
                <td className="px-3 py-2">{m.JK || "-"}</td>
                <td className="px-3 py-2">{m.SHK || "-"}</td>
                <td className="px-3 py-2">{m.STATUS_PERKAWINAN || "-"}</td>
                <td className="px-3 py-2">{m.AGAMA || "-"}</td>
                <td className="px-3 py-2">{m.GOLONGAN_DARAH || "-"}</td>
                <td className="px-3 py-2">{m.PENDIDIKAN_TERAKHIR || "-"}</td>
                <td className="px-3 py-2">{m.PEKERJAAN || "-"}</td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {m.NIK_IBU ? (
                    <div className="flex items-center gap-2 min-w-fit">
                      <span className="font-mono tabular-nums">
                        {m.NIK_IBU}
                      </span>
                      <CopyBadge value={m.NIK_IBU} label="Copy" />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2">
                  {m.NAMA_IBU ? (
                    <div className="flex items-center gap-2">
                      <span>{m.NAMA_IBU}</span>
                      <CopyBadge value={m.NAMA_IBU} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-3 py-2 whitespace-nowrap">
                  {m.NIK_AYAH ? (
                    <div className="flex items-center gap-2 min-w-fit">
                      <span className="font-mono tabular-nums">
                        {m.NIK_AYAH}
                      </span>
                      <CopyBadge value={m.NIK_AYAH} label="Copy" />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2 min-w-[180px]">
                  {m.NAMA_AYAH ? (
                    <div className="flex items-center gap-2">
                      <span>{m.NAMA_AYAH}</span>
                      <CopyBadge value={m.NAMA_AYAH} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===========================
// Helper: Build export text
// ===========================
function stringifyRecord(rec: ParsedRecord): string {
  const lines: string[] = [];
  const known = FIELD_ORDER.filter((k) => rec[k] && rec[k].trim() !== "");
  const extras = Object.keys(rec)
    .filter((k) => !FIELD_ORDER.includes(k) && rec[k] && rec[k].trim() !== "")
    .sort();
  for (const k of [...known, ...extras]) {
    const label = FIELD_LABELS[k] ?? k;
    lines.push(`${label}: ${rec[k] ?? "-"}`);
  }
  return lines.join("\n");
}

function buildExportText({
  showKK,
  kk,
  showGeneric,
  generic,
  showNIK,
  nikRecords,
  showName,
  nameRecords,
  raw,
}: {
  showKK: boolean;
  kk: KKParsed;
  showGeneric: boolean;
  generic: GenericParsed;
  showNIK: boolean;
  nikRecords: ParsedRecord[];
  showName: boolean;
  nameRecords: ParsedRecord[];
  raw: string;
}) {
  if (showKK) {
    const parts: string[] = [];
    parts.push("=== KARTU KELUARGA ===");
    if (kk.nkk) parts.push(`NKK: ${kk.nkk}`);
    if (kk.area) {
      const areaLine = [
        kk.area.ALAMAT ? `Alamat: ${kk.area.ALAMAT}` : "",
        kk.area.KELURAHAN ? `Kelurahan: ${kk.area.KELURAHAN}` : "",
        kk.area.KECAMATAN ? `Kecamatan: ${kk.area.KECAMATAN}` : "",
        kk.area.KABUPATEN ? `Kabupaten: ${kk.area.KABUPATEN}` : "",
        kk.area.PROVINSI ? `Provinsi: ${kk.area.PROVINSI}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
      if (areaLine) parts.push(areaLine);
    }
    parts.push("");
    kk.members.forEach((m, idx) => {
      parts.push(`-- Anggota ${idx + 1} --`);
      parts.push(`NIK: ${m.NIK ?? "-"}`);
      parts.push(`Nama: ${m.NAMA_LENGKAP ?? "-"}`);
      parts.push(`TTL: ${m.TTL ?? "-"}`);
      parts.push(`JK: ${m.JK ?? "-"}`);
      parts.push(`SHK: ${m.SHK ?? "-"}`);
      parts.push(`Status Kawin: ${m.STATUS_PERKAWINAN ?? "-"}`);
      parts.push(`Agama: ${m.AGAMA ?? "-"}`);
      parts.push(`Gol Darah: ${m.GOLONGAN_DARAH ?? "-"}`);
      parts.push(`Pendidikan: ${m.PENDIDIKAN_TERAKHIR ?? "-"}`);
      parts.push(`Pekerjaan: ${m.PEKERJAAN ?? "-"}`);
      parts.push(`NIK Ibu: ${m.NIK_IBU ?? "-"}`);
      parts.push(`Nama Ibu: ${m.NAMA_IBU ?? "-"}`);
      parts.push(`NIK Ayah: ${m.NIK_AYAH ?? "-"}`);
      parts.push(`Nama Ayah: ${m.NAMA_AYAH ?? "-"}`);
      parts.push("");
    });
    return parts.join("\n");
  }
  if (showName && nameRecords.length) {
    const parts: string[] = [];
    parts.push("=== DATA PENCARIAN NAMA ===");
    nameRecords.forEach((r, i) => {
      parts.push(`-- Record ${i + 1} --`);
      parts.push(stringifyRecord(r));
      parts.push("");
    });
    return parts.join("\n");
  }

  if (showGeneric) {
    const parts: string[] = [];
    parts.push("=== DATA NOMOR / WALLET / DATABASE ===");
    if (generic.queryPhone) parts.push(`Phone: ${generic.queryPhone}`);
    if (generic.contact) parts.push(`Contact: ${generic.contact}`);
    if (generic.regData) parts.push(`Reg Data: ${generic.regData}`);
    if (generic.wallets && Object.keys(generic.wallets).length) {
      parts.push("");
      parts.push("[Wallet Information]");
      Object.keys(generic.wallets).forEach((k) => {
        parts.push(`${k}: ${generic.wallets?.[k] ?? "-"}`);
      });
    }
    if (generic.people?.length) {
      parts.push("");
      parts.push("[Database Information]");
      generic.people.forEach((p, i) => {
        parts.push(`-- Record ${i + 1} --`);
        parts.push(`Name: ${p.Name ?? "-"}`);
        parts.push(`Email: ${p.Email ?? "-"}`);
        parts.push(`Phone: ${p.Phone ?? "-"}`);
        parts.push(`DOB: ${p.DOB ?? "-"}`);
        parts.push("");
      });
    }
    return parts.join("\n");
  }

  if (showNIK && nikRecords.length) {
    const parts: string[] = [];
    parts.push("=== DATA NIK ===");
    nikRecords.forEach((r, i) => {
      parts.push(`-- Record ${i + 1} --`);
      parts.push(stringifyRecord(r));
      parts.push("");
    });
    return parts.join("\n");
  }

  return stripCodeFence(raw || "");
}

// ---------------------------
// Single message bubble (safe hooks)
// ---------------------------
function MessageRow({
  msg,
  isMe,
  scrollSmart,
}: {
  msg: BotResult;
  isMe: boolean;
  scrollSmart: () => void;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const kk = useMemo(() => parseKK(msg.result_text || ""), [msg.result_text]);
  const generic = useMemo(
    () => parseGeneric(msg.result_text || ""),
    [msg.result_text],
  );
  const nikRecords = useMemo(
    () => parsePopulationResult(msg.result_text || ""),
    [msg.result_text],
  );

  const isName = useMemo(
    () => isNameResult(msg.result_text),
    [msg.result_text],
  );

  const nameRecords = useMemo(
    () => (isName ? parseNameResult(msg.result_text || "") : []),
    [msg.result_text, isName],
  );

  const isFR = useMemo(
    () => isFaceRecognitionResult(msg.result_text),
    [msg.result_text],
  );

  const frRecords = useMemo(
    () => (isFR ? parseFaceRecognition(msg.result_text || "") : []),
    [msg.result_text, isFR],
  );

  const hasKK = !!(kk.found && kk.members.length > 0);
  const hasGenericContent =
    (generic.people?.length ?? 0) > 0 ||
    !!generic.wallets ||
    !!generic.queryPhone ||
    !!generic.contact ||
    !!generic.regData;
  const hasGeneric = !!(generic.found && hasGenericContent);
  const hasNIK = !!(nikRecords.length > 0);

  // const showKK = hasKK;
  // const showGeneric = !showKK && hasGeneric;
  // const showNIK = !showKK && !showGeneric && hasNIK;

  const showFR = isFR && frRecords.length > 0;
  const showName = !showFR && isName && nameRecords.length > 0;
  const showKK = !showFR && !showName && hasKK;
  const showGeneric = !showFR && !showName && hasGeneric;
  const showNIK = !showFR && !showName && hasNIK;

  async function copyAllLikeScreenshot() {
    const text = buildExportText({
      showKK,
      kk,
      showGeneric,
      generic,
      showNIK,
      nikRecords,
      showName,
      nameRecords,
      raw: msg.result_text || "",
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  }

  function FaceRecognitionTable({ records }: { records: FRRecord[] }) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10">
          Hasil Face Recognition
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-xs">
            <thead className="bg-white/10">
              <tr>
                <th className="px-3 py-2 text-left  w-[50px]">No</th>
                <th className="px-3 py-2 text-left  w-[80px]">Kemiripan</th>
                <th className="px-3 py-2 text-left">NIK</th>
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">TTL</th>
                <th className="px-3 py-2 text-left">Alamat</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.result} className="odd:bg-white/0 even:bg-white/5">
                  <td className="px-3 py-2">{r.result}</td>
                  <td className="px-3 py-2 font-semibold text-emerald-300">
                    {r.similarity || "-"}
                  </td>
                  <td className="px-3 py-2 font-mono w-[125px] whitespace-nowrap">
                    {r.nik ? (
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums select-all">{r.nik}</span>
                        <CopyBadge value={r.nik} />
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {r.nama ? (
                      <div className="flex items-center gap-2">
                        <span>{r.nama}</span>
                        <CopyBadge value={r.nama} />
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-3 py-2">{r.ttl || "-"}</td>
                  <td className="px-3 py-2 break-words">{r.alamat || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative mb-3 p-3 rounded-xl max-w-[95%] text-sm leading-snug shadow-md
          ${
            isMe
              ? "bg-chatbot text-white rounded-br-none"
              : "bg-chatbot text-white rounded-bl-none"
          }`}
        style={{ wordBreak: "break-word" }}
      >
        {(showKK || showNIK || showName) && (
          <div className="absolute -top-3 right-2 flex gap-1">
            <button
              className="
  p-1 rounded
  bg-white/10 hover:bg-white/20
  border border-white/20
  transition-transform
  hover:scale-110 active:scale-95
"
              onClick={(e) => {
                e.stopPropagation();
                copyAllLikeScreenshot();
              }}
              title="Copy all text"
            >
              {copied ? (
                <FaCheck size={12} className="text-emerald-400" />
              ) : (
                <FaRegCopy size={12} className="text-white/70" />
              )}
            </button>
          </div>
        )}

        {!showFR && (
          <div ref={captureRef}>
            {showName ? (
              <NameResultTable records={nameRecords} />
            ) : showKK ? (
              <KKFamilyTable nkk={kk.nkk} area={kk.area} members={kk.members} />
            ) : showGeneric ? (
              <div className="space-y-2">
                {generic.queryPhone ? (
                  <div className="text-xs text-white/90">
                    <span className="text-white/70">Phone</span>:{" "}
                    <span className="font-medium">{generic.queryPhone}</span>
                  </div>
                ) : null}
                {generic.contact ? (
                  <div className="text-xs text-white/90">
                    <span className="text-white/70">Contact</span>:{" "}
                    {generic.contact}
                  </div>
                ) : null}
                {generic.regData ? (
                  <div className="text-xs text-white/90">
                    <span className="text-white/70">Reg Data</span>:{" "}
                    {generic.regData}
                  </div>
                ) : null}
                {generic.wallets ? (
                  <WalletTable wallets={generic.wallets} />
                ) : null}
                {generic.people.length > 0 ? (
                  <div className="mt-2">
                    {generic.people.map((p, idx) => (
                      <PersonRecordTable key={idx} person={p} index={idx} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : showNIK ? (
              <ParsedResult records={nikRecords} />
            ) : (
              <div className="whitespace-pre-wrap">{msg.result_text}</div>
            )}

            {msg.mime_type === "image/jpeg" && (
              <img
                src={`${msg.file_url}`}
                alt="Preview"
                className="max-w-full rounded-lg shadow-lg mt-2"
                onLoad={scrollSmart}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}

        {showFR && <FaceRecognitionTable records={frRecords} />}

        <div
          className={`text-[10px] ${
            isMe ? "text-white" : "text-gray-300"
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
}

// ---------------------------
// List container
// ---------------------------
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

  // initial load -> sort once by created_at (ASC) and filter intro
  useEffect(() => {
    if (result) {
      const incoming: BotResult[] = result
        .map((msg) => ({
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
        }))
        .filter((m) => !isIntroText(m.result_text));

      incoming.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ); // keep chronological

      setMessages(incoming);
    }
  }, [result]);

  // socket stream -> append at bottom, filter intro, dedupe by id
  useEffect(() => {
    socket.emit("room:lobby:join", "");
    const handler = (msg: any) => {
      try {
        const parsed: BotResultSocket = JSON.parse(msg);
        console.log("Received bot_msg via socket:", parsed);

        if ("source_type" in parsed) return;
        if (isIntroText(parsed.result_text)) return;

        const dataMsg: BotResult = {
          id: parsed.id,
          chat_id: parsed.chat_id,
          file_url: parsed.file_url,
          message_id: 0,
          mime_type: parsed.mime_type,
          result_from: parsed.result_from,
          result_text: parsed.result_text,
          username: parsed.username,
          created_at: parsed.created_at ?? new Date().toISOString(),
          updated_at: parsed.updated_at ?? new Date().toISOString(),
        };

        // console.log("dataMsg", dataMsg.result_text);

        setMessages((prev) => {
          // if (prev.some((m) => m.id === dataMsg.id)) return prev; // dedupe
          return [...prev, dataMsg]; // append to bottom
        });
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
    if (hasOverflow) el.scrollTop = el.scrollHeight; // stick to bottom
  }, []);

  useEffect(() => {
    scrollSmart();
  }, [messages, scrollSmart]);

  if (navbar === "settings") return <Settings />;

  // penambahan helper
  function shouldHideMessage(msg: any, index: number, all: any[]) {
    const text = msg.result_text?.toLowerCase().trim() || "";

    // 1. system / info message
    if (
      text === "on proses" ||
      text.includes("pesan berhasil dikirim") ||
      text.includes("pilih fitur") ||
      text.includes("gunakan tombol")
    ) {
      return true;
    }

    // 2. loading text, tapi biarkan yang TERAKHIR
    if (text.includes("mengirim permintaan")) {
      return index !== all.length - 1;
    }

    return false;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* TOP NAVBAR */}
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

      {/* MESSAGE LIST */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-5 bg-cyber bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat"
      >
        {/* remove justify-center so messages start at top and grow downward */}
        <div className="min-h-[100dvh] flex flex-col px-1 space-y-3">
          {messages
            // .filter(
            //   (msg) =>
            //     (msg.result_text && msg.result_text.trim() !== "") ||
            //     msg.mime_type === "image/jpeg",
            // )
            .filter((msg, i, arr) => {
              // tetap tampilkan image
              // if (msg.mime_type === "image/jpeg") return true;
              const hasText = msg.result_text && msg.result_text.trim() !== "";

              if (hasText && isHiddenText(msg.result_text)) {
                return false;
              }

              if (msg.mime_type === "image/jpeg") {
                return true;
              }

              if (hasText) {
                return true;
              }

              // helper filter
              if (shouldHideMessage(msg, i, arr)) return false;
              // if (isHiddenText(msg.result_text)) return false;

              return true;
            })
            /* IMPORTANT: no sort here—use state order */
            .map((msg, i) => {
              const isMe = msg.username === username;
              if (
                msg.result_text?.includes("Mengirim permintaan") &&
                i !== messages.length - 1
              ) {
                return null;
              }
              return (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  scrollSmart={scrollSmart}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default MessageListResult;
