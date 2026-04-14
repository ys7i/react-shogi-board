import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shogi } from "shogi.js";
import { ShogiBoard } from "../components/ShogiBoard";

const meta: Meta<typeof ShogiBoard> = {
  title: "Components/ShogiBoard",
  component: ShogiBoard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "将棋盤の表示コンポーネント。shogi.js の `Shogi` インスタンスをそのまま渡して使います。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const initialShogi = new Shogi();

export const Initial: Story = {
  name: "平手初期局面",
  args: {
    shogi: initialShogi,
  },
};

// 合法手のみで数手進めた局面
const midgameShogi = new Shogi();
// 先手: 7七→7六, 後手: 8三→8四, 先手: 2七→2六, 後手: 3三→3四
midgameShogi.move(7, 7, 7, 6); // 先手歩
midgameShogi.move(8, 3, 8, 4); // 後手歩
midgameShogi.move(2, 7, 2, 6); // 先手歩
midgameShogi.move(3, 3, 3, 4); // 後手歩

export const Midgame: Story = {
  name: "中盤局面",
  args: {
    shogi: midgameShogi,
  },
};

export const WithSelected: Story = {
  name: "駒選択状態",
  args: {
    shogi: initialShogi,
    selectedSquare: { x: 7, y: 7 },
    legalSquares: [
      { x: 7, y: 6 },
      { x: 7, y: 5 },
    ],
  },
};

export const WithLastMove: Story = {
  name: "直前の指し手ハイライト",
  args: {
    shogi: initialShogi,
    lastMove: { x: 7, y: 6 },
  },
};

export const Flipped: Story = {
  name: "後手視点",
  args: {
    shogi: initialShogi,
    flipped: true,
  },
};
