import { useCallback, useMemo, useState } from "react";
import { JKFPlayer } from "json-kifu-format";
import type { SquarePos } from "../components/ShogiBoard";

export type KifuFormat = "kif" | "ki2" | "csa" | "jkf";

export interface UseKifuPlayerOptions {
  /** 棋譜文字列 */
  kifu: string;
  /** 棋譜のフォーマット (省略時は自動判定) */
  format?: KifuFormat;
}

export interface UseKifuPlayerReturn {
  /** 現在の局面を管理する JKFPlayer */
  player: JKFPlayer;
  /** 現在の手数 (0 = 初期局面) */
  currentMove: number;
  /** 総手数 */
  totalMoves: number;
  /** 直前の指し手の移動先 */
  lastMoveTo: SquarePos | null;
  /** 次の手へ */
  goNext: () => void;
  /** 前の手へ */
  goPrev: () => void;
  /** 指定手数へジャンプ */
  goTo: (move: number) => void;
  /** 最初へ */
  goFirst: () => void;
  /** 最後へ */
  goLast: () => void;
  /** 現在の手の説明テキスト */
  moveDescription: string;
}

function createPlayer(kifu: string, format?: KifuFormat): JKFPlayer {
  switch (format) {
    case "kif":
      return JKFPlayer.parseKIF(kifu);
    case "ki2":
      return JKFPlayer.parseKI2(kifu);
    case "csa":
      return JKFPlayer.parseCSA(kifu);
    case "jkf":
      return JKFPlayer.parseJKF(kifu);
    default:
      return JKFPlayer.parse(kifu);
  }
}

export function useKifuPlayer({
  kifu,
  format,
}: UseKifuPlayerOptions): UseKifuPlayerReturn {
  const player = useMemo(() => createPlayer(kifu, format), [kifu, format]);

  const totalMoves = useMemo(
    () => player.kifu.moves.length - 1,
    [player]
  );

  const [currentMove, setCurrentMove] = useState(0);

  const goTo = useCallback(
    (move: number) => {
      const clamped = Math.max(0, Math.min(move, totalMoves));
      const diff = clamped - currentMove;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) player.forward();
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) player.backward();
      }
      setCurrentMove(clamped);
    },
    [currentMove, player, totalMoves]
  );

  const goNext = useCallback(() => goTo(currentMove + 1), [currentMove, goTo]);
  const goPrev = useCallback(() => goTo(currentMove - 1), [currentMove, goTo]);
  const goFirst = useCallback(() => goTo(0), [goTo]);
  const goLast = useCallback(() => goTo(totalMoves), [goTo, totalMoves]);

  const lastMoveTo = useMemo((): SquarePos | null => {
    if (currentMove === 0) return null;
    const move = player.kifu.moves[currentMove];
    if (!move?.move || !("to" in move.move)) return null;
    const to = (move.move as { to?: { x: number; y: number } }).to;
    if (!to) return null;
    return { x: to.x, y: to.y };
  }, [currentMove, player]);

  const moveDescription = useMemo(() => {
    if (currentMove === 0) return "初期局面";
    try {
      const mv = player.kifu.moves[currentMove];
      return mv ? JKFPlayer.moveToReadableKifu(mv) : `${currentMove}手目`;
    } catch {
      return `${currentMove}手目`;
    }
  }, [currentMove, player]);

  return {
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
  };
}
