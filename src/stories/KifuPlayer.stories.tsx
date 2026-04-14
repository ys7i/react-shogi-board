import type { Meta, StoryObj } from "@storybook/react-vite";
import { KifuPlayer } from "../components/KifuPlayer";
import { SAMPLE_KIF_YAGURA, SAMPLE_KIF_FURIBISHA } from "./sampleKifu";

const meta: Meta<typeof KifuPlayer> = {
  title: "Components/KifuPlayer",
  component: KifuPlayer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "棋譜再生コンポーネント。KIF / KI2 / CSA / JKF 形式の棋譜文字列を渡すと手順を再生できます。\n\n**キーボードショートカット**: ← / → で1手進む・戻る、Space で再生/停止、Home / End で最初/最後へ。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Yagura: Story = {
  name: "矢倉定跡",
  args: {
    kifu: SAMPLE_KIF_YAGURA,
    format: "kif",
  },
};

export const Furibisha: Story = {
  name: "振り飛車",
  args: {
    kifu: SAMPLE_KIF_FURIBISHA,
    format: "kif",
  },
};

export const Flipped: Story = {
  name: "後手視点",
  args: {
    kifu: SAMPLE_KIF_YAGURA,
    format: "kif",
    flipped: true,
  },
};

export const FastAutoPlay: Story = {
  name: "高速自動再生",
  args: {
    kifu: SAMPLE_KIF_YAGURA,
    format: "kif",
    autoPlayInterval: 400,
  },
};
