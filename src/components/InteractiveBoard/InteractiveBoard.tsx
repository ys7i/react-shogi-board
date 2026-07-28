import React, { forwardRef, useImperativeHandle } from "react";
import Color from "shogi.js/cjs/Color";
import { ShogiBoard } from "../ShogiBoard";
import { useShogiGame } from "../../hooks/useShogiGame";
import { kindToKanji } from "../../utils/pieceUtils";
import styles from "./InteractiveBoard.module.css";

export interface InteractiveBoardHandle {
  /** 外部から駒を動かす */
  move: (fromX: number, fromY: number, toX: number, toY: number, promote?: boolean) => void;
  /** 初期局面に戻す */
  reset: () => void;
}

export interface InteractiveBoardProps {
  /** 後手視点で表示するか */
  flipped?: boolean;
  /** 初期局面の SFEN 文字列（省略時は平手） */
  initialSfen?: string;
  /** 盤面が変化するたびに現在の SFEN を通知 */
  onChange?: (sfen: string) => void;
  /** セル幅(px)。デフォルト54。縮小表示に使用 */
  cellSize?: number;
}

export const InteractiveBoard = forwardRef<InteractiveBoardHandle, InteractiveBoardProps>(
  function InteractiveBoard({ flipped = false, initialSfen, onChange, cellSize }, ref) {
  const {
    shogi,
    selectedSquare,
    legalSquares,
    lastMove,
    promotionPending,
    onSquareClick,
    onHandClick,
    onPromote,
    reset,
    moveExternal,
  } = useShogiGame({ initialSfen, onChange });

  useImperativeHandle(ref, () => ({ move: moveExternal, reset }), [moveExternal, reset]);

  const turnLabel = shogi.turn === Color.Black ? "先手番" : "後手番";

  const cssVars = cellSize !== undefined
    ? ({ '--cell-w': `${cellSize}px`, '--cell-h': `${Math.round(cellSize * 10 / 9)}px` } as React.CSSProperties)
    : undefined;

  return (
    <div className={styles.wrapper} style={cssVars}>
      {/* 成り確認ダイアログ */}
      {promotionPending && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="成り確認">
          <div className={styles.dialog}>
            <p className={styles.dialogTitle}>
              {kindToKanji(promotionPending.kind)} を成りますか？
            </p>
            <div className={styles.dialogButtons}>
              <button
                className={`${styles.dialogButton} ${styles.dialogButtonPromote}`}
                onClick={() => onPromote(true)}
              >
                成る
              </button>
              <button
                className={`${styles.dialogButton} ${styles.dialogButtonNoPromote}`}
                onClick={() => onPromote(false)}
              >
                成らない
              </button>
            </div>
          </div>
        </div>
      )}

      <ShogiBoard
        shogi={shogi}
        selectedSquare={selectedSquare}
        legalSquares={legalSquares}
        lastMove={lastMove}
        onSquareClick={onSquareClick}
        onHandClick={onHandClick}
        flipped={flipped}
        cellSize={cellSize}
      />

      <div className={styles.statusBar}>
        <span className={styles.turnLabel}>{turnLabel}</span>
        <button className={styles.resetButton} onClick={reset}>
          最初から
        </button>
      </div>
    </div>
  );
});
