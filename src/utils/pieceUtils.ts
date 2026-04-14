import type { Kind } from "shogi.js";

export const KIND_TO_KANJI: Record<Kind, string> = {
  FU: "歩",
  KY: "香",
  KE: "桂",
  GI: "銀",
  KI: "金",
  KA: "角",
  HI: "飛",
  OU: "王",
  TO: "と",
  NY: "杏",
  NK: "圭",
  NG: "全",
  UM: "馬",
  RY: "龍",
};

export const PROMOTED_KINDS = new Set<Kind>(["TO", "NY", "NK", "NG", "UM", "RY"]);

export const HAND_KINDS: Kind[] = ["HI", "KA", "KI", "GI", "KE", "KY", "FU"];

export const COL_LABELS = ["９", "８", "７", "６", "５", "４", "３", "２", "１"];
export const ROW_LABELS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function kindToKanji(kind: Kind): string {
  return KIND_TO_KANJI[kind] ?? "？";
}
