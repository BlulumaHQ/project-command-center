/**
 * Style Library data — the same definitions the design-taste skill uses.
 * Web styles are also used for print; print adds a few print-only styles.
 */

export type Family = "clean" | "luxury" | "natural" | "bold" | "tech" | "playful";

export const FAMILIES: { id: Family; label: string }[] = [
  { id: "clean", label: "Clean / Grid" },
  { id: "luxury", label: "Luxury / Calm" },
  { id: "natural", label: "Natural / Soft" },
  { id: "bold", label: "Bold / Loud" },
  { id: "tech", label: "Tech" },
  { id: "playful", label: "Playful" },
];

export type Style = {
  id: string;
  no: string;
  name: string;
  family: Family;
  medium: "web" | "print";
  tagline: string;
  bestFor: string[];
  avoidFor: string[];
  fonts: string;
  typeScale: string;
  layout: string[];
  decoration: string;
  palette: string[];
  pairs: string;
};

export const WEB_STYLES: Style[] = [
  {
    id: "swiss", no: "01", name: "Swiss / International", family: "clean", medium: "web",
    tagline: "嚴格 grid、無襯線、大數字、大量留白",
    bestFor: ["Architecture", "Engineering", "Consulting"],
    avoidFor: ["Kids", "Pet care"],
    fonts: "Inter / Helvetica 類無襯線，粗細對比拉大",
    typeScale: "Display 72–120 · H2 40 · Body 16 · 數字 48+",
    layout: ["12 欄嚴格 grid，元素對齊線", "大數字當視覺（年份、案件數）", "section 用編號 01 / 02 / 03"],
    decoration: "一個紅色或單色方塊點綴；粗橫線分隔；不用圓角",
    palette: ["#F4F4F1", "#111111", "#E30613", "#BDBDB8"],
    pairs: "Swiss × Japandi · Swiss × Big Type",
  },
  {
    id: "editorial", no: "02", name: "Editorial", family: "luxury", medium: "web",
    tagline: "雜誌感、大襯線標題、分欄、圖文交錯",
    bestFor: ["Fine dining", "Law", "Luxury real estate"],
    avoidFor: ["Urgent services", "Tech"],
    fonts: "Playfair Display / DM Serif 標題 + Inter 內文",
    typeScale: "Display 64–96 italic · H2 36 · Body 16–17",
    layout: ["左右分欄，圖文交錯", "首字放大 drop cap", "期數 / 日期小標像雜誌"],
    decoration: "細線、圖片說明小字、引言大引號",
    palette: ["#F3EEE6", "#241F1A", "#B9A58C", "#7A2E1F"],
    pairs: "Editorial × Japandi · Editorial × Swiss",
  },
  {
    id: "quiet-luxury", no: "03", name: "Quiet Luxury", family: "luxury", medium: "web",
    tagline: "細襯線、寬字距、極度留白、慢動畫",
    bestFor: ["Luxury realtor", "Med spa", "Premium dental"],
    avoidFor: ["Discount retail", "Kids"],
    fonts: "Cormorant Garamond Light + Inter 小字加寬字距",
    typeScale: "Display 48–72 細 · Label 11 tracking 0.3em · Body 15",
    layout: ["置中、極度留白", "全版大圖慢慢淡入", "一頁只講一件事"],
    decoration: "1px 細線、logo 單色浮水印",
    palette: ["#EDE9E3", "#3A3631", "#B8A88A", "#FFFFFF"],
    pairs: "Quiet Luxury × Editorial",
  },
  {
    id: "japandi", no: "04", name: "Japandi", family: "luxury", medium: "web",
    tagline: "暖中性色、細線、安靜的不對稱",
    bestFor: ["Interior design", "Architecture", "Tea", "Spa", "Furniture"],
    avoidFor: ["Promo-heavy retail", "Kids", "Urgent services"],
    fonts: "Fraunces Light 標題 + Inter 內文",
    typeScale: "Display 56–72 · H2 32 · Body 15–16 · 標籤小字 tracking 0.2em",
    layout: ["5/7 不對稱分欄，文字靠底對齊", "圖片錯位 offset，旁邊一個細線圓", "1px 分隔線把 section 切成格"],
    decoration: "細線圓、木紋 / 紙紋質感；logo 元素做成淡 pattern 放在 1–2 個 section",
    palette: ["#E9E4DA", "#C8BBA6", "#4F5A44", "#2F2C27"],
    pairs: "Swiss × Japandi · Editorial × Japandi",
  },
  {
    id: "organic", no: "05", name: "Organic / Soft Natural", family: "natural", medium: "web",
    tagline: "有機形狀、大地色、手繪線條",
    bestFor: ["TCM / Acupuncture", "Yoga", "Wellness", "Counselling"],
    avoidFor: ["Construction", "Finance"],
    fonts: "Fraunces 標題 + Inter / Nunito 內文",
    typeScale: "Display 48–64 · H2 32 · Body 16",
    layout: ["有機 blob 形狀當背景", "圓角大、pill 按鈕", "圖片放在不規則遮罩裡"],
    decoration: "葉子、手繪線條、品牌 icon 做成淡 pattern",
    palette: ["#F1EDE4", "#CFD8C4", "#E7C9B0", "#33402F"],
    pairs: "Organic × Editorial · Organic × Playful",
  },
  {
    id: "playful", no: "06", name: "Playful / Mascot", family: "playful", medium: "web",
    tagline: "插畫、圓體字、貼紙感、腳印 pattern",
    bestFor: ["Pet care", "Kids", "Desserts", "Dog training"],
    avoidFor: ["Law", "Luxury"],
    fonts: "Nunito Black / 圓體標題 + Nunito 內文",
    typeScale: "Display 48–72 粗 · H2 32 · Body 16",
    layout: ["吉祥物當主視覺", "section 之間波浪 / 曲線分隔", "貼紙感小標籤"],
    decoration: "腳印、骨頭、星星 pattern 散在背景；logo 角色到處出現",
    palette: ["#FFE9A8", "#2B2A6B", "#FF8A5B", "#FFFFFF"],
    pairs: "Playful × Neo-Brutalism",
  },
  {
    id: "neo-brutalism", no: "07", name: "Neo-Brutalism", family: "bold", medium: "web",
    tagline: "粗黑框、硬陰影、飽和色、很直接",
    bestFor: ["Startups", "Toy shop", "Youth brands"],
    avoidFor: ["Medical", "Luxury"],
    fonts: "Archivo Black / Space Grotesk 標題 + Inter 內文",
    typeScale: "Display 56–96 · H2 36 · Body 16",
    layout: ["3px 黑框卡片 + 硬陰影", "元素故意歪一點", "按鈕像實體按鈕"],
    decoration: "貼紙、旋轉標籤（NEW!）、飽和色塊",
    palette: ["#FFF4D6", "#000000", "#A3E4FF", "#FF5C8A"],
    pairs: "Neo-Brutalism × Playful · Neo-Brutalism × Big Type",
  },
  {
    id: "bento", no: "08", name: "Bento Grid", family: "tech", medium: "web",
    tagline: "Apple 式大小不一的卡片拼貼",
    bestFor: ["SaaS", "Apps", "Tech services"],
    avoidFor: ["Fine dining", "Heritage brands"],
    fonts: "Inter / SF 類無襯線",
    typeScale: "Display 48–64 · 卡片標題 20–28 · Body 15",
    layout: ["大小不一的圓角卡片拼成一格", "每張卡一個重點", "深淺卡片交錯"],
    decoration: "icon、截圖、小數字；幾乎沒有裝飾",
    palette: ["#F5F5F7", "#1D1D1F", "#DCE7FF", "#FFFFFF"],
    pairs: "Bento × Dark Tech",
  },
  {
    id: "dark-tech", no: "09", name: "Dark Tech", family: "tech", medium: "web",
    tagline: "深色底、漸層光、細線、mono 字",
    bestFor: ["AI", "Automation", "Dev tools"],
    avoidFor: ["Kids", "Wellness"],
    fonts: "Inter 標題 + JetBrains Mono 標籤 / code",
    typeScale: "Display 56–80 · H2 36 · Body 16 · Mono 12",
    layout: ["深色底 + 一個漸層光源", "細線 grid 背景", "code / terminal 片段當視覺"],
    decoration: "光暈、細線框、點陣 grid",
    palette: ["#0B0D12", "#1E2A55", "#9DB2FF", "#F2F4FA"],
    pairs: "Dark Tech × Bento · Dark Tech × Swiss",
  },
  {
    id: "big-type", no: "10", name: "Big Type / Kinetic", family: "bold", medium: "web",
    tagline: "巨大文字當主視覺、跑馬燈、捲動動畫",
    bestFor: ["Agency", "Designer portfolio", "Events"],
    avoidFor: ["Medical", "Elderly audience"],
    fonts: "Archivo Black / Unbounded 超大標題 + Inter 內文",
    typeScale: "Display 150–240 · H2 48 · Body 16",
    layout: ["字大到超出畫面被裁切", "跑馬燈橫條", "捲動時文字移動 / 變大"],
    decoration: "跑馬燈、黑白反轉色塊",
    palette: ["#F2F0EB", "#111111", "#FF4F1F", "#FFFFFF"],
    pairs: "Big Type × Swiss · Big Type × Neo-Brutalism",
  },
  {
    id: "industrial", no: "11", name: "Industrial Bold", family: "bold", medium: "web",
    tagline: "窄體全大寫、黃黑配色、斜切、數字",
    bestFor: ["Construction", "Car wash", "Auto repair"],
    avoidFor: ["Wellness", "Luxury"],
    fonts: "Bebas Neue / Oswald 標題 + Inter 內文",
    typeScale: "Display 64–110 全大寫 · H2 40 · Body 16",
    layout: ["斜切 section 邊緣", "服務用 01 / 02 編號", "大張施工照片 + 深色疊層"],
    decoration: "黃黑警示條紋、鋼板質感",
    palette: ["#1C1C1C", "#FFC400", "#FFFFFF", "#6B6B6B"],
    pairs: "Industrial × Swiss",
  },
  {
    id: "retro", no: "12", name: "Retro / Vintage", family: "playful", medium: "web",
    tagline: "徽章、紙張質感、復古襯線",
    bestFor: ["Coffee", "Barber", "Tattoo", "Brewery"],
    avoidFor: ["Tech", "Medical"],
    fonts: "Alfa Slab One / 復古襯線 + Inter 內文",
    typeScale: "Display 48–80 · H2 32 · Body 16",
    layout: ["圓形徽章當主視覺", "紙張底色、邊框", "像菜單 / 海報的排法"],
    decoration: "星星、EST. 年份、紙紋、顆粒",
    palette: ["#EFE3CC", "#6B2E1F", "#8A3A12", "#D9832B"],
    pairs: "Retro × Editorial",
  },
  {
    id: "clinical", no: "13", name: "Clinical Trust", family: "clean", medium: "web",
    tagline: "藍白、清楚 icon、CTA 明確（現在的預設 A）",
    bestFor: ["Dental", "Clinics", "Insurance"],
    avoidFor: ["Fashion", "Creative studios"],
    fonts: "Inter / Plus Jakarta Sans",
    typeScale: "Display 44–56 · H2 32 · Body 16",
    layout: ["左文右圖 hero + 明顯 CTA", "信任標記（直接收保險、晚上有看診）", "服務卡片 3–4 欄"],
    decoration: "icon、柔和插圖；裝飾很少",
    palette: ["#FFFFFF", "#0F2A4A", "#1A5FD0", "#EEF3FA"],
    pairs: "Clinical × Quiet Luxury（高端診所）",
  },
  {
    id: "maximalist", no: "14", name: "Maximalist", family: "bold", medium: "web",
    tagline: "撞色、拼貼、刻意破格",
    bestFor: ["Fashion", "Music", "Art"],
    avoidFor: ["Medical", "Law", "Finance"],
    fonts: "DM Serif Display + Archivo Black 混搭",
    typeScale: "Display 96+ · 混用多種大小",
    layout: ["元素重疊、旋轉", "拼貼照片", "不對齊是故意的"],
    decoration: "幾何色塊、貼紙、照片剪貼",
    palette: ["#FF3EA5", "#00E0C6", "#FFE600", "#1A1A18"],
    pairs: "Maximalist × Big Type",
  },
];

export const PRINT_ONLY: Style[] = [
  {
    id: "risograph", no: "P1", name: "Risograph", family: "bold", medium: "print",
    tagline: "套色印刷顆粒感、錯位、兩三種螢光色",
    bestFor: ["Events", "Cafés", "Zines"],
    avoidFor: ["Medical", "Corporate"],
    fonts: "粗無襯線 / 復古字",
    typeScale: "標題超大、內文少",
    layout: ["兩色疊印，故意對不準", "大色塊 + 顆粒網點"],
    decoration: "網點、顆粒、錯位",
    palette: ["#F4EFE6", "#FF48B0", "#0078BF", "#FFE800"],
    pairs: "Risograph × Retro",
  },
  {
    id: "bauhaus", no: "P2", name: "Bauhaus", family: "clean", medium: "print",
    tagline: "幾何、原色、圓方三角",
    bestFor: ["Architecture", "Art exhibitions", "Design events"],
    avoidFor: ["Wellness", "Luxury"],
    fonts: "幾何無襯線（Futura 類）",
    typeScale: "標題粗大、對角排列",
    layout: ["圓、方、三角構成畫面", "斜向排字"],
    decoration: "紅黃藍原色幾何",
    palette: ["#F2EBDD", "#D92B2B", "#F2B705", "#1F4E99"],
    pairs: "Bauhaus × Swiss",
  },
  {
    id: "swiss-poster", no: "P3", name: "Swiss Poster", family: "clean", medium: "print",
    tagline: "大字 + 嚴格 grid 的海報",
    bestFor: ["Exhibitions", "Concerts", "Architecture"],
    avoidFor: ["Kids"],
    fonts: "Helvetica 類粗體",
    typeScale: "標題佔半張海報",
    layout: ["文字對齊 grid 線", "大量負空間"],
    decoration: "單一色塊、粗線",
    palette: ["#FFFFFF", "#111111", "#E30613"],
    pairs: "Swiss Poster × Bauhaus",
  },
  {
    id: "duotone", no: "P4", name: "Duotone", family: "bold", medium: "print",
    tagline: "照片轉成雙色調",
    bestFor: ["Fitness", "Music", "Events"],
    avoidFor: ["Food（看起來不好吃）"],
    fonts: "粗無襯線",
    typeScale: "標題壓在照片上",
    layout: ["全版雙色照片 + 大標題"],
    decoration: "兩個品牌色的照片",
    palette: ["#2A1B6B", "#FF6B4A"],
    pairs: "Duotone × Big Type",
  },
  {
    id: "collage", no: "P5", name: "Collage", family: "playful", medium: "print",
    tagline: "剪貼照片、撕紙、膠帶",
    bestFor: ["Fashion", "Youth events", "Art"],
    avoidFor: ["Medical", "Law"],
    fonts: "混搭襯線 + 打字機字",
    typeScale: "大小混用",
    layout: ["照片剪成不規則形狀疊在一起", "膠帶、撕邊"],
    decoration: "膠帶、撕紙、手寫箭頭",
    palette: ["#EDE6D6", "#1A1A18", "#E04A2F", "#F4C542"],
    pairs: "Collage × Maximalist",
  },
];

export const PRINT_STYLES: Style[] = [...WEB_STYLES, ...PRINT_ONLY];

export const ALL_STYLES: Style[] = PRINT_STYLES;

export function getStyle(id: string) {
  return ALL_STYLES.find((s) => s.id === id);
}

/** Industry finder: keywords (EN + 中文) → A safe / B conversion / C wildcard. */
export const INDUSTRY_PICKS: { label: string; keys: string[]; a: string; b: string; c: string }[] = [
  { label: "Pet care", keys: ["pet", "dog", "cat", "寵物", "狗", "貓", "groom", "training"], a: "playful", b: "organic", c: "neo-brutalism" },
  { label: "Dental", keys: ["dental", "dentist", "ortho", "牙", "矯正"], a: "clinical", b: "quiet-luxury", c: "swiss" },
  { label: "Clinic / Medical", keys: ["clinic", "medical", "doctor", "physio", "診所", "醫"], a: "clinical", b: "organic", c: "swiss" },
  { label: "TCM / Acupuncture", keys: ["tcm", "acupuncture", "中醫", "針灸", "wellness", "massage", "按摩"], a: "organic", b: "japandi", c: "editorial" },
  { label: "Med spa / Beauty", keys: ["spa", "beauty", "salon", "醫美", "美容", "nail", "hair"], a: "quiet-luxury", b: "editorial", c: "maximalist" },
  { label: "Real estate", keys: ["realtor", "real estate", "房地產", "地產", "property", "home"], a: "quiet-luxury", b: "editorial", c: "swiss" },
  { label: "Architecture", keys: ["architect", "建築", "engineering", "工程"], a: "swiss", b: "japandi", c: "big-type" },
  { label: "Interior design", keys: ["interior", "室內", "renovation", "裝潢", "furniture", "家具"], a: "japandi", b: "editorial", c: "swiss" },
  { label: "Construction", keys: ["construction", "contractor", "營造", "建設", "roof", "plumb"], a: "industrial", b: "swiss", c: "big-type" },
  { label: "Auto / Car wash", keys: ["car", "auto", "wash", "洗車", "汽車", "repair"], a: "industrial", b: "clinical", c: "neo-brutalism" },
  { label: "Restaurant", keys: ["restaurant", "餐廳", "food", "chicken", "菜", "dining"], a: "editorial", b: "retro", c: "maximalist" },
  { label: "Coffee / Café", keys: ["coffee", "café", "cafe", "咖啡", "bakery", "麵包", "tea", "茶"], a: "retro", b: "japandi", c: "editorial" },
  { label: "Tattoo / Barber", keys: ["tattoo", "刺青", "barber", "理髮"], a: "retro", b: "big-type", c: "maximalist" },
  { label: "Fitness", keys: ["fitness", "gym", "健身", "yoga", "瑜伽", "pilates"], a: "industrial", b: "organic", c: "big-type" },
  { label: "Kids / Education", keys: ["kid", "child", "兒童", "school", "tutor", "補習", "education"], a: "playful", b: "clinical", c: "neo-brutalism" },
  { label: "Law / Accounting", keys: ["law", "lawyer", "律師", "accounting", "會計", "finance", "財務"], a: "editorial", b: "clinical", c: "swiss" },
  { label: "Tech / SaaS", keys: ["saas", "app", "software", "科技", "tech", "startup"], a: "bento", b: "dark-tech", c: "neo-brutalism" },
  { label: "AI / Automation", keys: ["ai", "automation", "自動化", "agent"], a: "dark-tech", b: "bento", c: "big-type" },
  { label: "Toys / Collectibles", keys: ["toy", "玩具", "gundam", "鋼彈", "collect"], a: "neo-brutalism", b: "bento", c: "maximalist" },
  { label: "Travel", keys: ["travel", "旅遊", "tour", "hotel", "飯店"], a: "editorial", b: "quiet-luxury", c: "maximalist" },
  { label: "Agency / Designer", keys: ["agency", "designer", "設計", "studio", "portfolio", "photograph", "攝影"], a: "big-type", b: "swiss", c: "maximalist" },
  { label: "Fashion", keys: ["fashion", "時尚", "clothing", "服飾", "apparel"], a: "editorial", b: "quiet-luxury", c: "maximalist" },
  { label: "Supplements / Manufacturing", keys: ["supplement", "保健", "manufactur", "製造", "factory"], a: "clinical", b: "swiss", c: "dark-tech" },
];

export function findIndustry(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return undefined;
  return INDUSTRY_PICKS.find(
    (p) => p.label.toLowerCase().includes(s) || p.keys.some((k) => s.includes(k) || k.includes(s)),
  );
}

/** Logo: axis 1 = structure, axis 2 = technique. */
export const LOGO_TYPES = [
  { id: "wordmark", name: "Wordmark", desc: "純字 · 例：Google" },
  { id: "lettermark", name: "Lettermark / Monogram", desc: "字母組合 · 例：LV、HBO" },
  { id: "pictorial", name: "Pictorial mark", desc: "具象圖形 · 例：Apple" },
  { id: "abstract", name: "Abstract mark", desc: "抽象圖形 · 例：Nike 勾" },
  { id: "mascot", name: "Mascot", desc: "角色 · 寵物、兒童品牌" },
  { id: "emblem", name: "Emblem / Badge", desc: "字包在框裡 · 例：Starbucks" },
  { id: "combination", name: "Combination", desc: "圖形 + 字 · 最常用" },
];

export const LOGO_STYLES = [
  { id: "geometric", name: "Geometric / Grid-built", desc: "圓和直線構成，有建構網格 · Allan Peters" },
  { id: "monoline", name: "Monoline", desc: "單一線寬、線條感" },
  { id: "negative", name: "Negative Space", desc: "用負空間藏第二個圖形 · 例：FedEx" },
  { id: "swiss-min", name: "Swiss Minimal", desc: "極簡，靠字體本身取勝" },
  { id: "badge", name: "Vintage Badge", desc: "復古徽章、星星、弧形字" },
  { id: "script", name: "Hand-lettered / Script", desc: "手寫字、溫度感" },
  { id: "mon", name: "Japanese Mon", desc: "家紋式、圓形對稱" },
  { id: "retro70", name: "Retro 70s", desc: "粗圓襯線、彩虹條紋" },
  { id: "deco", name: "Art Deco", desc: "對稱、金屬線條、高級感" },
  { id: "brutal", name: "Brutalist Type", desc: "粗獷、變形字、很實驗" },
];

export const LOGO_COMBOS = [
  { combo: "Monogram × Geometric", use: "牙醫、建築、顧問" },
  { combo: "Emblem × Vintage Badge", use: "咖啡、啤酒、理髮" },
  { combo: "Mascot × Monoline", use: "寵物、兒童、甜點" },
  { combo: "Wordmark × Swiss Minimal", use: "科技、SaaS、精品" },
];

/** Google Fonts used by the live samples (loaded only on the Style Library page). */
export const SAMPLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,600;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Fraunces:ital,wght@0,300;0,400;0,600;0,900;1,900&family=Nunito:wght@800;900&family=Archivo+Black&family=Bebas+Neue&family=Alfa+Slab+One&family=DM+Serif+Display&family=Dancing+Script:wght@700&family=Special+Elite&display=swap";
