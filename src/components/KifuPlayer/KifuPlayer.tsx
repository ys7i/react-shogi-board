import { useCallback, useEffect, useRef, useState } from "react";
import { ShogiBoard } from "../ShogiBoard";
import { useKifuPlayer, type KifuFormat } from "../../hooks/useKifuPlayer";
import styles from "./KifuPlayer.module.css";

export interface KifuPlayerProps {
  /** 棋譜文字列 */
  kifu: string;
  /** 棋譜フォーマット (省略時は自動判定) */
  format?: KifuFormat;
  /** 後手視点で表示するか */
  flipped?: boolean;
  /** 自動再生の間隔 (ms) */
  autoPlayInterval?: number;
}

export function KifuPlayer({
  kifu,
  format,
  flipped = false,
  autoPlayInterval = 1000,
}: KifuPlayerProps) {
  const {
    player,
    currentMove,
    totalMoves,
    lastMoveTo,
    goNext,
    goPrev,
    goTo,
    goFirst,
    goLast,
    moveDescription,
  } = useKifuPlayer({ kifu, format });

  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    if (currentMove >= totalMoves) goFirst();
    setIsPlaying(true);
  }, [currentMove, goFirst, totalMoves]);

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      if (currentMove >= totalMoves) {
        stopPlay();
        return;
      }
      goNext();
    }, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentMove, totalMoves, goNext, stopPlay, autoPlayInterval]);

  // キーボードショートカット
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        stopPlay();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        stopPlay();
        goPrev();
      } else if (e.key === "Home") {
        stopPlay();
        goFirst();
      } else if (e.key === "End") {
        stopPlay();
        goLast();
      } else if (e.key === " ") {
        e.preventDefault();
        isPlaying ? stopPlay() : startPlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goFirst, goLast, goNext, goPrev, isPlaying, startPlay, stopPlay]);

  return (
    <div className={styles.wrapper}>
      <ShogiBoard shogi={player.shogi} lastMove={lastMoveTo} flipped={flipped} />

      <div className={styles.controls}>
        {/* スライダー */}
        <div className={styles.sliderRow}>
          <input
            type="range"
            min={0}
            max={totalMoves}
            value={currentMove}
            onChange={(e) => {
              stopPlay();
              goTo(Number(e.target.value));
            }}
            className={styles.slider}
            aria-label="手数"
          />
        </div>

        {/* ボタン行 */}
        <div className={styles.buttonRow}>
          <button
            className={styles.button}
            onClick={() => { stopPlay(); goFirst(); }}
            disabled={currentMove === 0}
            aria-label="最初へ"
            title="最初へ (Home)"
          >
            ⏮
          </button>
          <button
            className={styles.button}
            onClick={() => { stopPlay(); goPrev(); }}
            disabled={currentMove === 0}
            aria-label="前の手"
            title="前の手 (←)"
          >
            ◀
          </button>

          <button
            className={`${styles.button} ${styles.buttonPlay}`}
            onClick={isPlaying ? stopPlay : startPlay}
            aria-label={isPlaying ? "停止" : "再生"}
            title="再生/停止 (Space)"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            className={styles.button}
            onClick={() => { stopPlay(); goNext(); }}
            disabled={currentMove === totalMoves}
            aria-label="次の手"
            title="次の手 (→)"
          >
            ▶
          </button>
          <button
            className={styles.button}
            onClick={() => { stopPlay(); goLast(); }}
            disabled={currentMove === totalMoves}
            aria-label="最後へ"
            title="最後へ (End)"
          >
            ⏭
          </button>
        </div>

        {/* 手数・指し手テキスト */}
        <div className={styles.moveInfo}>
          <span className={styles.moveCount}>
            {currentMove} / {totalMoves} 手
          </span>
          <span className={styles.moveDesc}>{moveDescription}</span>
        </div>
      </div>
    </div>
  );
}
