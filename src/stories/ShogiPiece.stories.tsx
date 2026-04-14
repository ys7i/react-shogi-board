import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShogiPiece } from "../components/ShogiPiece";
import type { Kind } from "shogi.js";
import { HAND_KINDS } from "../utils/pieceUtils";

const meta: Meta<typeof ShogiPiece> = {
  title: "Components/ShogiPiece",
  component: ShogiPiece,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "board",
      values: [
        { name: "board", value: "#c8a040" },
        { name: "white", value: "#ffffff" },
        { name: "dark",  value: "#2a2a2a" },
      ],
    },
    docs: {
      description: {
        component:
          "SVGベースの将棋駒コンポーネント。木目グラデーション・ドロップシャドウで立体感を表現。成り駒は赤文字、後手駒は180°回転して表示。",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    kind: {
      control: "select",
      options: ["FU","KY","KE","GI","KI","KA","HI","OU","TO","NY","NK","NG","UM","RY"],
    },
    color: { control: "radio", options: [0, 1] },
    size:  { control: { type: "range", min: 24, max: 120, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- 基本 ---
export const Default: Story = {
  name: "基本（先手・歩）",
  args: { kind: "FU", color: 0, size: 64 },
};

export const Promoted: Story = {
  name: "成り駒（と金）",
  args: { kind: "TO", color: 0, size: 64 },
};

export const White: Story = {
  name: "後手の駒（180°回転）",
  args: { kind: "FU", color: 1, size: 64 },
};

export const Highlighted: Story = {
  name: "ハイライト状態",
  args: { kind: "KA", color: 0, size: 64, highlighted: true },
};

// --- 全駒一覧 ---
const ALL_KINDS: Kind[] = [
  "FU","KY","KE","GI","KI","KA","HI","OU",
  "TO","NY","NK","NG","UM","RY",
];

export const AllPieces: Story = {
  name: "全駒一覧（先手）",
  render: () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "12px",
      padding: "16px",
    }}>
      {ALL_KINDS.map((kind) => (
        <div key={kind} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <ShogiPiece kind={kind} color={0} size={56} />
          <span style={{ fontSize: 11, color: "#3a1e00", fontFamily: "monospace" }}>{kind}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllPiecesWhite: Story = {
  name: "全駒一覧（後手）",
  render: () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "12px",
      padding: "16px",
    }}>
      {ALL_KINDS.map((kind) => (
        <div key={kind} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <ShogiPiece kind={kind} color={1} size={56} />
          <span style={{ fontSize: 11, color: "#3a1e00", fontFamily: "monospace" }}>{kind}</span>
        </div>
      ))}
    </div>
  ),
};

export const SizeVariants: Story = {
  name: "サイズ比較",
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", padding: "16px" }}>
      {[28, 40, 52, 64, 80, 100].map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <ShogiPiece kind="FU" color={0} size={size} />
          <span style={{ fontSize: 10, color: "#3a1e00" }}>{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const HandPiecesPreview: Story = {
  name: "持ち駒エリアイメージ",
  render: () => (
    <div style={{
      display: "flex",
      gap: "8px",
      padding: "12px 16px",
      background: "#e8d0a0",
      border: "1px solid #a0703a",
      borderRadius: 4,
    }}>
      {HAND_KINDS.map((kind, i) => (
        <div key={kind} style={{ position: "relative" }}>
          <ShogiPiece kind={kind} color={0} size={40} />
          {i < 3 && (
            <sup style={{
              position: "absolute", bottom: 0, right: 0,
              fontSize: 10, color: "#5c3a1e", fontFamily: "serif",
            }}>
              {i + 2}
            </sup>
          )}
        </div>
      ))}
    </div>
  ),
};
