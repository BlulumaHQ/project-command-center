// Bluluma 董事會 — directors mirror the Claude skill "bluluma-board".
// Simulated perspectives built from public material, drawn as original robots (never real likenesses).
// Add a director here — the boardroom and cards pick it up automatically (max 6 seats).

export type Director = {
  id: string; // also the RobotAvatar id
  name: string;
  focus: string; // 專長
  lens: string; // core framework, one line
  asks: string; // the question they always ask
  bubble: string; // short line shown in the animation
  color: string; // robot body colour
};

export const DIRECTORS: Director[] = [
  {
    id: "hormozi",
    name: "Alex Hormozi",
    focus: "Offer & 定價",
    lens: "Value Equation、Grand Slam Offer、LTV:CAC、每天的 outreach 量",
    asks: "你的 offer 好到客戶覺得拒絕很蠢嗎？",
    bubble: "Offer 夠狠嗎？",
    color: "#EA580C",
  },
  {
    id: "naval",
    name: "Naval",
    focus: "槓桿 & 自動化",
    lens: "Specific knowledge、程式與媒體槓桿、擁有 equity 不出租時間",
    asks: "這件事在你睡覺時也會賺錢嗎？",
    bubble: "睡覺也賺錢？",
    color: "#0D9488",
  },
  {
    id: "codie",
    name: "Codie Sanchez",
    focus: "小生意 & 現金流",
    lens: "無聊但穩定的生意、recurring revenue、能不靠你運作",
    asks: "現金流在哪？每月 recurring 多少？",
    bubble: "現金流在哪？",
    color: "#DB2777",
  },
  {
    id: "chrisdo",
    name: "Chris Do",
    focus: "設計商業 & 價值定價",
    lens: "Value-based pricing、定位專精、先策略後設計、敢說不",
    asks: "這個案子對客戶值多少錢？",
    bubble: "客戶值多少？",
    color: "#4338CA",
  },
  {
    id: "paula",
    name: "Paula Scher",
    focus: "品牌 & 視覺判斷",
    lens: "字體即圖像、大膽有觀點、品牌是能延展的系統",
    asks: "拿掉 logo，還認得出是你嗎？",
    bubble: "有觀點嗎？",
    color: "#CA8A04",
  },
];

/** Prompt that starts a meeting in Claude via the bluluma-board skill. */
export function meetingPrompt(topic: string, picked: string[]): string {
  const all = picked.length === 0 || picked.length === DIRECTORS.length;
  const who = all
    ? ""
    : `（只問 ${DIRECTORS.filter((d) => picked.includes(d.id))
        .map((d) => d.name)
        .join("、")}）`;
  return `跟 Bluluma 董事開會${who}：${topic.trim()}`;
}
