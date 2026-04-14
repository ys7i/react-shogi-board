import type { Meta, StoryObj } from "@storybook/react-vite";
import { InteractiveBoard } from "../components/InteractiveBoard";

const meta: Meta<typeof InteractiveBoard> = {
  title: "Components/InteractiveBoard",
  component: InteractiveBoard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "対局用インタラクティブ盤面。クリックで駒を選択・移動できます。持ち駒の打ち込み・成り選択にも対応しています。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "先手視点（デフォルト）",
  args: {},
};

export const FlippedView: Story = {
  name: "後手視点",
  args: {
    flipped: true,
  },
};
