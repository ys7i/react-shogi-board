import type { Kind } from "shogi.js";
import { kindToKanji, PROMOTED_KINDS } from "../../utils/pieceUtils";

export interface ShogiPieceProps {
  kind: Kind;
  /** 0 = 先手 (Black), 1 = 後手 (White) */
  color: 0 | 1;
  /** ピクセル単位の幅。高さは自動調整 */
  size?: number;
  /** ホバー・選択状態 */
  highlighted?: boolean;
}

const PIECE_W = 40;
const PIECE_H = 46;

// 駒の五角形パス (上が尖った伝統形)
//  top center  → right shoulder → bottom right → bottom left → left shoulder
const PIECE_PATH = `
  M ${PIECE_W / 2} 2
  L ${PIECE_W - 2} 16
  L ${PIECE_W - 2} ${PIECE_H - 3}
  Q ${PIECE_W - 2} ${PIECE_H} ${PIECE_W - 5} ${PIECE_H}
  L 5 ${PIECE_H}
  Q 2 ${PIECE_H} 2 ${PIECE_H - 3}
  L 2 16
  Z
`.trim();

// 駒の「縁」をやや広げた影用パス
const SHADOW_PATH = `
  M ${PIECE_W / 2} 4
  L ${PIECE_W} 18
  L ${PIECE_W} ${PIECE_H + 2}
  L 0 ${PIECE_H + 2}
  L 0 18
  Z
`.trim();

export function ShogiPiece({
  kind,
  color,
  size = 52,
  highlighted = false,
}: ShogiPieceProps) {
  const isPromoted = PROMOTED_KINDS.has(kind);
  const isWhite = color === 1;
  const kanji = kindToKanji(kind);

  const svgW = PIECE_W + 4;  // ドロップシャドウ用の余白
  const svgH = PIECE_H + 6;
  const scale = size / svgW;

  const woodLight = "#f5dfa0";
  const woodMid   = "#e8c870";
  const woodDark  = "#c8a040";
  const woodEdge  = "#8a6010";
  const grainId   = `grain-${kind}-${color}`;
  const shadowId  = `shadow-${kind}-${color}`;

  const textColor = isPromoted ? "#b52020" : "#1a1008";
  const fontSize = kind.length > 1 ? 13 : 16; // とや杏などの小字対応

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={size}
      height={size * (svgH / svgW)}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: isWhite ? "rotate(180deg)" : undefined,
        overflow: "visible",
        filter: highlighted ? "drop-shadow(0 0 4px rgba(60,160,255,0.9))" : undefined,
      }}
      aria-label={`${color === 0 ? "先手" : "後手"}の${kanji}`}
      role="img"
    >
      <defs>
        {/* 木目グラデーション */}
        <linearGradient id={grainId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={woodLight} />
          <stop offset="40%"  stopColor={woodMid} />
          <stop offset="100%" stopColor={woodDark} />
        </linearGradient>

        {/* ドロップシャドウ */}
        <filter id={shadowId} x="-20%" y="-10%" width="150%" height="150%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#5a3800" floodOpacity="0.45" />
        </filter>

        {/* ハイライト用クリップ */}
        <clipPath id={`clip-${kind}-${color}`}>
          <path d={PIECE_PATH} transform="translate(2,0)" />
        </clipPath>
      </defs>

      {/* ドロップシャドウ本体 */}
      <path
        d={PIECE_PATH}
        transform="translate(2,2)"
        fill="#6b4000"
        opacity="0.25"
        filter={`url(#${shadowId})`}
      />

      {/* 駒本体：木目グラデーション */}
      <path
        d={PIECE_PATH}
        transform="translate(2,0)"
        fill={`url(#${grainId})`}
        stroke={woodEdge}
        strokeWidth="1"
      />

      {/* 上部ハイライト (光沢) */}
      <ellipse
        cx={PIECE_W / 2 + 2}
        cy={PIECE_H * 0.28}
        rx={PIECE_W * 0.28}
        ry={PIECE_H * 0.10}
        fill="white"
        opacity="0.22"
        clipPath={`url(#clip-${kind}-${color})`}
      />

      {/* 木目ライン */}
      {[0.35, 0.55, 0.72].map((t, i) => (
        <line
          key={i}
          x1={2 + PIECE_W * 0.1}
          y1={PIECE_H * t}
          x2={2 + PIECE_W * 0.9}
          y2={PIECE_H * t + 1}
          stroke={woodEdge}
          strokeWidth="0.4"
          opacity="0.18"
          clipPath={`url(#clip-${kind}-${color})`}
        />
      ))}

      {/* 駒の文字 */}
      <text
        x={PIECE_W / 2 + 2}
        y={PIECE_H * 0.70}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontFamily='"Noto Serif JP", "Yu Mincho", "游明朝", serif'
        fontWeight="700"
        fill={textColor}
        letterSpacing={kind === "OU" ? "0" : "-0.5"}
        style={{ userSelect: "none" }}
      >
        {kanji}
      </text>
    </svg>
  );
}
