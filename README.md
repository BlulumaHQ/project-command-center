# Project Command Center

Build "Project Command Center" (UI language: Traditional Chinese, zh-Hant, with English technical terms) — a private internal dashboard for one user (Sony, web/brand designer with ADHD) to see every active project, what's done, what's next, deadlines, and who he's waiting on. Goal: after losing focus he opens it and instantly knows where to resume.

IMPORTANT CONSTRAINTS
- Do NOT enable Lovable Cloud / any database yet. Put all data in a typed data layer: `src/data/types.ts` + `src/data/seed.ts`, accessed only through `src/data/store.ts` (functions like getProjects(), getProject(id), toggleTask(projectId, taskId)). Persist task check state in localStorage for now. We will swap the store to his existing Supabase project later, so keep the store as the single access point.
- Images go in /public/images/ referenced with absolute paths (e.g. /images/bluluma-logo.svg). Never use the asset picker or .asset.json files.
- Add <meta name="robots" content="noindex, nofollow"> (private tool).
- No emoji anywhere. Icons: lucide-react only.

HEADER (every page)
- Left: Bluluma Design logo: <img src="/images/bluluma-logo.svg" alt="Bluluma Design" class="h-7 w-auto">. If the image fails to load, fall back to the wordmark text "BLULUMA DESIGN" (Inter 700, letter-spacing 0.12em, 14px). Create a placeholder file at /public/images/bluluma-logo.svg containing that wordmark as SVG text so it renders now; I'll replace the file with the real logo.
- Next to logo, a thin divider and "Project Command Center".
- Right: search input (filters projects by name/brand/next step) and a "+ 新專案" button (opens a simple dialog; can be non-functional for now).

DESIGN
- Fonts: Inter + Noto Sans TC (Google Fonts). Ground #F6F5F2, cards #FFFFFF with 1px border #E4E2DC, radius 16–18px, ink #16181D, muted text #5B6170, accent blue #2453D6.
- Status chips: 進行中 (bg #E8EEFC, text #1D44B8, bar #2453D6), 等待中 (bg #F1EFEA, text #5B5346, bar #8A8273), 有時限 (bg #FCEDE3, text #9A3A0B, bar #C2410C), 快完成 (bg #E5F3EC, text #1C6B45, bar #1F8A57).
- Calm, high contrast, generous spacing, no gradients. Fully responsive (stacks on phone).

PAGE 1: Overview "/"
1. Title "專案總控台" + subtitle "最後同步：{lastSynced}".
2. 4 stat tiles: 進行中專案 (count), 有時限 (count of status deadline, orange), 等別人回覆 (count of waiting items), 快完成 ≥ 90% (green).
3. Row: big dark card (bg #16181D, white text) "從這裡繼續 · Resume" showing the resume project, its current "now" task as a large heading, a note, and button "打開專案 →" linking to that project. Beside it: card "有時限，要注意" listing deadlines (orange dot = hot, grey = soft; title, detail, right-aligned when).
4. Card "解鎖鏈 · Business 註冊下來之後": horizontal stepper of chain steps (done = green badge "已送出", now = blue outlined box + badge "下一步", locked = dashed border + badge "鎖住"); each shows title and what it unlocks.
5. Two columns: left "所有專案" with segmented tabs 全部 / 客戶 / 自己產品 / 系統 / 自動化 and a responsive grid of project cards (brand label, name, status chip, progress bar + %, grey box "下一步" with next step text, footer "{open} 項待辦 · 更新 {updated}"). Card click → /project/:id. Right column "等別人 · Waiting on": avatar initials, who · project, what.
Project % = computed from tasks done/total when a project has tasks, otherwise the seed pct.

PAGE 2: Project detail "/project/:id"
- "← 所有專案" back link.
- Header card: brand label, status chip, name, description; right: SVG progress ring with %, "{done} / {total} 完成", "第 {n} 階段 / {total} · {phase}", last updated.
- Phase stepper (done = green check circle, now = blue highlighted, locked = grey number).
- Left column: dark "現在做這一件 · Now" card; then task groups 接下來 / 之後 / 已完成, each a checklist (real checkboxes, ≥44px rows, done items struck through, optional small note). Toggling updates % live and persists.
- Right column: "Claude 交接備忘" (handoff note), "已經決定的事" (green check list), "帳號 & 連結" (key/value rows), "還沒決定" (beige card).
- Projects without detailed tasks show the header, next step and a friendly empty state "還沒有詳細 checklist".

SEED DATA (src/data/seed.ts)
lastSynced: "11/15 22:30"; resumeProjectId: "toyscope"; secondaryNext: "SwiftSite mockup".
Projects (id, name, brand, category client|product|system, status progress|waiting|deadline|almost, pct, next, open, updated):
- toyscope, ToyScope, 自己產品 · App, product, progress, 35, 設計 toyscope.app landing page（Claude Design）, 7, 11/15
- swiftsite, SwiftSite, 自己產品 · 加拿大 $99, product, progress, 15, Claude Design 做行銷網站 mockup（hero 已定）, 6, 11/15
- tsai-seo, Tsai Orthodontics SEO, 客戶 · BluLuma, client, deadline, 15, 拿到 GA4 權限 → 做中文獨立 URL（$300）, 8, 11/13
- accuqi, AccuQi Wellness, 客戶 · BluLuma, client, progress, 55, 窗貼 W1–W6 / D1（Option 2）定稿, 5, 11/13
- joyce-wu, Joyce Wu Dental · Kerrisdale, 客戶 · BluLuma, client, waiting, 50, 等診所預約流程；Logo 方案 2 / 3 待回覆, 4, 11/13
- sbs, SBS Toy Shop, 客戶 · 朋友, client, waiting, 45, 等 Yu-Wei 決定定價規則與庫存上限, 6, 11/14
- wild-west-wags, Wild West Wags, 客戶 · Sonykun, client, deadline, 90, 收 hosting $165；Resend 到位後接表單, 2, 11/13
- ttop, TTOP Chicken, 客戶 · Sonykun, client, almost, 90, 確認 contact form 503 已修好, 1, 11/13
- mh-group, MH Group, 客戶 · BluLuma, client, almost, 90, 客戶 Resend 帳號到位 → 接上表單, 1, 11/13
- kchen, KChen Construction, 客戶 · 朋友, client, progress, 75, 確認 domain 轉到 Namecheap；app 報價, 3, 11/13
- n8n, n8n 自動化中心, 系統 · Railway, system, progress, 30, 其他品牌表單也接到 Leads 分頁, 9, 11/14
- noindex, Staging noindex 清理, 系統 · 所有客戶站, system, progress, 55, 剩 50+ 個 repo，用 GitHub 批次改, 1, 11/13
- bluluma-studio, BluLuma Studio, 系統 · White-label chat, system, progress, 10, 用 SBS 做第一個 demo, 5, 11/14
- own-seo, 自己網站 SEO, 自己 · 3 個品牌, product, waiting, 5, 等 Bluluma Design 名稱核准 → 申訴 GBP, 6, 11/13

ToyScope detail:
- description: 拍照辨識玩具、估價，加簡單收藏和 For sale 市集。目標是比 ToyWorth 更好用。iPhone 主畫面 web app，跑在 Netlify。
- phases: 規劃 (功能、命名、方案, done), App 設計 (Landing + 主要畫面, now), Backend (Supabase + API), Beta 測試 (100–200 種子用戶), 上架 (App Store / Google Play)
- now: 設計 toyscope.app 行銷 landing page — note: 先在 Claude Design 做，確認後才 build。根網域 toyscope.app = landing page；app.toyscope.app = App 本體。
- tasks next: 設計 toyscope.app landing page (note 現在這一件); Scan 頁：一打開就是全螢幕相機，側邊 icon 選相簿; 首頁：全部 For sale 列表 + 搜尋、篩選、排序、grid / list; Supabase backend 建置（Bluluma org）(note Founding Collector 方案已核准); 申請 LLM API，跑 30 隻玩具準確度測試 (note 要先搞懂 API 設定)
- tasks later: 三套主題：亮色 / 深色 / Retro; 用收藏家社團拉 100–200 位種子用戶; 訂閱收費上線（$39.99 / 年）; 上架 App Store / Google Play; Trending 區（付費置頂之後再說）
- tasks done (checked): 核心功能定案：掃描估價 + 簡單收藏; 命名 ToyScope; 買 domain toyscope.app（Cloudflare）; Founding Collector 方案：前 300 人 Pro 免費 6 個月; 建 ToyScope 專用 Resend 帳號; 決定做 iPhone 主畫面 web app（Netlify）
- handoff: 上次把 App 砍回簡單核心：掃描估價 + 收藏 + For sale。不做 IG 式發文、不做站內訊息（只有留言 + email relay 聯絡鈕）。Scan 頁一打開就是全螢幕相機。
- decisions: 一張照片 = 一隻玩具; For sale 表單預設手動，「AI 填寫」是選項; 免費用戶可逛市集、聯絡賣家；掃描與賣東西要付費; 物件預設 Private，只有「For sale」標籤; UI 不用 emoji、不要幼稚標籤
- links: App = app.toyscope.app; Landing = toyscope.app; Domain / DNS = Cloudflare; Hosting = Netlify; Database = Supabase · Bluluma org; Email = Resend · sony+toyscope@bluluma.com
- undecided: 早期免費用戶在收費開始後怎麼處理；Trending 付費置頂要不要做。

Deadlines: [Wild West Wags hosting $165 | 年費還沒收到，Stripe 訂閱已設好 | 已到期 | hot], [Tsai Ortho SEO 第 1 個月報告 | 3 個月方案 11/13 開始 | 約 12/13 | hot], [KChen domain 轉移 | 60 天轉移鎖，確認是否已完成 | 追蹤中 | soft], [Stripe 續費自動化 | Hosting renewal 自動收款 | 2027 農曆新年前 | soft]

Unlock chain: [BC Name Request「Bluluma Design」| 已送出，等核准 | done], [註冊 Sole Proprietorship（$40）| 名稱核准後就做 | now], [申訴 BluLuma Google Business Profile | 解鎖：自己網站 SEO、Review 自動請求測試 | locked], [GST 註冊 | 解鎖：正式開發票、報稅 | locked], [記帳自動化 | 解鎖：收據 / 發票自動存檔 | locked]

Waiting on: [Y | Yu-Wei | SBS Toy Shop | 定價規則（×1.35 或跟 Prex Hobby）、庫存上限、Shopify 店資料], [A | Andrew Tsai | Tsai Ortho | 建立 GA4，把你加成 editor], [K | Kelsey | Wild West Wags | 付 hosting；建 Resend 帳號並邀請你], [J | James / Alen | MH Group | 建 Resend 帳號並邀請你], [JW | Joyce Wu 診所 | Kerrisdale | 預約流程結構；Logo 方案回覆], [Jo | Joanne | AccuQi | 預約系統決定（Jane app 或自建），看 POS], [KC | Kevin Chen | KChen | 準備 app 需求清單（打卡、派工、排程）]

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22855c56-4b87-4ba3-b68d-446e0e3494f4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
