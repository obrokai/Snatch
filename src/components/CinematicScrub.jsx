import ScrubSequence from "./ScrubSequence.jsx";

/** 電影感轉場：壺鈴揮擺環繞鏡頭，捲動擦洗（痛點 → 解法 的情緒橋段）。 */
const CAPTIONS = [
  { t: "每一次揮擺，", s: "都是一次消費、一次紀錄、一次留存機會。" },
  { t: "但這些訊號，", s: "過去全都散落在紙本、Excel 和店長的記憶裡。" },
  { t: "現在，它們自動變成資料。", s: "會員、金流、出席、留存——一次到位。" },
];

export default function CinematicScrub() {
  return (
    <ScrubSequence
      base={`${import.meta.env.BASE_URL}cinematic/frame_`}
      count={121}
      captions={CAPTIONS}
      end="+=340%"
      loadLabel="載入影像"
    />
  );
}
