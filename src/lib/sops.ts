export type SopStep = {
  title: string;
  detail: string;
  /** Paste-ready text shown with a Copy button. */
  copy?: string;
};

export type Sop = {
  id: string;
  name: string;
  desc: string;
  where: string;
  steps: SopStep[];
  troubleshooting?: { problem: string; fix: string }[];
};

// Add a new SOP here — it shows up on /tools under 操作手冊 automatically.
export const SOPS: Sop[] = [
  {
    id: "logo-concept",
    name: "Logo Concept Workflow",
    desc: "Codex 批次畫 logo concept → 挑圖 → SVG → 提案",
    where: "ChatGPT 桌面版 → Work → 專案「Bluluma Logos」（C:\\Bluluma\\Logos）",
    steps: [
      {
        title: "1. 開新客戶",
        detail:
          "打開 ChatGPT 桌面版 → 上方切到 Work → 左邊點專案「Bluluma Logos」→ New chat。確認輸入框下方是「On your computer」，再貼上這段（把 <> 換成客戶資料）：",
        copy:
          "新客戶：<品牌名>，<行業>，<城市>。一句話介紹：<介紹>。目標客群：<客群>。喜歡 <風格>，不要 <風格>。顏色：<顏色>。要不要中文字：<是/否，要的話寫哪幾個字>。照 AGENTS.md 規則做，先建好 brief.md，列出 5 個方向給我確認，先不要畫。",
      },
      {
        title: "2. 確認方向",
        detail: "看 Codex 列的 5 個方向。要改就直接講（例如「C 換成印章感」），沒問題就貼：",
        copy: "照做：5 個方向、每個 4 張，存到 concepts\\round-1\\，做完品質檢查，再給我 contact-sheet.png。",
      },
      {
        title: "3. 等它跑完",
        detail:
          "Codex 會一次畫完 20 張，自動刪掉並重畫不合格的圖。中間跳出 Approve 就按。跑完後打開 contact-sheet.png 看整批。",
      },
      {
        title: "4. 挑圖或重畫",
        detail: "挑好就回覆代號，會複製到 picks\\ 並轉成 SVG：",
        copy: "選 A2, B4, D1。複製到 picks\\，用 vtracer 轉成 SVG。",
      },
      {
        title: "4b. 整批不滿意 → 重畫一輪",
        detail: "改方向或要求，存進 round-2：",
        copy: "B、D 方向重畫一輪，每個 4 張，更簡單、線條更少，存到 concepts\\round-2\\，再給我新的 contact-sheet.png。",
      },
      {
        title: "5. 整理向量檔",
        detail:
          "自動轉出的 SVG 只能當草稿。用 Illustrator / Affinity 整理線條、換成真字型，存成 final\\ 裡的正式 SVG。",
      },
      {
        title: "6. 做提案",
        detail: "把 final\\ 的 SVG 拖進 claude.ai 對話框，貼上：",
        copy: "用 logo presentation builder 做提案，客戶是 <品牌名>。",
      },
    ],
    troubleshooting: [
      {
        problem: "送出按鈕是灰的",
        fix: "輸入框下方雲朵圖示 → 改成「On your computer」；再確認右下角有選模型。",
      },
      {
        problem: "找不到專案",
        fix: "左邊 Projects → Show more → Bluluma Logos。",
      },
      {
        problem: "Codex 說額度用完",
        fix: "畫圖很耗額度（Plus 方案）。等額度重置，或一次少畫幾張（每個方向 2 張）。",
      },
    ],
  },
];
