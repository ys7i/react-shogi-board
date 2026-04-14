import { Shogi, Color } from "shogi.js";
import type { Kind } from "shogi.js";
import type Piece from "shogi.js/cjs/Piece";
import { COL_LABELS, HAND_KINDS, ROW_LABELS, kindToKanji } from "../../utils/pieceUtils";
import { ShogiPiece } from "../ShogiPiece";

import styles from "./ShogiBoard.module.css";

export interface SquarePos {
  x: number; // 1–9
  y: number; // 1–9
}

export interface ShogiBoardProps {
  /** shogi.js の Shogi インスタンス */
  shogi: Shogi;
  /** 選択中のマス */
  selectedSquare?: SquarePos | null;
  /** 移動可能なマスの一覧 */
  legalSquares?: SquarePos[];
  /** 直前に動いた駒の移動先 */
  lastMove?: SquarePos | null;
  /** マスをクリックしたとき */
  onSquareClick?: (pos: SquarePos) => void;
  /** 持ち駒をクリックしたとき */
  onHandClick?: (kind: Kind, color: 0 | 1) => void;
  /** 盤面を反転して後手視点で表示するか */
  flipped?: boolean;
}

const LARGE_KINDS = new Set<Kind>(["KA", "HI", "OU"]);

function pieceSize(kind: Kind, base: number) {
  return LARGE_KINDS.has(kind) ? base : base * 0.82;
}

function PieceCell({
  piece,
  flipped,
  highlighted,
}: {
  piece: Piece | null;
  flipped: boolean;
  highlighted?: boolean;
}) {
  if (!piece) return null;
  // flipped 時は盤面が上下反転しているので駒の向きは変わらない
  const displayColor = flipped ? (piece.color === Color.Black ? 1 : 0) : piece.color;
  return (
    <ShogiPiece
      kind={piece.kind}
      color={displayColor as 0 | 1}
      size={pieceSize(piece.kind, 46)}
      highlighted={highlighted}
    />
  );
}

function HandArea({
  shogi,
  color,
  flipped,
  onHandClick,
}: {
  shogi: Shogi;
  color: 0 | 1;
  flipped: boolean;
  onHandClick?: (kind: Kind, color: 0 | 1) => void;
}) {
  // hands が未初期化の場合も考慮してフォールバック
  const summary = shogi.hands?.[color]
    ? shogi.getHandsSummary(color as Color)
    : { FU: 0, KY: 0, KE: 0, GI: 0, KI: 0, KA: 0, HI: 0 };
  const isBottom = flipped ? color === Color.White : color === Color.Black;

  return (
    <div className={`${styles.hand} ${isBottom ? styles.handBottom : styles.handTop}`}>
      <span className={styles.handLabel}>{color === Color.Black ? "先手" : "後手"}</span>
      <div className={styles.handPieces}>
        {HAND_KINDS.map((kind) => {
          const count = summary[kind as keyof typeof summary] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={kind}
              className={styles.handPiece}
              onClick={() => onHandClick?.(kind, color)}
              aria-label={`持ち駒 ${kindToKanji(kind)} ${count}枚`}
            >
                  <ShogiPiece
                kind={kind}
                color={isBottom ? color : (color === 0 ? 1 : 0)}
                size={pieceSize(kind, 36)}
              />
              {count > 1 && <sup className={styles.handCount}>{count}</sup>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ShogiBoard({
  shogi,
  selectedSquare,
  legalSquares = [],
  lastMove,
  onSquareClick,
  onHandClick,
  flipped = false,
}: ShogiBoardProps) {
  const legalSet = new Set(legalSquares.map((p) => `${p.x},${p.y}`));

  // 表示順: flipped=false → col 9→1 (左→右), row 1→9 (上→下)
  const cols = flipped
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
    : [9, 8, 7, 6, 5, 4, 3, 2, 1];
  const rows = flipped
    ? [9, 8, 7, 6, 5, 4, 3, 2, 1]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={styles.wrapper}>
      {/* 後手持ち駒 */}
      <HandArea
        shogi={shogi}
        color={Color.White}
        flipped={flipped}
        onHandClick={onHandClick}
      />

      <div className={styles.boardWrapper}>
        {/* 列ラベル */}
        <div className={styles.colLabels}>
          {cols.map((x) => (
            <span key={x} className={styles.colLabel}>
              {COL_LABELS[9 - x]}
            </span>
          ))}
        </div>

        <div className={styles.boardAndRowLabels}>
          <div className={styles.board} role="grid" aria-label="将棋盤">
            {rows.map((y, ri) =>
              cols.map((x, ci) => {
                const piece = shogi.get(x, y);
                const isSelected =
                  selectedSquare?.x === x && selectedSquare?.y === y;
                const isLegal = legalSet.has(`${x},${y}`);
                const isLastMove = lastMove?.x === x && lastMove?.y === y;

                return (
                  <button
                    key={`${x}-${y}`}
                    role="gridcell"
                    aria-label={`${COL_LABELS[9 - x]}${ROW_LABELS[y - 1]}`}
                    className={`${styles.cell} ${isSelected ? styles.cellSelected : ""} ${
                      isLegal ? styles.cellLegal : ""
                    } ${isLastMove ? styles.cellLastMove : ""} ${
                      ci === 8 ? styles.cellLastCol : ""
                    } ${ri === 8 ? styles.cellLastRow : ""}`}
                    onClick={() => onSquareClick?.({ x, y })}
                  >
                    {piece && (
                      <PieceCell piece={piece} flipped={flipped} highlighted={isSelected} />
                    )}
                    {isLegal && !piece && (
                      <span className={styles.legalDot} aria-hidden="true" />
                    )}
                    {isLegal && piece && (
                      <span className={styles.legalOverlay} aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* 行ラベル */}
          <div className={styles.rowLabels}>
            {rows.map((y) => (
              <span key={y} className={styles.rowLabel}>
                {ROW_LABELS[y - 1]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 先手持ち駒 */}
      <HandArea
        shogi={shogi}
        color={Color.Black}
        flipped={flipped}
        onHandClick={onHandClick}
      />
    </div>
  );
}
