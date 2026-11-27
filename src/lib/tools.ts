export type Tool = { name: string; desc: string; url: string; group: string };

// Add a new tool here — it shows up on /tools automatically.
export const TOOLS: Tool[] = [
  { name: "BluLuma Studio", desc: "用聊天改網站、自動部署", url: "https://studio.bluluma.com/", group: "Bluluma" },
  { name: "Bluluma Hub", desc: "多客戶 CMS：作品集、Blog、媒體庫", url: "https://hub.bluluma.com", group: "Bluluma" },
  { name: "Realtor Brand Hub", desc: "Realtor CMS：物件、個人檔案、網域", url: "https://realtor.bluluma.com", group: "Bluluma" },
  { name: "Housvis", desc: "Realtor AI 助理原型", url: "https://agent-assistant.designpreview.dev", group: "Housvis" },
  { name: "ToyScope Admin", desc: "會員、檢舉、意見回饋", url: "https://admin.toyscope.app", group: "ToyScope" },
];
