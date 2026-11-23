// Sales Kit PDFs per company — files live in Google Drive
// (搬到 Bluluma → 01 公司 → <公司> → Sales Kit 銷售資料).
// Source for the SEO PDFs: tools/sales-kit/seo (rebuild, then re-upload and update the ids here).

export interface SalesKitDoc {
  title: string;
  updated: string;
  files: { label: string; id: string }[];
}

export interface SalesKit {
  folder: string;
  docs: SalesKitDoc[];
}

export const driveFile = (id: string) => `https://drive.google.com/file/d/${id}/view`;
export const driveFolder = (id: string) => `https://drive.google.com/drive/folders/${id}`;

export const SALES_KIT: Record<string, SalesKit> = {
  bluluma: {
    folder: "1FIE-TU660dgEWsuvCW19iKIeCiiWtJdX",
    docs: [
      {
        title: "Local SEO Program (Premium)",
        updated: "2026-11-23",
        files: [
          { label: "English", id: "1aQQjLdug7mm1Qe3jY2WEi2JcEf_Be1Qq" },
          { label: "中文", id: "1XnXzSgTPHNrd3o6weimI5DT2TWGMznvg" },
          { label: "English 手機", id: "1bEIaAesErFYSRyPj7NTU3_ssU2bgnP7E" },
          { label: "中文 手機", id: "1wWqsnw2Jtvj7sZEfPA2O-aibohki-JwI" },
        ],
      },
    ],
  },
  sonykun: {
    folder: "1_HRruf6VWRNYx3q3RVP4vpO8bRYUCgXM",
    docs: [
      {
        title: "Local SEO Program (Standard)",
        updated: "2026-11-23",
        files: [
          { label: "English", id: "1LiE-gLPyiRrzFg6-y46C2DWFeD-hGuQH" },
          { label: "中文", id: "1VjDtENfHqYcJxovOrcBwxe5Q-Wy3y1Td" },
          { label: "English 手機", id: "1I6aEWEQkKymVD9yraTGTr4Os7OHodG6y" },
          { label: "中文 手機", id: "1YIiU_P2wRRXAWDoc8QRCfwLQhT0UVraS" },
        ],
      },
    ],
  },
  swiftlift: {
    folder: "1P9pWwLM8gEuxZECIhEuR929jnJMEI4pp",
    docs: [
      {
        title: "Local SEO Program",
        updated: "2026-11-23",
        files: [
          { label: "English", id: "1VTiuiFgoKJGECgypcleY52GQ-jaSZL-L" },
          { label: "中文", id: "1ky-R-BtxMiNYXEGCvsr9n_-jes3SXpcu" },
          { label: "English 手機", id: "1wHMRKcQIlArgnO4_EjK4e0vmTtWFbiqh" },
          { label: "中文 手機", id: "1Bf3UZ0A-d7TMKaHRzuj17Q80lXN6_1Hn" },
        ],
      },
    ],
  },
  nightclerk: {
    folder: "1XX71Mvt2jVCeBFsX79JNOqf5fcSf6CEm",
    docs: [
      {
        title: "Shopify Automation Proposal",
        updated: "2026-11-23",
        files: [
          { label: "English", id: "1hD_iiZhC6p0ChPlvBIXjzjBbWnRnBILx" },
          { label: "中文", id: "1q1nrrmDKCk2yOTYb_LK7Juuh9jMcHZRf" },
          { label: "English 手機", id: "1SR8ypMF00k017ONsr58AAm34o22WVeBa" },
          { label: "中文 手機", id: "1RDS5A9BDNdxdX3odbOmz2_86OBXx2Ec1" },
        ],
      },
    ],
  },
};
