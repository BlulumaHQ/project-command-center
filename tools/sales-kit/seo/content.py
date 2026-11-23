# -*- coding: utf-8 -*-
"""Local SEO Program content: brands x languages.
Change a price or a line here, run build.py, and all 4 versions update."""

BRANDS = {
    "sonykun": dict(
        org="Sonykun Design", file="Sonykun Design - Local SEO Program",
        logo_white="sonykun-white.png", logo_color="sonykun-slate.png",
        c1="#46638a", c2="#3b7de0", c3="#bfdafb", ink="#3e4f66", dark="#3a5274",
        cover_bg="linear-gradient(160deg,#4a6890 0%,#3f5a7e 55%,#5b7fae 100%)",
        glow="rgba(120,170,235,.55)", currency="CAD",
        email="sony@sonykundesign.com", contact2="604-262-1168 · sonykundesign.com",
        person="Sony Lin", role={"en": "Creative Director & Digital Strategist", "zh": "創意總監 · 數位策略"},
        plan="standard", lang2="bilingual",
        kw={"en": ["custom cakes vancouver", "birthday cake near me", "bakery richmond"],
            "zh": ["溫哥華 訂製蛋糕", "custom cakes vancouver", "bakery richmond"]},
        name_ex={"en": "“your business name”, “[your name] bakery”", "zh": "「你的店名」、「[你的名字] 烘焙」"},
        svc_ex={"en": "“custom cakes vancouver”, “bakery near me”, “plumber richmond”",
                "zh": "「溫哥華 訂製蛋糕」、「附近的烘焙店」、「列治文 水電師傅」"},
    ),
    "bluluma": dict(
        org="Bluluma Design", file="Bluluma Design - Local SEO Program (Premium)",
        logo_white="bluluma-white.png", logo_color="bluluma-color.png",
        c1="#2f3340", c2="#5988DA", c3="#a9c4f2", ink="#2f3340", dark="#23262f",
        cover_bg="linear-gradient(160deg,#2f3340 0%,#262932 60%,#33405c 100%)",
        glow="rgba(89,136,218,.55)", currency="CAD",
        email="sony@bluluma.com", contact2="bluluma.com",
        person="Sony Lin", role={"en": "Creative Director & Digital Strategist", "zh": "創意總監 · 數位策略"},
        plan="premium", lang2="bilingual",
        kw={"en": ["invisalign vancouver", "dentist near me", "braces for teens"],
            "zh": ["溫哥華 隱適美", "dentist near me", "braces for teens"]},
        name_ex={"en": "“your clinic name”, “dr. [your name]”", "zh": "「診所名稱」、「[你的名字] 醫師」"},
        svc_ex={"en": "“invisalign vancouver”, “dentist near me”, “realtor richmond”",
                "zh": "「溫哥華 隱適美」、「附近的牙醫」、「列治文 地產經紀」"},
    ),
    "swiftlift": dict(
        org="SwiftLift", file="SwiftLift - Local SEO Program",
        logo_white="swiftlift-white.png", logo_color="swiftlift-navy.png",
        c1="#141d45", c2="#4f7cff", c3="#a8bcff", ink="#141d45", dark="#0f1636",
        cover_bg="linear-gradient(160deg,#151f4a 0%,#101838 70%,#1b2660 100%)",
        glow="rgba(108,76,240,.45)", currency="USD", stripe="#6c4cf0",
        email="support@swiftlift.app", contact2="swiftlift.app",
        person="Sony Lin", role={"en": "Lead Designer, SwiftLift", "zh": "SwiftLift 首席設計師"},
        plan="swiftlift", lang2="second",
        kw={"en": ["plumber near me", "water heater repair", "emergency plumber"],
            "zh": ["plumber near me", "water heater repair", "emergency plumber"]},
        name_ex={"en": "“your business name”, “[your name] plumbing”", "zh": "「你的店名」、「[你的名字] Plumbing」"},
        svc_ex={"en": "“plumber near me”, “water heater repair [city]”, “dog walker [city]”",
                "zh": "「plumber near me」、「water heater repair [城市]」、「dog walker [城市]」"},
    ),
}

# ---------------------------------------------------------------- shared text
T = {
"en": dict(
    title="Local SEO Program",
    cover_h=("Get found by the", "people <em>already</em>", "<em>searching</em> for you."),
    cover_p_bi="Local SEO Program — a clear plan to grow your visibility on Google Search and Google Maps, in English and one additional language.",
    cover_p_second="Local SEO Program — a clear plan to grow your visibility on Google Search and Google Maps, in English and a second language.",
    prepared="PREPARED FOR", website="WEBSITE", date="DATE",
    s1="01 — THE OPPORTUNITY", s1h="Two kinds of people<br>search for your business.",
    s1p="Most local businesses are easy to find by name, and almost invisible for the services they actually sell. That second group is where new customers come from.",
    name_t="NAME SEARCHES", name_h="People who already know you.", name_b="Referrals, repeat customers, word of mouth. Usually already strong — you rank at the top.",
    svc_t="SERVICE SEARCHES", svc_h="People choosing who to call.", svc_b="They don’t know you yet. Google often shows your site for these — but too far down the page to get the click.",
    why="WHY {org}",
    why1_bi=("Bilingual included", "We optimize your site in English plus one additional language at no extra cost — reaching customers your competitors miss."),
    why1_second=("Second language included", "We optimize your site in English plus one more language (Spanish is popular) at no extra cost."),
    why2=("Reports you’ll actually read", "No 40-page exports. One short monthly report: what changed, what we did, what’s next."),
    why3=("We fix the site ourselves", "We’re web designers, not just consultants. Changes get made on your website — not left on a to-do list."),
    goal="<b>Our goal:</b> move you up for the service searches that bring new customers — on Google Search and Google Maps — and show you the numbers every month.",
    s2="02 — THE PROGRAM AT A GLANCE",
    google_h="Google moves in weeks, not days.",
    google_p="Google typically takes 4–8 weeks to reflect website changes. Expect the first real movement in your second or third monthly report — and compounding results after that. Every report compares against your baseline, so progress is always measurable.",
    focus="WHERE WE FOCUS",
    f1=("Google Search", "Rank higher for the services you want more of."),
    f2=("Google Maps", "Show up in the local map pack, with fresh photos and reviews."),
    f3_bi=("Bilingual SEO", "English plus one more language of your choice."),
    f3_second=("Second language", "English plus one more language of your choice."),
    f4=("Real leads", "Track calls and form submissions, not just traffic."),
    s3="03 — WHAT WE DO IN EACH PHASE", s3h="The work, step by step.",
    receive="You receive:", keep="You keep:",
    s4="04 — ACCOUNT ACCESS", s4h="What we need from you<br>to get started.",
    s4p="You add us as a user on each account below — using <b>{email}</b>. It takes a few minutes, and we’ll walk you through it.",
    th=("ACCOUNT", "WHAT WE USE IT FOR", "HOW TO GIVE ACCESS", "LEVEL"),
    acc=[
        ("Google Business Profile", "Your Google Maps listing", "Services, hours, photos, reviews and Maps performance", "Business Profile → Settings → People and access → Add", "Manager"),
        ("Google Search Console", "Search performance", "Rankings, search terms, indexing and sitemap", "Settings → Users and permissions → Add user", "Full"),
        ("Google Analytics 4", "Website behaviour", "Visits, phone taps, form submissions", "Admin → Property access management → Add. No account yet? We’ll create one for you.", "Editor"),
        ("Website / CMS", "Your website editor", "On-page changes, structured data, new FAQ content", "Admin or collaborator login. Not needed if we built your site.", "Admin"),
        ("Domain / DNS", "Only if needed", "Verifying Google tools, fixing redirects", "Usually handled together on a short call", "If needed"),
    ],
    nopw=("You never share passwords.", "You add us as a user, and you can remove access at any time. You stay the owner of every account."),
    call=("One 15-minute setup call.", "Some Google accounts ask for a two-factor code. We book one short call to finish everything together."),
    kick="ALSO HELPFUL AT KICKOFF",
    kick_items=["Recent photos: exterior, signage, team, your work", "Current business hours, including holiday hours",
                "The 3–5 services you want more customers for", "Any keywords your customers often mention",
                "Ask new customers: “How did you hear about us?”", "Service areas or neighbourhoods you want to win"],
    s5="05 — YOUR MONTHLY REPORT", s5h="Clear numbers.<br>Plain English.",
    rp=(("PDF by email", "Same date every month"), ("~5 pages", "Read it in five minutes"), ("vs. baseline", "Every number compared to day one")),
    inside="WHAT’S INSIDE",
    inside_items=[("Summary", "the three things that matter this month"), ("Scorecard", "clicks, Google appearances, click-through rate, average position"),
        ("Keyword tracker", "your target searches, now vs. before, plus new keywords added this month"),
        ("New vs. existing customers", "name searches and service searches tracked separately"),
        ("Website actions", "visits, phone taps and form submissions"), ("Google Maps", "profile views, calls, direction requests, new reviews"),
        ("Work completed", "every change we made this month"), ("Next 30 days", "the plan, plus anything we need from you")],
    sample=("MONTHLY SEO REPORT", "SAMPLE", "Service searches are up — and Maps calls followed.", "CLICKS", "APPEARANCES", "PHONE TAPS", "FORM LEADS",
            "▲ 57% vs baseline", "▲ 76%", "▲ 12 vs last month", "▲ 5 vs last month", "SEARCH TERM", "BEFORE", "NOW", "Illustrative data"),
    s6="06 — INVESTMENT", s6h="Your investment.",
    s6p_bi="Simple, flat pricing. Bilingual SEO included — English plus one additional language. All prices in {cur}.",
    s6p_second="Simple, flat pricing. Second-language SEO included. All prices in {cur}.",
    addl="<b>Additional languages</b>&nbsp;&nbsp;Need a third language or more? Custom quote based on your pages and keywords.",
    how="HOW TO START",
    footer_tag="Local SEO Program",
),
"zh": dict(
    title="在地 SEO 方案",
    cover_h=("讓正在搜尋的客人", "<em>第一眼</em>就", "<em>找到你</em>。"),
    cover_p_bi="在地 SEO 方案：一份清楚的計畫，提升你在 Google 搜尋和 Google 地圖上的曝光，英文加一種語言一起做。",
    cover_p_second="在地 SEO 方案：一份清楚的計畫，提升你在 Google 搜尋和 Google 地圖上的曝光，英文加第二種語言一起做。",
    prepared="客戶", website="網站", date="日期",
    s1="01 — 機會在哪裡", s1h="搜尋你的人，<br>分成兩種。",
    s1p="大部分在地商家，用店名很好找；但用「服務」搜尋時，幾乎找不到。新客人，就是從第二種搜尋來的。",
    name_t="店名搜尋", name_h="已經認識你的人。", name_b="轉介、老客人、口碑。這一塊通常已經很強，你排在第一位。",
    svc_t="服務搜尋", svc_h="正在決定要找誰的人。", svc_b="他們還不認識你。Google 常常有列出你的網站，但排得太後面，沒人點。",
    why="為什麼選 {org}",
    why1_bi=("雙語一起做", "英文加一種語言一起優化，不另外收費，接觸到競爭對手接觸不到的客人。"),
    why1_second=("第二語言一起做", "英文加一種語言（常見是西班牙文）一起優化，不另外收費。"),
    why2=("看得懂的報告", "不是 40 頁的匯出檔。每月一份簡短報告：什麼變了、我們做了什麼、下一步是什麼。"),
    why3=("網站我們自己改", "我們是網頁設計師，不只是顧問。該改的地方直接改在你的網站上，不會只丟給你一張待辦清單。"),
    goal="<b>我們的目標：</b>讓你在「服務搜尋」的排名往上爬，不論在 Google 搜尋或 Google 地圖，每個月都用數字讓你看到進度。",
    s2="02 — 方案總覽",
    google_h="Google 的變化，以「週」計算。",
    google_p="Google 通常要 4–8 週才會反映網站的改動。第一個明顯的變化，通常出現在第二或第三份月報，之後效果會一直累積。每份報告都跟起點比較，進度看得到。",
    focus="我們專注的地方",
    f1=("Google 搜尋", "你想多接的服務，排名往上爬。"),
    f2=("Google 地圖", "出現在地圖的前三名，照片和評論保持更新。"),
    f3_bi=("雙語 SEO", "英文加一種你指定的語言。"),
    f3_second=("第二語言", "英文加一種你指定的語言。"),
    f4=("真正的客人", "追蹤電話和表單，不只看流量。"),
    s3="03 — 每個階段做什麼", s3h="一步一步，做什麼都清楚。",
    receive="你會拿到：", keep="你保有：",
    s4="04 — 帳號權限", s4h="開始之前，<br>需要你幫忙的事。",
    s4p="請在下面每個帳號，把 <b>{email}</b> 加為使用者。幾分鐘就好，我們會一步一步帶你做。",
    th=("帳號", "用來做什麼", "怎麼加權限", "權限"),
    acc=[
        ("Google 商家檔案", "你的 Google 地圖資料", "服務、營業時間、照片、評論和地圖成效", "商家檔案 → 設定 → 使用者和存取權 → 新增", "管理員"),
        ("Google Search Console", "搜尋成效", "排名、搜尋字、收錄和 sitemap", "設定 → 使用者和權限 → 新增使用者", "完整"),
        ("Google Analytics 4", "網站行為", "瀏覽、點電話、表單送出", "管理 → 資源存取權管理 → 新增。還沒有帳號？我們幫你開。", "編輯者"),
        ("網站後台", "你的網站編輯器", "頁面修改、結構化資料、新的 FAQ 內容", "管理員或協作者帳號。網站是我們做的就不用。", "管理員"),
        ("網域 / DNS", "需要時才用", "驗證 Google 工具、修正轉址", "通常在短短的通話中一起處理", "需要時"),
    ],
    nopw=("你不用給我們密碼。", "你把我們加為使用者，隨時可以移除。每個帳號的擁有者都還是你。"),
    call=("一通 15 分鐘的設定電話。", "有些 Google 帳號會要求雙重驗證碼，我們約一次短短的通話，一起設定完成。"),
    kick="開始時也很有幫助的資料",
    kick_items=["最近的照片：外觀、招牌、團隊、作品", "目前的營業時間，包括假日時間", "你最想多接的 3–5 項服務",
                "客人常提到的關鍵字", "問新客人：「你怎麼知道我們的？」", "你想拿下的服務區域或社區"],
    s5="05 — 你的月報", s5h="數字清楚，<br>白話說明。",
    rp=(("Email 寄 PDF", "每月固定日期"), ("約 5 頁", "五分鐘看完"), ("跟起點比較", "每個數字都跟第一天比")),
    inside="報告內容",
    inside_items=[("重點摘要", "這個月最重要的三件事"), ("成績卡", "點擊、出現次數、點擊率、平均排名"),
        ("關鍵字追蹤", "你的目標搜尋字，現在 vs. 之前，加上本月新增的關鍵字"),
        ("新客 vs. 老客", "店名搜尋和服務搜尋分開追蹤"), ("網站行動", "瀏覽、點電話、表單送出"),
        ("Google 地圖", "檔案瀏覽、電話、路線、新評論"), ("本月完成", "這個月做的每一項修改"), ("下個 30 天", "計畫，以及需要你提供的東西")],
    sample=("SEO 月報", "範例", "服務搜尋上升，地圖來電也跟著增加。", "點擊", "出現次數", "點電話", "表單",
            "▲ 比起點多 57%", "▲ 76%", "▲ 比上月多 12", "▲ 比上月多 5", "搜尋字", "之前", "現在", "示意數據"),
    s6="06 — 費用", s6h="費用說明。",
    s6p_bi="價格簡單固定。包含雙語 SEO：英文加一種語言。所有價格為 {cur}。",
    s6p_second="價格簡單固定。包含第二語言 SEO。所有價格為 {cur}。",
    addl="<b>更多語言</b>&nbsp;&nbsp;需要第三種以上的語言？依頁數和關鍵字另外報價。",
    how="開始的步驟",
    footer_tag="在地 SEO 方案",
),
}

# ------------------------------------------------------------- plan variants
def plan(brand, lang):
    p = BRANDS[brand]["plan"]
    zh = lang == "zh"
    bi = BRANDS[brand]["lang2"] == "bilingual"
    lang_kw = ("兩種語言的關鍵字研究，每個關鍵字對應一個頁面" if zh else "Keyword research in both languages — each matched to a page")
    second_pages = ("第二語言頁面，針對該語言的搜尋優化" if zh else "Second-language pages optimized for searches in that language")
    ai = ("AI 搜尋準備：把你的商家資料設定好給 ChatGPT 和 AI 搜尋，加拿大一開放就認領商家檔案" if zh and BRANDS[brand]["currency"] == "CAD"
          else "AI 搜尋準備：把你的商家資料設定好給 ChatGPT 和 AI 搜尋" if zh
          else "AI Search Readiness: your business info set up for ChatGPT and AI search — profile claimed as soon as it opens in Canada" if BRANDS[brand]["currency"] == "CAD"
          else "AI Search Readiness: your business info set up for ChatGPT and AI search")
    audit_items = ([ "技術健檢：收錄、sitemap、速度、手機版、壞連結", "Google Search Console 和 Google 商家檔案檢查",
                     "競爭對手分析：現在誰排前面、為什麼", "Google Analytics 4 設定，追蹤點電話和表單", lang_kw, "修正 Google 搜尋結果裡的店名和描述"] if zh else
                   ["Technical health check: indexing, sitemap, speed, mobile, broken links", "Google Search Console & Google Business Profile review",
                    "Competitor check: who ranks today, and why", "Google Analytics 4 setup, tracking phone taps and form submissions", lang_kw,
                    "Business name and description fixes in Google results"])
    opt_items = ([ "重寫重點服務頁的標題、描述和小標", "加強服務頁，加入大家會搜尋的 FAQ（例如「費用」）", "結構化資料，讓 Google 看懂你的名稱、地點和服務",
                   "Google 商家檔案：服務、類別、營業時間、照片", "增加評論：放在櫃台的 QR code 卡片", "統一各個在地目錄的名稱、地址、電話",
                   second_pages, "提交重新收錄，讓 Google 更快看到改動", ai] if zh else
                 ["Page titles, descriptions and headings rewritten for priority services", "Service pages strengthened, incl. FAQs people search (e.g. “cost”)",
                  "Structured data so Google understands your name, location and services", "Google Business Profile: services, categories, hours, photos",
                  "Review growth: a QR-code card for your front desk", "Consistent name, address and phone across local listings",
                  second_pages, "Recrawl requests so Google picks up changes faster", ai])
    if p == "premium":
        opt_items += (["每月 Google 商家檔案貼文", "競爭對手追蹤，對手有動作我們就知道"] if zh else
                      ["Monthly Google Business Profile posts", "Competitor watch — we see it when they make a move"])
    if p == "standard":
        phases = [
            ("01", "稽核與設定" if zh else "Audit & Setup", "第 1–2 週" if zh else "Week 1–2", audit_items,
             ("你會拿到：", "基準報告：你的「改善前」快照和目標關鍵字清單。") if zh else ("You receive:", "the Baseline Report — your “before” snapshot and target keyword list.")),
            ("02", "優化" if zh else "Optimization", "第 1–3 個月" if zh else "Months 1–3", opt_items,
             ("你會拿到：", "每月進度報告，所有修改都直接改在你的網站上。") if zh else ("You receive:", "a monthly progress report, plus all changes made directly on your website.")),
            ("03", "持續維護" if zh else "Ongoing Care", "第 4 個月起 · 按月續約" if zh else "Month 4 onward · month-to-month",
             (["每月排名和流量監控", "每月新增 1 個目標關鍵字", "Google 商家檔案保持最新、正確", "月報，加上 Google 提出的技術問題修正"] if zh else
              ["Monthly ranking and traffic monitoring", "1 new target keyword added every month", "Google Business Profile kept fresh and accurate", "Monthly report + technical fixes as Google flags them"]),
             ("你保有：", "已經拿到的排名，持續保護、每月繼續成長。") if zh else ("You keep:", "the rankings you’ve earned — protected, and still growing every month.")),
        ]
        glance = [("第 1–2 週" if zh else "WEEK 1–2", "稽核與設定" if zh else "Audit & Setup", "階段 1" if zh else "Phase 1", False),
                  ("第 1–3 個月" if zh else "MONTHS 1–3", "優化" if zh else "Optimization", "階段 2" if zh else "Phase 2", False),
                  ("第 4 個月起" if zh else "MONTH 4 ONWARD", "持續維護" if zh else "Ongoing Care", "階段 3 · 選購" if zh else "Phase 3 · optional", True)]
        h = "三個階段，<br>一個清楚的方向。" if zh else "Three phases.<br>One clear direction."
        hp = "先量出你現在的位置，用三個月改善，之後持續成長。" if zh else "We start by measuring where you stand, spend three months improving it, then keep it growing."
        kw_n = 10
    elif p == "premium":
        phases = [
            ("01", "稽核與設定" if zh else "Audit & Setup", "第 1–2 週" if zh else "Week 1–2", audit_items,
             ("你會拿到：", "基準報告：你的「改善前」快照和 20 個目標關鍵字。") if zh else ("You receive:", "the Baseline Report — your “before” snapshot and 20 target keywords.")),
            ("02", "成長期" if zh else "Growth Phase", "第 1–3 個月" if zh else "Months 1–3", opt_items,
             ("你會拿到：", "每月進度報告，所有修改都直接改在你的網站上。") if zh else ("You receive:", "a monthly progress report, plus all changes made directly on your website.")),
            ("03", "持續成長" if zh else "Ongoing Growth", "第 4–12 個月 · 已包含" if zh else "Months 4–12 · included",
             (["每月新增 2 個目標關鍵字", "每月 Google 商家檔案貼文", "競爭對手追蹤", "每季一次策略通話", "每月排名、流量監控和技術修正", "月報，含「競爭對手動態」"] if zh else
              ["2 new target keywords added every month", "Monthly Google Business Profile posts", "Competitor watch", "Quarterly strategy call",
               "Monthly ranking, traffic monitoring and technical fixes", "Monthly report, incl. competitor watch"]),
             ("你保有：", "一整年持續累積的排名和客人。") if zh else ("You keep:", "a full year of rankings and leads that keep compounding.")),
        ]
        glance = [("第 1–2 週" if zh else "WEEK 1–2", "稽核與設定" if zh else "Audit & Setup", "階段 1" if zh else "Phase 1", False),
                  ("第 1–3 個月" if zh else "MONTHS 1–3", "成長期" if zh else "Growth Phase", "階段 2" if zh else "Phase 2", False),
                  ("第 4–12 個月" if zh else "MONTHS 4–12", "持續成長" if zh else "Ongoing Growth", "階段 3 · 已包含" if zh else "Phase 3 · included", True)]
        h = "十二個月，<br>一路往上。" if zh else "Twelve months.<br>One steady climb."
        hp = "先量出你現在的位置，前三個月全力衝刺，接下來九個月持續加關鍵字、守住排名。" if zh else "We measure where you stand, push hard for three months, then keep adding keywords and protecting your rankings for nine more."
        kw_n = 20
    else:  # swiftlift
        phases = [
            ("01", "稽核與設定" if zh else "Audit & Setup", "第 1–2 週" if zh else "Week 1–2", audit_items,
             ("你會拿到：", "基準報告：你的「改善前」快照和目標關鍵字清單。") if zh else ("You receive:", "the Baseline Report — your “before” snapshot and target keyword list.")),
            ("02", "優化" if zh else "Optimization", "第 1–3 個月" if zh else "Months 1–3", opt_items,
             ("你會拿到：", "每月進度報告、所有修改直接改在網站上，第 3 個月有成果檢討和下一步建議。") if zh else
             ("You receive:", "a monthly progress report, all changes made on your website, and a results review in month 3.")),
        ]
        glance = [("第 1–2 週" if zh else "WEEK 1–2", "稽核與設定" if zh else "Audit & Setup", "階段 1" if zh else "Phase 1", False),
                  ("第 1–3 個月" if zh else "MONTHS 1–3", "優化" if zh else "Optimization", "階段 2" if zh else "Phase 2", True)]
        h = "三個月，<br>一個清楚的方向。" if zh else "Three months.<br>One clear direction."
        hp = "先量出你現在的位置，接下來三個月把它往上推。" if zh else "We start by measuring where you stand, then spend three months moving you up."
        kw_n = 10
    timeline = [("第 1 週" if zh else "WEEK 1", "帳號連接，開始追蹤" if zh else "Accounts connected, tracking live"),
                ("第 2 週" if zh else "WEEK 2", "基準報告：你的「改善前」快照" if zh else "Baseline Report — your “before” snapshot"),
                ("每月" if zh else "MONTHLY", "優化工作 + 進度報告" if zh else "Optimization work + progress report"),
                ("第 3 個月" if zh else "MONTH 3", "成果檢討和下一步計畫" if zh else "Results review and next-step plan")]
    return dict(phases=phases, glance=glance, glance_h=h, glance_p=hp, kw_n=kw_n, timeline=timeline)


def pricing(brand, lang):
    zh = lang == "zh"
    p = BRANDS[brand]["plan"]
    cur = BRANDS[brand]["currency"]
    bi = BRANDS[brand]["lang2"] == "bilingual"
    lang_line = ("包含雙語 SEO" if bi else "包含第二語言 SEO") if zh else ("Bilingual SEO included" if bi else "Second-language SEO included")
    ai = "AI 搜尋準備（ChatGPT 商家檔案）" if zh else "AI Search Readiness (ChatGPT business profile)"
    if p == "standard":
        return dict(
            name="Standard 方案" if zh else "Standard Plan", sub="給準備好被 Google 找到的在地商家" if zh else "For local businesses ready to be found on Google",
            big="$900", big_sub="3 個月方案 · 一次付清" if zh else "3-month program · paid upfront",
            rows=[("稽核與設定 + 3 個月優化" if zh else "Audit & Setup + 3 months of optimization", "一次付清 $900" if zh else "$900 upfront"),
                  ("持續維護 · 第 4 個月起（選購）" if zh else "Ongoing Care · month 4 onward (optional)", "$99/月" if zh else "$99/mo")],
            pay=("<b>付款：</b>方案開始時付 $900。持續維護是選購，按月續約，隨時可以取消。" if zh else
                 "<b>Payment:</b> $900 at the start of the program. Ongoing Care is optional and month-to-month — cancel anytime."),
            incl=(["稽核與設定 + 基準報告", "3 個月實際動手優化", "追蹤 10 個目標關鍵字", "白話月報", ai, "持續維護：每月新增 1 個目標關鍵字", lang_line] if zh else
                  ["Audit & Setup + Baseline Report", "3 months of hands-on optimization", "10 target keywords tracked", "Monthly plain-English report", ai,
                   "Ongoing Care: 1 new target keyword added every month", lang_line]),
            steps=(["回信確認這份方案", "第一筆付款：$900", "15 分鐘帳號設定電話", "7 天內交基準報告"] if zh else
                   ["Approve this proposal by reply email", "First payment — $900", "15-minute account setup call", "Baseline Report within 7 days"]),
            addl=True)
    if p == "premium":
        return dict(
            name="Premium 方案" if zh else "Premium Plan", sub="12 個月合約 · 給高價值服務的診所和專業人士" if zh else "12-month program · for clinics and high-value services",
            big="$1,888", big_sub="第 1–3 個月 · 簽約時付清" if zh else "Months 1–3 · paid at signing",
            rows=[("成長期 · 第 1–3 個月（含設定）" if zh else "Growth Phase · months 1–3 (incl. setup)", "一次付清 $1,888" if zh else "$1,888 upfront"),
                  ("持續成長 · 第 4–12 個月" if zh else "Ongoing Growth · months 4–12", "$288/月 × 9" if zh else "$288/mo × 9"),
                  ("12 個月總計" if zh else "12-month total", "$4,480")],
            pay=("<b>付款：</b>簽約時付 $1,888。第 4–12 個月每月自動從信用卡扣 $288。想一次付清？整年 <b>$4,188</b>（省 $292）。" if zh else
                 "<b>Payment:</b> $1,888 at signing. Months 4–12 are charged automatically at $288/month to the card on file. Prefer one payment? Pay the full year upfront for <b>$4,188</b> (save $292)."),
            incl=(["稽核與設定 + 基準報告", "追蹤 20 個目標關鍵字，第 4 個月起每月加 2 個", "每月 Google 商家檔案貼文", "競爭對手追蹤", "每季一次策略通話", ai, lang_line] if zh else
                  ["Audit & Setup + Baseline Report", "20 target keywords, +2 every month from month 4", "Monthly Google Business Profile posts", "Competitor watch",
                   "Quarterly strategy call", ai, lang_line]),
            steps=(["回信確認這份方案", "簽 12 個月合約，付 $1,888", "15 分鐘帳號設定電話", "7 天內交基準報告"] if zh else
                   ["Approve this proposal by reply email", "Sign the 12-month agreement — $1,888", "15-minute account setup call", "Baseline Report within 7 days"]),
            addl=True)
    return dict(
        name="在地 SEO 方案" if zh else "Local SEO Program", sub="給剛換新網站、準備接更多客人的在地商家" if zh else "For local businesses ready to be found on Google",
        big="$499", big_sub="3 個月方案 · 一次付清" if zh else "3-month program · paid upfront",
        rows=[("稽核與設定 + 3 個月優化" if zh else "Audit & Setup + 3 months of optimization", "一次付清 $499" if zh else "$499 upfront")],
        pay=("<b>付款：</b>方案開始時付 $499，沒有月費。" if zh else "<b>Payment:</b> $499 at the start of the program. No monthly fees."),
        incl=(["稽核與設定 + 基準報告", "3 個月實際動手優化", "追蹤 10 個目標關鍵字", "白話月報", "Google 商家檔案優化", ai, lang_line] if zh else
              ["Audit & Setup + Baseline Report", "3 months of hands-on optimization", "10 target keywords tracked", "Monthly plain-English report",
               "Google Business Profile optimization", ai, lang_line]),
        steps=(["回覆我們的 email 確認", "第一筆付款：$499", "15 分鐘帳號設定電話", "7 天內交基準報告"] if zh else
               ["Reply to our email to approve", "First payment — $499", "15-minute account setup call", "Baseline Report within 7 days"]),
        addl=True)
