# Japan HSP Points Calculator

Free calculator for Japan's Highly Skilled Professional points (高度人材ポイント制, 高度専門職1号イ・ロ・ハ): item-by-item breakdown, age-banded salary rules, the ¥3M salary floor, the permanent-residence fast track (70 → 3 years, 80 → 1 year), HSP (ii), J-Skip (特別高度人材) and bonus points still available.

Live: https://japan-hsp-points.vercel.app

- API: `GET /api/check?category=specialized&age=31&education=master&experienceYears=4&annualSalary=7500000&japanese=n2&qualifications=1` (keyless, CORS open), `/api/rules`, `/openapi.json`, `/llms.txt`
- MCP: `japan_hsp_points_check` on https://free-agent-tools.vercel.app/mcp

Sources: 出入国管理及び難民認定法別表第一の二の表の高度専門職の項の下欄の基準を定める省令 (平成26年法務省令第37号, e-Gov) art. 1–2, ISA points table and evaluation page, 特別加算告示 (revised 2026-03-31), J-Skip ordinance (令和5年法務省令第25号), PR guideline. Rules as of 2026-10-30. A revision within FY2026 has been reported (Nikkei, 2026-08-14) but not published.

**Disclaimer:** educational, not immigration or legal advice, not affiliated with the Immigration Services Agency of Japan or the Ministry of Justice. ISA decides; every point needs documents.
