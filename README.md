# react-shogi-board

React 製の将棋盤コンポーネントライブラリです。

- 対局盤・棋譜再生・ローレベル盤面表示の 3 コンポーネント
- SFEN による局面の初期化・外部からの駒操作
- shogi.js / json-kifu-format ベース

---

## インストール

```bash
npm install react-shogi-board shogi.js json-kifu-format
```

スタイルを適用するため、エントリポイントで CSS をインポートしてください。

```ts
import "react-shogi-board/styles";
```

---

## コンポーネント

### `<InteractiveBoard>`

ユーザーが駒を操作して対局できるインタラクティブな盤面です。  
外部から `ref` を通じて駒を動かすこともできます（AI 対局など）。

```tsx
import { useRef } from "react";
import { InteractiveBoard, type InteractiveBoardHandle } from "react-shogi-board";

function App() {
  const ref = useRef<InteractiveBoardHandle>(null);

  return (
    <InteractiveBoard
      ref={ref}
      initialSfen="lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1"
      onChange={(sfen) => console.log("現在の局面:", sfen)}
      flipped={false}
    />
  );
}

// 外部から駒を動かす（例: AI の指し手）
ref.current?.move(7, 7, 7, 6);

// 初期局面に戻す
ref.current?.reset();
```

#### Props

| Prop | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `initialSfen` | `string` | 平手初期配置 | 初期局面の SFEN 文字列 |
| `onChange` | `(sfen: string) => void` | — | 盤面が変化するたびに現在の SFEN を通知 |
| `flipped` | `boolean` | `false` | `true` で後手視点に反転 |

#### `InteractiveBoardHandle`（ref）

| メソッド | 説明 |
|----------|------|
| `move(fromX, fromY, toX, toY, promote?)` | 外部から駒を動かす |
| `reset()` | `initialSfen`（省略時は平手）に戻す |

---

### `<KifuPlayer>`

棋譜文字列を渡すと再生コントロール付きの棋譜プレイヤーになります。

```tsx
import { KifuPlayer } from "react-shogi-board";

<KifuPlayer
  kifu={kifuString}
  format="kif"
  autoPlayInterval={800}
  flipped={false}
/>
```

#### Props

| Prop | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `kifu` | `string` | **必須** | 棋譜文字列 |
| `format` | `"kif" \| "ki2" \| "csa" \| "jkf"` | 自動判定 | 棋譜フォーマット |
| `autoPlayInterval` | `number` | `1000` | 自動再生の間隔 (ms) |
| `flipped` | `boolean` | `false` | `true` で後手視点に反転 |

キーボードショートカット: `←` / `→` で 1 手移動、`Space` で再生/停止、`Home` / `End` で先頭/末尾。

---

### `<ShogiBoard>`

局面表示のみを担うローレベルコンポーネントです。  
状態管理は呼び出し側で行います。

```tsx
import { ShogiBoard } from "react-shogi-board";
import { Shogi } from "shogi.js";

const shogi = new Shogi();

<ShogiBoard
  shogi={shogi}
  selectedSquare={{ x: 7, y: 7 }}
  legalSquares={[{ x: 7, y: 6 }]}
  lastMove={{ x: 7, y: 6 }}
  onSquareClick={(pos) => console.log(pos)}
  onHandClick={(kind, color) => console.log(kind, color)}
  flipped={false}
/>
```

#### Props

| Prop | 型 | デフォルト | 説明 |
|------|-----|-----------|------|
| `shogi` | `Shogi` | **必須** | shogi.js の `Shogi` インスタンス |
| `selectedSquare` | `SquarePos \| null` | — | 選択中のマス |
| `legalSquares` | `SquarePos[]` | `[]` | 移動可能なマス一覧（ハイライト表示） |
| `lastMove` | `SquarePos \| null` | — | 直前の指し手の移動先 |
| `onSquareClick` | `(pos: SquarePos) => void` | — | マスクリック時のコールバック |
| `onHandClick` | `(kind: Kind, color: 0 \| 1) => void` | — | 持ち駒クリック時のコールバック |
| `flipped` | `boolean` | `false` | `true` で後手視点に反転 |

---

## Hooks

### `useShogiGame`

`InteractiveBoard` の内部で使用している対局管理フックです。  
盤面の状態管理を自前で行いたい場合に直接使えます。

```tsx
import { useShogiGame } from "react-shogi-board";

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
} = useShogiGame({
  initialSfen: "...",
  onChange: (sfen) => console.log(sfen),
});
```

#### オプション

| オプション | 型 | 説明 |
|------------|-----|------|
| `initialSfen` | `string` | 初期局面の SFEN 文字列 |
| `onChange` | `(sfen: string) => void` | 盤面変化時のコールバック |

---

### `useKifuPlayer`

`KifuPlayer` の内部で使用している棋譜再生フックです。  
独自の再生 UI を構築したい場合に使えます。

```tsx
import { useKifuPlayer } from "react-shogi-board";

const {
  player,        // JKFPlayer インスタンス（player.shogi で局面を取得）
  currentMove,   // 現在の手数
  totalMoves,    // 総手数
  lastMoveTo,    // 直前の指し手の移動先
  moveDescription, // 指し手のテキスト表現
  goNext,
  goPrev,
  goTo,
  goFirst,
  goLast,
} = useKifuPlayer({ kifu: kifuString, format: "kif" });
```

---

## 型

```ts
import type {
  SquarePos,
  ShogiBoardProps,
  InteractiveBoardProps,
  InteractiveBoardHandle,
  KifuPlayerProps,
  UseShogiGameOptions,
  UseShogiGameReturn,
  UseKifuPlayerOptions,
  UseKifuPlayerReturn,
  KifuFormat,
} from "react-shogi-board";
```
