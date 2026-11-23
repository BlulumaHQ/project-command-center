# Sales kit PDFs

Source for every company sales PDF. Each document builds 4 versions: English, Chinese, English mobile (9:16), Chinese mobile.

## Local SEO Program (Sonykun Standard, Bluluma Premium, SwiftLift)
- Text and prices: `seo/content.py` (one place for all brands and both languages)
- Build: `cd tools/sales-kit/seo && python3 build.py` (or `python3 build.py sonykun`)
- Output: `tools/sales-kit/out/` (not committed; final PDFs live in Google Drive → 01 公司 → <company> → Sales Kit 銷售資料)
- After re-uploading to Drive, update the file ids in `src/data/sales-kit.ts` so HQ → 價目表 links to the new files.
- Needs: Google Chrome, Inter and Noto Sans CJK TC fonts.

Prices must match the Master Price List sheet and Stripe.
