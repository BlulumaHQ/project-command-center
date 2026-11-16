import type { Project, Seed, Task, TaskGroup } from "./types";

const p = (id: string, name: string, brand: string, category: Project["category"], status: Project["status"], pct: number, next: string, open: number, updated: string): Project =>
  ({ id, name, brand, category, status, pct, next, open, updated });

const t = (group: TaskGroup, items: (string | [string, string])[]): Task[] =>
  items.map((it, i) => {
    const [title, note] = Array.isArray(it) ? it : [it, undefined];
    return { id: `${group}-${i + 1}`, title, note, group, done: group === "done", status: group === "done" ? "done" as const : "todo" as const, dueDate: null, doneAt: null };
  });

const toyscope = p("toyscope", "ToyScope", "自己產品 · App", "product", "progress", 35, "設計 toyscope.app landing page（Claude Design）", 7, "11/15");
toyscope.detail = {
  description: "拍照辨識玩具、估價，加簡單收藏和 For sale 市集。目標是比 ToyWorth 更好用。iPhone 主畫面 web app，跑在 Netlify。",
  phases: [
    { title: "規劃", detail: "功能、命名、方案", state: "done" },
    { title: "App 設計", detail: "Landing + 主要畫面", state: "now" },
    { title: "Backend", detail: "Supabase + API", state: "locked" },
    { title: "Beta 測試", detail: "100–200 種子用戶", state: "locked" },
    { title: "上架", detail: "App Store / Google Play", state: "locked" },
  ],
  now: { title: "設計 toyscope.app 行銷 landing page", note: "先在 Claude Design 做，確認後才 build。根網域 toyscope.app = landing page；app.toyscope.app = App 本體。" },
  tasks: [
    ...t("next", [
      ["設計 toyscope.app landing page", "現在這一件"],
      "Scan 頁：一打開就是全螢幕相機，側邊 icon 選相簿",
      "首頁：全部 For sale 列表 + 搜尋、篩選、排序、grid / list",
      ["Supabase backend 建置（Bluluma org）", "Founding Collector 方案已核准"],
      ["申請 LLM API，跑 30 隻玩具準確度測試", "要先搞懂 API 設定"],
    ]),
    ...t("later", ["三套主題：亮色 / 深色 / Retro", "用收藏家社團拉 100–200 位種子用戶", "訂閱收費上線（$39.99 / 年）", "上架 App Store / Google Play", "Trending 區（付費置頂之後再說）"]),
    ...t("done", ["核心功能定案：掃描估價 + 簡單收藏", "命名 ToyScope", "買 domain toyscope.app（Cloudflare）", "Founding Collector 方案：前 300 人 Pro 免費 6 個月", "建 ToyScope 專用 Resend 帳號", "決定做 iPhone 主畫面 web app（Netlify）"]),
  ],
  handoff: "上次把 App 砍回簡單核心：掃描估價 + 收藏 + For sale。不做 IG 式發文、不做站內訊息（只有留言 + email relay 聯絡鈕）。Scan 頁一打開就是全螢幕相機。",
  decisions: ["一張照片 = 一隻玩具", "For sale 表單預設手動，「AI 填寫」是選項", "免費用戶可逛市集、聯絡賣家；掃描與賣東西要付費", "物件預設 Private，只有「For sale」標籤", "UI 不用 emoji、不要幼稚標籤"],
  links: [
    { label: "App", value: "app.toyscope.app" }, { label: "Landing", value: "toyscope.app" },
    { label: "Domain / DNS", value: "Cloudflare" }, { label: "Hosting", value: "Netlify" },
    { label: "Database", value: "Supabase · Bluluma org" }, { label: "Email", value: "Resend · sony+toyscope@bluluma.com" },
  ],
  undecided: "早期免費用戶在收費開始後怎麼處理；Trending 付費置頂要不要做。",
};

export const seed: Seed = {
  lastSynced: "11/15 22:30",
  resumeProjectId: "toyscope",
  secondaryNext: "SwiftSite mockup",
  projects: [
    toyscope,
    p("swiftsite", "SwiftSite", "自己產品 · 加拿大 $99", "product", "progress", 15, "Claude Design 做行銷網站 mockup（hero 已定）", 6, "11/15"),
    p("tsai-seo", "Tsai Orthodontics SEO", "客戶 · BluLuma", "client", "deadline", 15, "拿到 GA4 權限 → 做中文獨立 URL（$300）", 8, "11/13"),
    p("accuqi", "AccuQi Wellness", "客戶 · BluLuma", "client", "progress", 55, "窗貼 W1–W6 / D1（Option 2）定稿", 5, "11/13"),
    p("joyce-wu", "Joyce Wu Dental · Kerrisdale", "客戶 · BluLuma", "client", "waiting", 50, "等診所預約流程；Logo 方案 2 / 3 待回覆", 4, "11/13"),
    p("sbs", "SBS Toy Shop", "客戶 · 朋友", "client", "waiting", 45, "等 Yu-Wei 決定定價規則與庫存上限", 6, "11/14"),
    p("wild-west-wags", "Wild West Wags", "客戶 · Sonykun", "client", "deadline", 90, "收 hosting $165；Resend 到位後接表單", 2, "11/13"),
    p("ttop", "TTOP Chicken", "客戶 · Sonykun", "client", "almost", 90, "確認 contact form 503 已修好", 1, "11/13"),
    p("mh-group", "MH Group", "客戶 · BluLuma", "client", "almost", 90, "客戶 Resend 帳號到位 → 接上表單", 1, "11/13"),
    p("kchen", "KChen Construction", "客戶 · 朋友", "client", "progress", 75, "確認 domain 轉到 Namecheap；app 報價", 3, "11/13"),
    p("n8n", "n8n 自動化中心", "系統 · Railway", "system", "progress", 30, "其他品牌表單也接到 Leads 分頁", 9, "11/14"),
    p("noindex", "Staging noindex 清理", "系統 · 所有客戶站", "system", "progress", 55, "剩 50+ 個 repo，用 GitHub 批次改", 1, "11/13"),
    p("bluluma-studio", "BluLuma Studio", "系統 · White-label chat", "system", "progress", 10, "用 SBS 做第一個 demo", 5, "11/14"),
    p("own-seo", "自己網站 SEO", "自己 · 3 個品牌", "product", "waiting", 5, "等 Bluluma Design 名稱核准 → 申訴 GBP", 6, "11/13"),
  ],
  deadlines: [
    { title: "Wild West Wags hosting $165", detail: "年費還沒收到，Stripe 訂閱已設好", when: "已到期", level: "hot" },
    { title: "Tsai Ortho SEO 第 1 個月報告", detail: "3 個月方案 11/13 開始", when: "約 12/13", level: "hot" },
    { title: "KChen domain 轉移", detail: "60 天轉移鎖，確認是否已完成", when: "追蹤中", level: "soft" },
    { title: "Stripe 續費自動化", detail: "Hosting renewal 自動收款", when: "2027 農曆新年前", level: "soft" },
  ],
  chain: [
    { title: "BC Name Request「Bluluma Design」", unlocks: "已送出，等核准", state: "done" },
    { title: "註冊 Sole Proprietorship（$40）", unlocks: "名稱核准後就做", state: "now" },
    { title: "申訴 BluLuma Google Business Profile", unlocks: "解鎖：自己網站 SEO、Review 自動請求測試", state: "locked" },
    { title: "GST 註冊", unlocks: "解鎖：正式開發票、報稅", state: "locked" },
    { title: "記帳自動化", unlocks: "解鎖：收據 / 發票自動存檔", state: "locked" },
  ],
  waiting: [
    { initials: "Y", who: "Yu-Wei", project: "SBS Toy Shop", what: "定價規則（×1.35 或跟 Prex Hobby）、庫存上限、Shopify 店資料" },
    { initials: "A", who: "Andrew Tsai", project: "Tsai Ortho", what: "建立 GA4，把你加成 editor" },
    { initials: "K", who: "Kelsey", project: "Wild West Wags", what: "付 hosting；建 Resend 帳號並邀請你" },
    { initials: "J", who: "James / Alen", project: "MH Group", what: "建 Resend 帳號並邀請你" },
    { initials: "JW", who: "Joyce Wu 診所", project: "Kerrisdale", what: "預約流程結構；Logo 方案回覆" },
    { initials: "Jo", who: "Joanne", project: "AccuQi", what: "預約系統決定（Jane app 或自建），看 POS" },
    { initials: "KC", who: "Kevin Chen", project: "KChen", what: "準備 app 需求清單（打卡、派工、排程）" },
  ],
};
