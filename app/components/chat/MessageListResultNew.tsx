"use client";

import { chatMessageListResultAsync } from "@/redux/slices/chatSlice";
import type { AppDispatch, RootState } from "@redux/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import Settings from "../settings/Settings";
import { ChatItem } from "./ChatWrapper";
import { BotResult, BotResultSocket } from "@/app/interfaces/botsecret/result";
import { FaFileAlt } from "react-icons/fa";
import ResultTree from "./Resultline";

const socket: Socket = io(process.env.NEXT_PUBLIC_BASE_URL_SOCKET as string);

// ---------------------------
// Single message bubble (safe hooks)
// ---------------------------
// function MessageRow({
//   msg,
//   isMe,
//   scrollSmart,
// }: {
//   msg: BotResult;
//   isMe: boolean;
//   scrollSmart: () => void;
// }) {
//   const captureRef = useRef<HTMLDivElement>(null);
//   const [copied, setCopied] = useState(false);

//   const kk = useMemo(() => parseKK(msg.result_text || ""), [msg.result_text]);
//   const generic = useMemo(
//     () => parseGeneric(msg.result_text || ""),
//     [msg.result_text],
//   );
//   const nikRecords = useMemo(
//     () => parsePopulationResult(msg.result_text || ""),
//     [msg.result_text],
//   );

//   const isName = useMemo(
//     () => isNameResult(msg.result_text),
//     [msg.result_text],
//   );

//   const nameRecords = useMemo(
//     () => (isName ? parseNameResult(msg.result_text || "") : []),
//     [msg.result_text, isName],
//   );

//   const isFR = useMemo(
//     () => isFaceRecognitionResult(msg.result_text),
//     [msg.result_text],
//   );

//   const frRecords = useMemo(
//     () => (isFR ? parseFaceRecognition(msg.result_text || "") : []),
//     [msg.result_text, isFR],
//   );

//   const hasKK = !!(kk.found && kk.members.length > 0);
//   const hasGenericContent =
//     (generic.people?.length ?? 0) > 0 ||
//     !!generic.wallets ||
//     !!generic.queryPhone ||
//     !!generic.contact ||
//     !!generic.regData;
//   const hasGeneric = !!(generic.found && hasGenericContent);
//   const hasNIK = !!(nikRecords.length > 0);

//   // const showKK = hasKK;
//   // const showGeneric = !showKK && hasGeneric;
//   // const showNIK = !showKK && !showGeneric && hasNIK;

//   const showFR = isFR && frRecords.length > 0;
//   const showName = !showFR && isName && nameRecords.length > 0;
//   const showKK = !showFR && !showName && hasKK;
//   const showGeneric = !showFR && !showName && hasGeneric;
//   const showNIK = !showFR && !showName && hasNIK;

//   async function copyAllLikeScreenshot() {
//     const text = buildExportText({
//       showKK,
//       kk,
//       showGeneric,
//       generic,
//       showNIK,
//       nikRecords,
//       showName,
//       nameRecords,
//       raw: msg.result_text || "",
//     });

//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     } catch (e) {
//       console.error("Copy failed:", e);
//     }
//   }

//   function FaceRecognitionTable({ records }: { records: FRRecord[] }) {
//     return (
//       <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
//         <div className="px-3 py-2 text-[11px] uppercase tracking-wider bg-white/10">
//           Face Recognition Result
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[900px] text-xs">
//             <thead className="bg-white/10">
//               <tr>
//                 <th className="px-3 py-2 text-left  w-[50px]">No</th>
//                 <th className="px-3 py-2 text-left  w-[80px]">Kemiripan</th>
//                 <th className="px-3 py-2 text-left">NIK</th>
//                 <th className="px-3 py-2 text-left">Nama</th>
//                 <th className="px-3 py-2 text-left">TTL</th>
//                 <th className="px-3 py-2 text-left">Alamat</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((r) => (
//                 <tr key={r.result} className="odd:bg-white/0 even:bg-white/5">
//                   <td className="px-3 py-2">{r.result}</td>
//                   <td className="px-3 py-2 font-semibold text-emerald-300">
//                     {r.similarity || "-"}
//                   </td>
//                   <td className="px-3 py-2 font-mono w-[125px]">
//                     {r.nik || "-"}
//                   </td>
//                   <td className="px-3 py-2">{r.nama || "-"}</td>
//                   <td className="px-3 py-2">{r.ttl || "-"}</td>
//                   <td className="px-3 py-2 break-words">{r.alamat || "-"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//       <div
//         className={`relative mb-3 p-3 rounded-xl max-w-[95%] text-sm leading-snug shadow-md
//           ${
//             isMe
//               ? "bg-chatbot text-white rounded-br-none"
//               : "bg-chatbot text-white rounded-bl-none"
//           }`}
//         style={{ wordBreak: "break-word" }}
//       >
//         {(showKK || showNIK || showName) && (
//           <div className="absolute -top-3 right-2 flex gap-1">
//             <button
//               className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 copyAllLikeScreenshot();
//               }}
//               title="Copy all text"
//             >
//               {copied ? "Copied" : "Copy"}
//             </button>
//           </div>
//         )}

//         {!showFR && (
//           <div ref={captureRef}>
//             {showName ? (
//               <NameResultTable records={nameRecords} />
//             ) : showKK ? (
//               <KKFamilyTable nkk={kk.nkk} area={kk.area} members={kk.members} />
//             ) : showGeneric ? (
//               <div className="space-y-2">
//                 {generic.queryPhone ? (
//                   <div className="text-xs text-white/90">
//                     <span className="text-white/70">Phone</span>:{" "}
//                     <span className="font-medium">{generic.queryPhone}</span>
//                   </div>
//                 ) : null}
//                 {generic.contact ? (
//                   <div className="text-xs text-white/90">
//                     <span className="text-white/70">Contact</span>:{" "}
//                     {generic.contact}
//                   </div>
//                 ) : null}
//                 {generic.regData ? (
//                   <div className="text-xs text-white/90">
//                     <span className="text-white/70">Reg Data</span>:{" "}
//                     {generic.regData}
//                   </div>
//                 ) : null}
//                 {generic.wallets ? (
//                   <WalletTable wallets={generic.wallets} />
//                 ) : null}
//                 {generic.people.length > 0 ? (
//                   <div className="mt-2">
//                     {generic.people.map((p, idx) => (
//                       <PersonRecordTable key={idx} person={p} index={idx} />
//                     ))}
//                   </div>
//                 ) : null}
//               </div>
//             ) : showNIK ? (
//               <ParsedResult records={nikRecords} />
//             ) : (
//               <div className="whitespace-pre-wrap">{msg.result_text}</div>
//             )}

//             {msg.mime_type === "image/jpeg" && (
//               <img
//                 src={`${msg.file_url}`}
//                 alt="Preview"
//                 className="max-w-full rounded-lg shadow-lg mt-2"
//                 onLoad={scrollSmart}
//                 onClick={(e) => e.stopPropagation()}
//               />
//             )}
//           </div>
//         )}

//         {showFR && <FaceRecognitionTable records={frRecords} />}

//         <div
//           className={`text-[10px] ${
//             isMe ? "text-white" : "text-gray-300"
//           } mt-1 text-right select-none`}
//         >
//           {new Date(msg.created_at).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </div>

//         <div
//           className={`absolute -z-10 bottom-0 h-4 w-4 ${
//             isMe ? "right-2 bg-blue-600" : "left-2 bg-gray-100"
//           } rounded-full blur-[6px] opacity-30`}
//         />
//       </div>
//     </div>
//   );
// }

const MessageListResultNew = ({ selected }: { selected: ChatItem | null }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white md:rounded-none">
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
      <div className="flex-1 overflow-y-auto p-5 bg-cyber bg-[url('/images/bg-chat.png')] bg-cover bg-center bg-no-repeat">
        {/* <h5 className="text-white bg-red-400">hello</h5> */}
        <ResultTree
          files={[
            { id: "1", label: "NIK User" },
            { id: "2", label: "Kartu Keluarga" },
            { id: "3", label: "Profiling Number" },
            { id: "4", label: "Alamat Email" },
            { id: "5", label: "Nomor Kendaraan" },
            { id: "6", label: "Nama Perusahaan" },
          ]}
        />
      </div>
    </div>
  );
};

export default MessageListResultNew;
