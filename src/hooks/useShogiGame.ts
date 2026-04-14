import { useCallback, useMemo, useRef, useState } from "react";
import { Shogi, Color, Piece } from "shogi.js";
import type { Kind } from "shogi.js";
import type { SquarePos } from "../components/ShogiBoard";

export interface UseShogiGameOptions {
  initialSfen?: string;
  onChange?: (sfen: string) => void;
}

export interface UseShogiGameReturn {
  shogi: Shogi;
  selectedSquare: SquarePos | null;
  legalSquares: SquarePos[];
  lastMove: SquarePos | null;
  /** trueなら成り選択ダイアログ表示中 */
  promotionPending: {
    from: SquarePos | null;
    to: SquarePos;
    kind: Kind;
  } | null;
  onSquareClick: (pos: SquarePos) => void;
  onHandClick: (kind: Kind, color: 0 | 1) => void;
  onPromote: (promote: boolean) => void;
  reset: () => void;
  moveExternal: (fromX: number, fromY: number, toX: number, toY: number, promote?: boolean) => void;
}

function canReachPromoZone(color: Color, y: number): boolean {
  return color === Color.Black ? y <= 3 : y >= 7;
}

function mustPromote(kind: Kind, color: Color, y: number): boolean {
  if (kind === "FU" || kind === "KY") {
    return color === Color.Black ? y === 1 : y === 9;
  }
  if (kind === "KE") {
    return color === Color.Black ? y <= 2 : y >= 8;
  }
  return false;
}

export function useShogiGame(options: UseShogiGameOptions = {}): UseShogiGameReturn {
  const { initialSfen } = options;
  // onChange を ref で保持してコールバックの参照変化に依存しないようにする
  const onChangeRef = useRef(options.onChange);
  onChangeRef.current = options.onChange;

  const [shogi] = useState(() => {
    const s = new Shogi();
    if (initialSfen) s.initializeFromSFENString(initialSfen);
    return s;
  });
  const [, forceRender] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<SquarePos | null>(null);
  const [selectedHandKind, setSelectedHandKind] = useState<{
    kind: Kind;
    color: 0 | 1;
  } | null>(null);
  const [lastMove, setLastMove] = useState<SquarePos | null>(null);
  const [promotionPending, setPromotionPending] = useState<{
    from: SquarePos | null;
    to: SquarePos;
    kind: Kind;
  } | null>(null);

  const refresh = useCallback(() => forceRender((n) => n + 1), []);

  const notifyChange = useCallback(() => {
    onChangeRef.current?.(shogi.toSFENString());
  }, [shogi]);

  const legalSquares = useMemo((): SquarePos[] => {
    if (selectedHandKind) {
      return shogi
        .getDropsBy(selectedHandKind.color as Color)
        .filter((m) => m.kind === selectedHandKind.kind)
        .map((m) => ({ x: m.to.x, y: m.to.y }));
    }
    if (!selectedSquare) return [];
    return shogi
      .getMovesFrom(selectedSquare.x, selectedSquare.y)
      .map((m) => ({ x: m.to.x, y: m.to.y }));
  }, [selectedSquare, selectedHandKind, shogi]);

  const onSquareClick = useCallback(
    (pos: SquarePos) => {
      const { x, y } = pos;

      // 持ち駒打ちの場合
      if (selectedHandKind) {
        const isLegal = legalSquares.some((p) => p.x === x && p.y === y);
        if (isLegal) {
          shogi.drop(x, y, selectedHandKind.kind);
          setLastMove(pos);
          refresh();
          notifyChange();
        }
        setSelectedHandKind(null);
        setSelectedSquare(null);
        return;
      }

      const piece = shogi.get(x, y);

      // 自分の駒を選択中で合法手先をクリック
      if (selectedSquare) {
        const isLegal = legalSquares.some((p) => p.x === x && p.y === y);
        if (isLegal) {
          const fromPiece = shogi.get(selectedSquare.x, selectedSquare.y);
          if (!fromPiece) {
            setSelectedSquare(null);
            return;
          }
          const from = selectedSquare;
          // 成りチェック
          const inPromoZone =
            canReachPromoZone(fromPiece.color, y) ||
            canReachPromoZone(fromPiece.color, from.y);
          const must = mustPromote(fromPiece.kind, fromPiece.color, y);
          if (
            !Piece.isPromoted(fromPiece.kind) &&
            inPromoZone &&
            !["KI", "OU"].includes(fromPiece.kind)
          ) {
            if (must) {
              shogi.move(from.x, from.y, x, y, true);
              setLastMove(pos);
              setSelectedSquare(null);
              refresh();
              notifyChange();
            } else {
              setPromotionPending({ from, to: pos, kind: fromPiece.kind });
              setSelectedSquare(null);
            }
          } else {
            shogi.move(from.x, from.y, x, y, false);
            setLastMove(pos);
            setSelectedSquare(null);
            refresh();
            notifyChange();
          }
          return;
        }

        // 自分の別の駒をクリック → 選択し直し
        if (piece && piece.color === shogi.turn) {
          setSelectedSquare(pos);
          return;
        }

        // それ以外 → 選択解除
        setSelectedSquare(null);
        return;
      }

      // 手番側の駒を選択
      if (piece && piece.color === shogi.turn) {
        setSelectedSquare(pos);
      }
    },
    [legalSquares, notifyChange, refresh, selectedHandKind, selectedSquare, shogi]
  );

  const onHandClick = useCallback(
    (kind: Kind, color: 0 | 1) => {
      if (shogi.turn !== (color as Color)) return;
      setSelectedSquare(null);
      setSelectedHandKind((prev) =>
        prev?.kind === kind && prev?.color === color ? null : { kind, color }
      );
    },
    [shogi.turn]
  );

  const onPromote = useCallback(
    (promote: boolean) => {
      if (!promotionPending) return;
      const { from, to } = promotionPending;
      if (from) {
        shogi.move(from.x, from.y, to.x, to.y, promote);
        setLastMove(to);
        refresh();
        notifyChange();
      }
      setPromotionPending(null);
    },
    [notifyChange, promotionPending, refresh, shogi]
  );

  const reset = useCallback(() => {
    if (initialSfen) {
      shogi.initializeFromSFENString(initialSfen);
    } else {
      shogi.initialize();
    }
    setSelectedSquare(null);
    setSelectedHandKind(null);
    setLastMove(null);
    setPromotionPending(null);
    refresh();
    notifyChange();
  }, [initialSfen, notifyChange, refresh, shogi]);

  const moveExternal = useCallback(
    (fromX: number, fromY: number, toX: number, toY: number, promote = false) => {
      shogi.move(fromX, fromY, toX, toY, promote);
      setLastMove({ x: toX, y: toY });
      setSelectedSquare(null);
      setSelectedHandKind(null);
      refresh();
      notifyChange();
    },
    [notifyChange, refresh, shogi]
  );

  return {
    shogi,
    selectedSquare: selectedHandKind ? null : selectedSquare,
    legalSquares,
    lastMove,
    promotionPending,
    onSquareClick,
    onHandClick,
    onPromote,
    reset,
    moveExternal,
  };
}
