// Bluluma 董事會 — directors mirror the Claude skill "bluluma-board".
// Simulated perspectives built from public material, drawn as original robots (never real likenesses).
// 5 fixed directors (Hormozi, Naval, Chris Do, Paula Scher, Munger) + seat 6 = 神秘嘉賓 (id "guest").
// The guest is picked by the chair per meeting from GUEST_POOL (edge function board-meeting). Max 6 seats.

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
  {
    id: "munger",
    name: "Charlie Munger",
    focus: "反向思考 · 常任唱反調",
    lens: "Inversion（先想怎麼會失敗）、多元思考模型、避開愚蠢比追求聰明重要",
    asks: "這件事最可能怎麼失敗？",
    bubble: "反過來想！",
    color: "#475569",
  },
  {
    id: "guest",
    name: "神秘嘉賓",
    focus: "每場由主席依議題邀請",
    lens: "跨領域客座：風險、專注、小公司、創業、行為心理、長期思維…",
    asks: "（看今天是誰來）",
    bubble: "今天是誰？",
    color: "#7C3AED",
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

export const GUEST_ID = "guest";

export type Guest = Pick<Director, "id" | "name" | "focus" | "lens" | "asks">;

/** 客座董事名單 — the chair invites the best fit for each meeting into the 神秘嘉賓 seat. */
export const GUEST_POOL: Guest[] = [
  {
    id: "taleb",
    name: "Nassim Taleb",
    focus: "風險 & 反脆弱",
    lens: "Antifragile、skin in the game、先看下檔風險、避開爆倉型錯誤",
    asks: "最壞情況發生時，你扛得住嗎？",
  },
  {
    id: "mckeown",
    name: "Greg McKeown",
    focus: "取捨 & 專注",
    lens: "Essentialism：少但更好、不是「絕對要做」就是「不做」、先刪再加",
    asks: "如果只能留一個專案，你留哪個？",
  },
  {
    id: "fried",
    name: "Jason Fried",
    focus: "小而穩的公司",
    lens: "Calm company、不盲目擴張、小團隊、獲利優先、拒絕無謂的忙碌",
    asks: "這會讓你的公司更平靜，還是更混亂？",
  },
  {
    id: "pg",
    name: "Paul Graham",
    focus: "創業 & 產品",
    lens: "做出真的有人要的東西、先做沒辦法規模化的事、跟用戶直接對話",
    asks: "現在有誰真的想要這個？你跟他們聊過嗎？",
  },
  {
    id: "sutherland",
    name: "Rory Sutherland",
    focus: "行為心理 & 反直覺",
    lens: "人不理性、感知價值比真實價值重要、小改變大效果、試試看「不合邏輯」的點子",
    asks: "如果反過來做，會不會更有效？",
  },
  {
    id: "kelly",
    name: "Kevin Kelly",
    focus: "長期 & 鐵粉",
    lens: "1,000 True Fans、長期眼光、科技趨勢、直接跟粉絲連結",
    asks: "誰會是你的 1,000 個鐵粉？",
  },
  {
    id: "codie",
    name: "Codie Sanchez",
    focus: "小生意 & 現金流",
    lens: "無聊但穩定的生意、recurring revenue、能不靠你運作、收購 vs 自己做",
    asks: "現金流在哪？每月 recurring 多少？",
  },
  {
    id: "kahneman",
    name: "Daniel Kahneman",
    focus: "決策偏誤",
    lens: "快思慢想、過度自信、規劃謬誤、先看 base rate、事前驗屍",
    asks: "類似的事，通常要花多久、成功率多少？",
  },
  {
    id: "dankoe",
    name: "Dan Koe",
    focus: "一人公司 & 個人品牌",
    lens: "用內容建立受眾、把自己的知識包成數位產品、一個人 + AI 工具跑整間公司",
    asks: "這件事能不能變成你自己的內容或產品，讓客人主動來找你？",
  },
];
