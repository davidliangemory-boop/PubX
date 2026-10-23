window.EXDATA = {
 "meta": {
  "updated": "2026-10-23 11:09",
  "cadence": "周更（周批 W-YYYYWW）",
  "last_window_lte": "2026-08-12",
  "sources": [
   {
    "name": "Federal Register API",
    "url": "https://www.federalregister.gov/api/v1/",
    "note": "BIS/OFAC 规则与实体清单通知，免费无 key"
   },
   {
    "name": "OFAC recent-actions",
    "url": "https://ofac.treasury.gov/recent-actions",
    "note": "执法/清单/通用许可/指南，HTML 列表"
   },
   {
    "name": "BIS news-updates",
    "url": "https://www.bis.gov/news-updates",
    "note": "BIS 执法与规则新闻稿；执法条目的罚款/条款解析自和解命令 PDF"
   },
   {
    "name": "DHS UFLPA Entity List",
    "url": "https://www.dhs.gov/uflpa-entity-list",
    "note": "批次式更新，含生效日期与列入依据小节"
   },
   {
    "name": "CBP UFLPA 统计仪表盘",
    "url": "https://www.cbp.gov/newsroom/stats/trade/uyghur-forced-labor-prevention-act-statistics",
    "note": "JS 渲染的实时仪表盘，静态抓取取不到数字；本页不转录其数字，仅作来源指引"
   }
  ],
  "caliber": "本模块数据与其他分页面互不混用；仅收官方公开文件；要点=external（附来源），合规影响=analysis（写依据）；原文未载显示【未披露】。「执法案例更新」栏的 CBP/UFLPA 执法统计由 CBP 实时仪表盘发布（JS 渲染），本页不抓取其数字、不转录，避免口径失真；UFLPA 清单批次见「清单更新」栏。"
 },
 "batches": [
  {
   "batch_id": "W-202643",
   "kind": "backfill",
   "time": "2026-10-23 02:13",
   "window": {
    "gte": "2026-07-25",
    "lte": "2026-10-23",
    "note": "按来源发布日过滤"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 6,
     "kept": 6,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 29,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 30,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 50,
     "kept": 44,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 4,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 1,
     "failed": 0
    }
   },
   "new_items": 84,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "backfill",
   "time": "2026-10-23 04:05",
   "window": {
    "gte": "2026-07-25",
    "lte": "2026-10-23",
    "note": "按来源发布日过滤"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 6,
     "kept": 6,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 29,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 30,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 50,
     "kept": 44,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 44,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 4,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 3,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 1,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "enrich",
   "time": "2026-10-23 04:39",
   "window": {
    "gte": "",
    "lte": "",
    "note": "BIS 执法和解命令 PDF 补解析（正则修正后重跑 enrich）"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 3,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "enrich",
   "time": "2026-10-23 05:36",
   "window": {
    "gte": "",
    "lte": "",
    "note": "OFAC 清单条目补解析 SDN 增删明细"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 33,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "enrich",
   "time": "2026-10-23 06:06",
   "window": {
    "gte": "",
    "lte": "",
    "note": "OFAC 清单条目：摘要去重 + 涉中条目人名抽取修正"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 15,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "backfill",
   "time": "2026-10-23 07:31",
   "window": {
    "gte": "2026-07-25",
    "lte": "2026-10-23",
    "note": "按来源发布日过滤"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 6,
     "kept": 6,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 29,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 30,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 50,
     "kept": 44,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 44,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 4,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 3,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 1,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "backfill",
   "time": "2026-10-23 08:42",
   "window": {
    "gte": "2026-07-25",
    "lte": "2026-10-23",
    "note": "按来源发布日过滤"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 6,
     "kept": 6,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 29,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 30,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 50,
     "kept": 44,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 44,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 4,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 3,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 1,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "enrich",
   "time": "2026-10-23 08:54",
   "window": {
    "gte": "",
    "lte": "",
    "note": "OFAC 条目重采：SDN changes 段 -to- 前缀剥离 + 修订类标注 + 个人残名修复"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 50,
     "kept": 44,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 44,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "backfill",
   "time": "2026-10-23 10:38",
   "window": {
    "gte": "2026-07-25",
    "lte": "2026-10-23",
    "note": "按来源发布日过滤"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 6,
     "kept": 6,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 29,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 30,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 50,
     "kept": 44,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 44,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 4,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 3,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 1,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "weekly",
   "time": "2026-10-23 11:07",
   "window": {
    "gte": "2026-10-09",
    "lte": "2026-10-09",
    "note": "按来源发布日（美东日期）过滤，与北京时间当日近似对齐"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 10,
     "kept": 2,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 3,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "weekly",
   "time": "2026-10-23 11:07",
   "window": {
    "gte": "2026-09-10",
    "lte": "2026-09-10",
    "note": "按来源发布日（美东日期）过滤，与北京时间当日近似对齐"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 1,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 1,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 30,
     "kept": 1,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 2,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  },
  {
   "batch_id": "W-202643",
   "kind": "weekly",
   "time": "2026-10-23 11:09",
   "window": {
    "gte": "2026-08-12",
    "lte": "2026-08-12",
    "note": "按来源发布日（美东日期）过滤，与北京时间当日近似对齐"
   },
   "stats": {
    "FR-BIS": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-UFLPA": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-OFAC": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-fulltext": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "FR-other": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "OFAC-RA": {
     "scanned": 40,
     "kept": 1,
     "failed": 0
    },
    "OFAC-detail": {
     "scanned": 1,
     "kept": 0,
     "failed": 0
    },
    "BIS-news": {
     "scanned": 50,
     "kept": 0,
     "failed": 0
    },
    "BIS-detail": {
     "scanned": 0,
     "kept": 0,
     "failed": 0
    },
    "DHS-UFLPA": {
     "scanned": 205,
     "kept": 0,
     "failed": 0
    }
   },
   "new_items": 0,
   "total_items": 84
  }
 ],
 "items": [
  {
   "id": "ofac-20261021",
   "column": "lists",
   "action": "revised",
   "date": "2026-10-21",
   "agency": "OFAC",
   "doc_no": "20261021",
   "title": "Iran-related Designations; Belarus and North Korea Designations Removals; Issuance of Iran-related and Russia-related General Licenses and Amended Frequently Asked Questions",
   "parties": [
    "KARNAKIS KOSMAS, Ioanis",
    "KARNAKIS KOSMAS, Konstantinos",
    "KARNAKIS KOSMAS, Sofianos",
    "ORTEGA JONES, Pedro",
    "ORTEGA JONES, Roberto",
    "AMIGOZ SINGAPORE PTE. LTD",
    "KARNAKIS AND KARNAKIS",
    "ROXETTE MARITIME SHIPPING AND TRADING S.A",
    "WHALES SHIPPING LINE LLC (Arabic: وايلس شيبينغ لاين ذ م م)",
    "ANEMOS",
    "DESTINY",
    "FLAMINGO 1",
    "GLORIS",
    "HARMONY",
    "PRIDE",
    "PRINCE",
    "WHALES DIAMOND",
    "WHALES PEARL Crew/Supply Vessel United Arab Emirates",
    "MOXING CARTOON",
    "SHANGHAI MOXING CULTURAL MEDIA CO LTD (Chinese Simplified: 上海墨星⽂化传播有限公司)"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「SHANGHAI」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Iran General License GG , \"Authorizing the Wind Down of Transactions Involving Karnakis and Karnakis;\" and Iran General License HH , \"Authorizing Wind Down Activities, Limited Safety and Environmental Transactions, and the Offloading of Cargo Involving Certain Persons or Vessels Blocked on October 21, 2026.\" Additionally, OFAC is issuing Russia-related General License 131K , \"Authorizing Certain Transactions for the Negotiation of and Entry Into Contingent Contracts for the Sale of Lukoil International GmbH and…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261021"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 5 条（individuals have been added to OFAC's SDN List）；新增 4 条（entities have been added to OFAC's SDN List）；新增 9 条（vessels have been added to OFAC's SDN List）；删除 8 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261021"
    },
    {
     "text": "其中地址/注册地涉中国的条目：MOXING CARTOON（删除）、SHANGHAI MOXING CULTURAL MEDIA CO LTD (Chinese Simplified: 上海墨星⽂化传播有限公司)（删除）、LU, Hezheng（删除）、SHANGHAI HONGMAN CARTOON AND ANIMATION DESIGN STUDIO（删除）、SHANGHAI HONGMAN ANIMATION DESIGN STUDIO (Chinese Simplified: 上海弘漫动漫设计工作室)（删除）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261021"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261021",
   "pdf_url": "https://ofac.treasury.gov/media/937276/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 09:43"
   },
   "cn_parties": [
    {
     "name": "MOXING CARTOON",
     "kind": "删除"
    },
    {
     "name": "SHANGHAI MOXING CULTURAL MEDIA CO LTD (Chinese Simplified: 上海墨星⽂化传播有限公司)",
     "kind": "删除"
    },
    {
     "name": "LU, Hezheng",
     "kind": "删除"
    },
    {
     "name": "SHANGHAI HONGMAN CARTOON AND ANIMATION DESIGN STUDIO",
     "kind": "删除"
    },
    {
     "name": "SHANGHAI HONGMAN ANIMATION DESIGN STUDIO (Chinese Simplified: 上海弘漫动漫设计工作室)",
     "kind": "删除"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261019",
   "column": "lists",
   "action": "added",
   "date": "2026-10-19",
   "agency": "OFAC",
   "doc_no": "20261019",
   "title": "Protecting American Intellectual Property Act of 2022 (PAIPA) Designations; Issuance of Associated General Licenses",
   "parties": [
    "BEIJING QIJI CHUANGTAN PHASE I VENTURE CAPITAL CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛一期创业投资中心 有限合伙)",
    "BEIJING QIJI CHUANGTAN PHASE II VENTURE CAPITAL CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛二期创业投资中心 有限合伙)",
    "BEIJING QIJI CHUANGTAN ZHIYUAN ENTERPRISE MANAGEMENT CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛致远企业管理中心 有限合伙)",
    "QIJI CHUANGTAN BEIJING INVESTMENT MANAGEMENT CO LTD (Chinese Simplified: 奇绩创坛 北京 投资管理有限责任公司)",
    "SHANGHAI ZHISUAN TECHNOLOGY CO LTD (Chinese Simplified: 上海至算科技有限公司)"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「BEIJING」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Protecting American Intellectual Property Act of 2022 (PAIPA) General License 1 , \"Transactions Authorized Pursuant to the Cyber-Related Sanctions Regulations;\" and Protecting American Intellectual Property Act of 2022 (PAIPA) General License 2 , \"Authorizing the Wind Down of Transactions Involving Certain Entities Blocked on October 19, 2026.\" OFAC has also made the following changes to its Non-SDN Menu Based Sanctions List (NS-MBS List). NON-SDN Menu-Based SANCTIONS LIST UPDATE The following entities have bee…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261019"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 5 条（entities have been added to OFAC's Non-SDN Menu-Based Sancti）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261019"
    },
    {
     "text": "其中地址/注册地涉中国的条目：BEIJING QIJI CHUANGTAN PHASE I VENTURE CAPITAL CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛一期创业投资中心 有限合伙)（新增）、BEIJING QIJI CHUANGTAN PHASE II VENTURE CAPITAL CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛二期创业投资中心 有限合伙)（新增）、BEIJING QIJI CHUANGTAN ZHIYUAN ENTERPRISE MANAGEMENT CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛致远企业管理中心 有限合伙)（新增）、QIJI CHUANGTAN BEIJING INVESTMENT MANAGEMENT CO LTD (Chinese Simplified: 奇绩创坛 北京 投资管理有限责任公司)（新增）、SHANGHAI ZHISUAN TECHNOLOGY CO LTD (Chinese Simplified: 上海至算科技有限公司)（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261019"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261019",
   "pdf_url": "https://ofac.treasury.gov/media/937261/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 09:43"
   },
   "cn_parties": [
    {
     "name": "BEIJING QIJI CHUANGTAN PHASE I VENTURE CAPITAL CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛一期创业投资中心 有限合伙)",
     "kind": "新增"
    },
    {
     "name": "BEIJING QIJI CHUANGTAN PHASE II VENTURE CAPITAL CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛二期创业投资中心 有限合伙)",
     "kind": "新增"
    },
    {
     "name": "BEIJING QIJI CHUANGTAN ZHIYUAN ENTERPRISE MANAGEMENT CENTER LIMITED PARTNERSHIP (Chinese Simplified: 北京奇绩创坛致远企业管理中心 有限合伙)",
     "kind": "新增"
    },
    {
     "name": "QIJI CHUANGTAN BEIJING INVESTMENT MANAGEMENT CO LTD (Chinese Simplified: 奇绩创坛 北京 投资管理有限责任公司)",
     "kind": "新增"
    },
    {
     "name": "SHANGHAI ZHISUAN TECHNOLOGY CO LTD (Chinese Simplified: 上海至算科技有限公司)",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261016",
   "column": "rules",
   "action": "",
   "date": "2026-10-16",
   "agency": "OFAC",
   "doc_no": "20261016",
   "title": "Issuance of Amended Venezuela-related General License and Frequently Asked Question",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela-related General License 60A , \"Authorizing Transactions Related to Earthquake Relief Efforts in Venezuela.\" OFAC is also issuing one amended Frequently Asked Question, FAQ 1263 .",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261016"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261016",
   "pdf_url": "https://ofac.treasury.gov/media/937251/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 09:44"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261015",
   "column": "lists",
   "action": "added",
   "date": "2026-10-15",
   "agency": "OFAC",
   "doc_no": "20261015",
   "title": "Iran-related Designations; Cuba Designation; Issuance of New and Amended General Licenses and Frequently Asked Questions",
   "parties": [
    "ABDOLALIPUR, Azadeh (Arabic: آزاده عبدالعلی پور)",
    "ALLAHYAR, Farzad (Arabic: فرزاد الهیار)",
    "BAVI, Sadegh (Arabic: صادق باوی)",
    "BORJI, Nazanin (Arabic: نازنین برجی)",
    "HOSSEINI PARSA, Seyyed Abbas (Arabic: سید عباس حسینی پارسا)",
    "JALALI, Abolhasan (Arabic: ابوالحسن جلالی)",
    "KATEBI, Milad (Arabic: میلاد کاتبی)",
    "MIRMOHAMMADI, Mansureh (Arabic: منصوره میرمحمدی)",
    "MOHAMMADI, Zhila (Arabic: ژیلا محمدی)",
    "MOHIESNEJAD, Khaled (Arabic: خالد محیسن نژاد)",
    "MULLAH MOHAMMADI, Ensiyeh (Arabic: انسیه ملامحمدی)",
    "NAJAFZADEH, Soheil (Arabic: سهیل نجف زاده)",
    "NAJAFZADEH, Sorush (Arabic: سروش نجف زاده)",
    "RAZAVI, Sayyed Ruhollah (Arabic: سید روح اله رضوی)",
    "SABETI, Amir (Arabic: امیر ثابتی)",
    "VASIGHI MERAJI, Fatemeh (Arabic: فاطمه وثیقی معراجی)",
    "ABOLHASAN JALALI AND PARTNERS EXCHANGE COMPANY (Arabic: شرکت صرافی ابوالحسن جلالی و شرکا)",
    "BANCO INTERNACIONAL DE COMERCIO S.A",
    "BAVI AND PARTNERS EXCHANGE COMPANY (Arabic: شرکت صرافی باوی و شرکاء)",
    "CHABAHAR INTERNATIONAL BANK OVERSEAS COMPANY (Arabic: شرکت بانک بین المللی چابهار برون مرزی)"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Hong Kong」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Russia-related General License 128D , \"Authorizing Certain Transactions Involving Lukoil Retail Service Stations Located Outside of Russia;\" and Russia-related General License 130B , \"Authorizing Transactions Involving Certain Lukoil Entities in Bulgaria.\" Additionally, OFAC is issuing Iran-related General License FF , \"Authorizing the Wind Down of Transactions Involving International Development Bank for Investment and Finance.\" OFAC is also issuing one new, Cuba-related Frequently Asked Question ( FAQ 1276 ),…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261015"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 16 条（individuals have been added to OFAC's SDN List）；新增 11 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261015"
    },
    {
     "text": "其中地址/注册地涉中国的条目：ELITESPHERE TRADING CO（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261015"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261015",
   "pdf_url": "https://ofac.treasury.gov/media/937246/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:05"
   },
   "cn_parties": [
    {
     "name": "ELITESPHERE TRADING CO",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261014",
   "column": "lists",
   "action": "revised",
   "date": "2026-10-14",
   "agency": "OFAC",
   "doc_no": "20261014",
   "title": "Venezuela-related Designation Removal",
   "parties": [
    "RODRIGUEZ GOMEZ",
    "RODRIGUEZ, Jorge",
    "JORGE J",
    "JORGE JESUS"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following deletions have been made to OFAC's SDN List: RODRIGUEZ GOMEZ, Jorge Jesus (a.k.a. JORGE J., Rodriguez Gomez; a.k.a. JORGE JESUS, Rodriguez Gomez; a.k.a. RODRIGUEZ GOMEZ, Jorge J; a.k.a. RODRIGUEZ, Jorge), El Valle, Libertador, Capital District, Venezuela; DOB 09 Nov 1965; citizen Venezuela; Gender Male; Cedula No. 6823952 (Venezuela) (individual) [VENEZUELA].  RODRIGUEZ, Jorge (a.k.a. JORGE J., Rodriguez Gomez; a.k.a. JORGE JESUS, Rodriguez Gomez; a.k.a. RODRIGUEZ GOMEZ, Jorge J; a.k.a. RODRIGUEZ GOMEZ, Jorge Jesus), El Valle, Libertado…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261014"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 5 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261014"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261014",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:05"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261013_33",
   "column": "enforcement",
   "action": "",
   "date": "2026-10-13",
   "agency": "OFAC",
   "doc_no": "20261013_33",
   "title": "Settlement Agreement between the U.S. Department of the Treasury's Office of Foreign Assets Control and Bank of America, N.A.",
   "parties": [
    "Bank of America, N.A."
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Enforcement Actions（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "和解/罚款金额：$11,662,930（详情页正文首个金额数字，口径以原文 PDF 为准）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013_33"
    },
    {
     "text": "违规笔数（apparent violations）：475。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013_33"
    },
    {
     "text": "涉及制裁项目（原文）：OFAC sanctions programs targeting Russia, Belarus, Iran, Burma, Somalia, narcotics, and global terrorism。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013_33"
    },
    {
     "text": "违规事实（原文概述）：Bank of America processed payments involving blocked banks, failed to appropriately prioritize alerts for customers who were exact name- and date of birth-matches to blocked persons, failed to promptly update watchlists following OFAC designations, and mishandled two business accounts associated with blocked persons due to human error。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013_33"
    },
    {
     "text": "原文载：违规「未经自愿披露」（not voluntarily self-disclosed，含 largely not 等限定以原文为准）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013_33"
    },
    {
     "text": "定性：non-egregious。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013_33"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案（和解金额 $11,662,930；违规 475 笔；涉及 OFAC sanctions programs targeting Russia, Belarus, Iran, Burma, Somalia, narcotics, and global terrorism；定性 non-egregious；未经自愿披露（含 largely not 等限定以原文为准））的违规事实指向具体内控失效点：Bank of America processed payments involving blocked banks, failed to appropriately prioritize alerts for customers who were exact name- and date of birth-matches to blocked persons, failed to promptl。同类机构应逐项对照自查名单筛查命中后的警报处置、名单更新时效与账户管理控制。",
    "basis": "本案执法公告正文（违规事实段/定性段）+ OFAC 执法指南（Economic Sanctions Enforcement Guidelines）裁量因素框架"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261013_33",
   "pdf_url": "https://ofac.treasury.gov/media/937231/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:05"
   },
   "penalty": {
    "amount_usd": 11662930.0,
    "text": "$11,662,930",
    "suspended": false
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261013",
   "column": "lists",
   "action": "added",
   "date": "2026-10-13",
   "agency": "OFAC",
   "doc_no": "20261013",
   "title": "Counter Narcotics and Counter Terrorism Designations",
   "parties": [
    "GARZA ELIAS, Gamaliel",
    "GARZA GARCIA, Gamaliel",
    "GUAJARDO ALVAREZ, Pablo Cesar",
    "INZUNZA PARTIDA, Francisco Javier",
    "CLUB LA MOLIENDA",
    "CONCRETOS Y PRODUCTOS ASFALTICOS DEL NORTE",
    "CONSTRUACEROS DEL FUERTE",
    "CONSTRUCCIONES Y EDIFICACIONES GARZA ELIAS",
    "CUADRA SAN DIBANH",
    "DISTRIBUIDORA DE GAS ECONOMICO",
    "GAS ENERGIA CONFIABLE",
    "INOVA NLD DESARROLLOS INMOBILARIOS",
    "PROPANE TRADING GROUP",
    "TAMEX LOGISTICS",
    "TRANSPORTADORA DE GAS DE NUEVO LAREDO"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: GARZA ELIAS, Gamaliel, Anahuac, Nuevo Leon, Mexico; DOB 10 Jul 1997; POB Nuevo Laredo, Tamaulipas, Mexico; nationality Mexico; Gender Male; Secondary sanctions risk: section 1(b) of Executive Order 13224, as amended by Executive Order 13886; C.U.R.P. GAEG970710HTSRLM04 (Mexico) (individual) [SDGT] [ILLICIT-DRUGS-EO14059] (Linked To: CONSTRUCCIONES Y EDIFICACIONES GARZA ELIAS, S.A. DE C.V.).  GARZA GARCIA, Gamaliel, Anahuac, Nuevo Leon, Mexico; DOB 23 Oct 1974; POB Nuevo Leon, Mexico; natio…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 4 条（individuals have been added to OFAC's SDN List）；新增 11 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261013"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261013",
   "pdf_url": "https://ofac.treasury.gov/media/937211/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:05"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20839",
   "column": "rules",
   "action": "",
   "date": "2026-10-13",
   "agency": "OFAC",
   "doc_no": "2026-20839 / 91 FR 64758",
   "title": "Publication of an Iran-Related Determination",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a sector determination pursuant to a January 10, 2020 Executive Order. The determination was previously issued on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 64758；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/10/13/2026-20839/publication-of-an-iran-related-determination",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-10-13/pdf/2026-20839.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20831",
   "column": "rules",
   "action": "",
   "date": "2026-10-13",
   "agency": "OFAC",
   "doc_no": "2026-20831 / 91 FR 64758",
   "title": "Publication of Venezuela Sanctions Regulations Web General License 60",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the Venezuela Sanctions Regulations: GL 60, which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 64758；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 60 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/10/13/2026-20831/publication-of-venezuela-sanctions-regulations-web-general-license-60",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-10-13/pdf/2026-20831.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261009_33",
   "column": "rules",
   "action": "",
   "date": "2026-10-09",
   "agency": "OFAC",
   "doc_no": "20261009_33",
   "title": "Issuance of Russia-related General License",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Russia-related General License 135 , \"Authorizing Transactions Related to the Sale, Delivery, Offloading, and Importation of Diesel Fuel of Russian Federation Origin.\"",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009_33"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Russia」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261009_33",
   "pdf_url": "https://ofac.treasury.gov/media/937216/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 11:06"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261009",
   "column": "lists",
   "action": "revised",
   "date": "2026-10-09",
   "agency": "OFAC",
   "doc_no": "20261009",
   "title": "Settlement Agreement between the U.S. Department of the Treasury's Office of Foreign Assets Control and Pegasus Worldwide Logistics; International Criminal Court Designation and General Licenses; Burma-related Designation Removal",
   "parties": [
    "Pegasus Worldwide Logistics",
    "INTERNATIONAL CRIMINAL COURT",
    "HTET, Theint Win"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "本条为混合行动：OFAC 列表标签为「Sanctions List Updates」，但标题含和解/处罚表述（Settlement/Penalty 类），故同时收录于「执法案例更新」视图；清单变动部分见本栏要点。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009"
    },
    {
     "text": "摘要：The U.S. Department of the Treasury's Office of Foreign Assets Control (OFAC) today announced a settlement with Pegasus Worldwide Logistics, a freight forwarding firm involved in cross-border shipments. Pegasus has agreed to remit $175,015 to settle its potential civil liability for four apparent violations of the Illicit Drug Trafficking Sanctions Regulations and six apparent violations of the Reporting, Procedures and Penalties Regulations. Between September 2023 and February 2024, Pegasus dealt in blocked property by facilitating the importation of a machine supplied by a designated company…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 1 条（entity has been added to OFAC's SDN List）；删除 1 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009"
    },
    {
     "text": "和解/罚款金额：$175,015（详情页正文首个金额数字，口径以原文 PDF 为准）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009"
    },
    {
     "text": "涉及制裁项目（原文）：the Illicit Drug Trafficking Sanctions Regulations and six apparent violations of the Reporting, Procedures and Penalties Regulations. Between September 2023 and February 2024, Pegasus dealt in blocked property by facilitating the importation of a machine supplied by a designated company. Pegasus also failed to respond fully for six months to an OFAC subpoena。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009"
    },
    {
     "text": "定性：non-egregious。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261009"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案要点：和解金额 $175,015；涉及 the Illicit Drug Trafficking Sanctions Regulations and six apparent violations of the Reporting, Procedures and Penaltie；定性 non-egregious。执法公告所示金额、笔数与定性/VSD 情节可作为同类业务和解区间与披露策略的对照样本；具体裁量以执法文书为准。",
    "basis": "本案执法公告正文已解析字段 + OFAC 执法指南裁量因素框架"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261009",
   "pdf_url": "https://ofac.treasury.gov/media/937206/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 11:06"
   },
   "also_enforcement": true,
   "penalty": {
    "amount_usd": 175015.0,
    "text": "$175,015",
    "suspended": false
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261008",
   "column": "lists",
   "action": "added",
   "date": "2026-10-08",
   "agency": "OFAC",
   "doc_no": "20261008",
   "title": "Iran-related Designations; Issuance of Iran-related General License; Issuance of Amended Russia-related General License",
   "parties": [
    "CHUNDAKATTIL, Harishyam Hariharan",
    "KOCHIKAR, Ketan Manohar",
    "NOORZAD, Said Ahmad",
    "SAHU, Bhupendrasingh Dhalsingh",
    "VORA, Dhwani Nisarg",
    "VORA, Nisarg Samir",
    "ARABIANPRO MATERIALS FZCO (Arabic: ارابيانبرو ماتيريالز ش م ح)",
    "BETTA SHIPPING INC",
    "BGZ DIS TICARET LIMITED SIRKETI (Latin: BGZ DIŞ TICARET LIMITED ŞIRKETI)",
    "BRICH SHIPPING COMPANY LIMITED",
    "GODDESS SHIPPING CORP",
    "GRAVION MARITIME CO",
    "HECHUANG INTERNATIONAL GROUP LIMITED (Chinese Traditional: 和創國際集團有限公司)",
    "HESSONITE SHIP MANAGEMENT LLC",
    "HORIZON SHIP MANAGEMENT FZE",
    "JLS DRAGON COMPANY LIMITED",
    "KANHA SHIPPING INC",
    "MAKARUA SHIPPING LTD",
    "NOORZAD PETROKIMYA URUNLERI NAKLIYE SANAYI VE TICARET LIMITED SIRKETI (Latin: NOORZAD PETROKİMYA ÜRÜNLERİ NAKLİYE SANAYİ VE TİCARET LİMİTED ŞİRKETİ)",
    "NORTHPORT NAVIGATION INC"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Hong Kong」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Iran-related General License EE , \"Authorizing the Wind Down of Transactions Involving Samudra Marine Services Private Limited.\" Additionally, OFAC is issuing Russia-related General License 13S, \"Authorizing Certain Administrative Transactions Prohibited by Directive 4 under Executive Order 14024.\" Lastly, OFAC has made the following changes to its list of Specially Designated Nationals and Blocked Persons (SDN List). Specially Designated Nationals List The following individuals have been added to OFAC's SDN Li…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261008"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 6 条（individuals have been added to OFAC's SDN List）；新增 27 条（entities have been added to OFAC's SDN List）；新增 22 条（vessels have been added to OFAC's SDN List）；删除 2 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261008"
    },
    {
     "text": "其中地址/注册地涉中国的条目：BRICH SHIPPING COMPANY LIMITED（新增）、HECHUANG INTERNATIONAL GROUP LIMITED (Chinese Traditional: 和創國際集團有限公司)（新增）、JLS DRAGON COMPANY LIMITED（新增）、SHUNHANG SHIP MANAGEMENT LIMITED (Chinese Traditional: 順航船舶管理有限公司)（新增）、STANDWILL SHIPPING LIMITED（新增）、AVA 6（新增）、SHENZHEN Crude Oil Tanker Cameroon（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261008"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261008",
   "pdf_url": "https://ofac.treasury.gov/media/937101/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:06"
   },
   "cn_parties": [
    {
     "name": "BRICH SHIPPING COMPANY LIMITED",
     "kind": "新增"
    },
    {
     "name": "HECHUANG INTERNATIONAL GROUP LIMITED (Chinese Traditional: 和創國際集團有限公司)",
     "kind": "新增"
    },
    {
     "name": "JLS DRAGON COMPANY LIMITED",
     "kind": "新增"
    },
    {
     "name": "SHUNHANG SHIP MANAGEMENT LIMITED (Chinese Traditional: 順航船舶管理有限公司)",
     "kind": "新增"
    },
    {
     "name": "STANDWILL SHIPPING LIMITED",
     "kind": "新增"
    },
    {
     "name": "AVA 6",
     "kind": "新增"
    },
    {
     "name": "SHENZHEN Crude Oil Tanker Cameroon",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261005",
   "column": "lists",
   "action": "revised",
   "date": "2026-10-05",
   "agency": "OFAC",
   "doc_no": "20261005",
   "title": "Designations Removals; Designations Updates; Publication of Iran-related OFAC Alert; Publication of Amended Iran-related Frequently Asked Question",
   "parties": [
    "ABBAS, Abdul Hussein",
    "AHMAD, Rasem",
    "AHMAD, Wallid Issa",
    "AL-AMIRI, Adnan Talib Hassim",
    "AL-AZAWI, Dafir",
    "AL-BAZZAZ, Hikmet Abdallah",
    "AL-BAZAZ, Hikmet Abdullah",
    "AL-DAJANI, Leila N.S",
    "AL-DAJANI, Nadim S",
    "AL-DAJANI, Sa'ad",
    "AL-HAMMADI, Hamid Yusif",
    "HAMADI, Hamed Yussef",
    "AL-JABBURI, Sadi Tuma Abbas",
    "AL-MAJID, Hussein Kamel Hassan",
    "AL-MAJID, Husayn Kamil Hasan",
    "AL-QASIR, Nazar Jumah Ali",
    "AL-QASSIR, Nizar Jomaa Ali",
    "AL-RUBA, Dr. Khadim",
    "AL-ZIBARI, Arshad Muhammad Ahmad Muhammad",
    "ALAWI, Abdel-Salam Abdel-Rahman"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Beijing」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing an Iran-related Alert, \" Notice to Foreign Financial Institutions Conducting Business with Iran .\" Additionally, OFAC is publishing one amended Iran-related Frequently Asked Question ( FAQ 156 ).  Specially Designated Nationals List Updates The following deletions have been made to OFAC's SDN List: ABBAS, Abdul Hussein, Italy (individual) [IRAQ2].  AHMAD, Rasem, P.O. Box 1318, Amman, Jordan (individual) [IRAQ2].  AHMAD, Wallid Issa, Iraq (individual) [IRAQ2].  AL-AMIRI, Adnan Talib Hassim, 43 Palace Mansions…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261005"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 181 条（deletions have been made to OFAC's SDN List）；修订 44 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261005"
    },
    {
     "text": "其中地址/注册地涉中国的条目：MOHAMED, Abdul Kader Ibrahim（删除）、AE INTERNATIONAL TRADE CO LIMITED (Chinese Traditional: 艾宜國際貿易有限公司)（修订）、HIN YUN TRADING COMPANY LIMITED (Chinese Traditional: 欣蘊貿易有限公司)（修订）、QIAN XI LONG TRADING CO LIMITED (Chinese Traditional: 千禧龍貿易有限公司)（修订）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261005"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261005",
   "pdf_url": "https://ofac.treasury.gov/media/937091/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:06"
   },
   "cn_parties": [
    {
     "name": "MOHAMED, Abdul Kader Ibrahim",
     "kind": "删除"
    },
    {
     "name": "AE INTERNATIONAL TRADE CO LIMITED (Chinese Traditional: 艾宜國際貿易有限公司)",
     "kind": "修订"
    },
    {
     "name": "HIN YUN TRADING COMPANY LIMITED (Chinese Traditional: 欣蘊貿易有限公司)",
     "kind": "修订"
    },
    {
     "name": "QIAN XI LONG TRADING CO LIMITED (Chinese Traditional: 千禧龍貿易有限公司)",
     "kind": "修订"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261002",
   "column": "lists",
   "action": "added",
   "date": "2026-10-02",
   "agency": "OFAC",
   "doc_no": "20261002",
   "title": "Counter Terrorism Designations",
   "parties": [
    "AL-ZAQ, Saleem Abdallah Saleem (Arabic: سليم عبد الله سليم الزق)",
    "BARIKA, Faouzi",
    "OUALID, Amel",
    "ASSOCIATION BARAKA",
    "ENSEMBLE C MIEUX"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: AL-ZAQ, Saleem Abdallah Saleem (Arabic: سليم عبد الله سليم الزق) (a.k.a. ALZAQ, Saleem A.S.; a.k.a. ZAK, Salim), Mailbox 5151, Baghdad Street, Shujaiyyah, Gaza; Mailbox 119, Baghdad Street, Shujaiyyah, Gaza; DOB 12 May 1981; nationality Palestinian; Gender Male; Secondary sanctions risk: section 1(b) of Executive Order 13224, as amended by Executive Order 13886; Passport 5428093 (Palestinian) expires 09 Mar 2027; National ID No. 909097131 (Palestinian) (individual) [SDGT] (Linked To: HAMAS…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261002"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 3 条（individuals have been added to OFAC's SDN List）；新增 2 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261002"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261002",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:06"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "bis-press-release-bis-reaches-administrative-enforcement-settlement-lambda-research-",
   "column": "enforcement",
   "action": "",
   "date": "2026-10-02",
   "agency": "BIS",
   "doc_no": "",
   "title": "BIS Reaches Administrative Enforcement Settlement with Lambda Research Corporation",
   "parties": [
    "Lambda Research Corporation"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Shenzhen」（全文检索）"
   },
   "points": [
    {
     "text": "栏目标签：Enforcement, Export Violations（BIS 新闻页）。",
     "layer": "external",
     "source": "BIS news-updates"
    },
    {
     "text": "民事罚款：$2,000,000，全额缓期执行（fully suspended），违约即激活（和解命令原文）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/lambda-research-corporation-10-2-2026.pdf"
    },
    {
     "text": "违规总数：66 笔（和解命令原文：committed sixty-six (66) violations）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/lambda-research-corporation-10-2-2026.pdf"
    },
    {
     "text": "违规笔数与条款：11 笔 × 15 C.F.R. § 764.2(e)（原文语境：…By engaging in the above-described conduct, Lambda）；47 笔 × 15 C.F.R. § 764.2(a)（原文语境：…Lambda’s exports of automatic updates of TracePro and OSLO to Huawei Japan without a BIS license）；7 笔 × 15 C.F.R. § 764.2(a)（原文语境：…Lambda’s exports of automatic updates of TracePro to SiCarrier without a BIS license）；1 笔 × 15 C.F.R. § 764.2(a)（原文语境：…By engaging in the above conduct, Lambda）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/lambda-research-corporation-10-2-2026.pdf"
    },
    {
     "text": "原文载有自愿披露（VSD）情节。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/lambda-research-corporation-10-2-2026.pdf"
    },
    {
     "text": "涉案清单对手方（原文）：SiCarrier（Entity List）、SMSEL（Unverified List）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/lambda-research-corporation-10-2-2026.pdf"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案（罚款 $2,000,000，全额缓期执行（fully suspended），违约即激活；违规 66 笔；对手方 SiCarrier（Entity List）、SMSEL（Unverified List）；VSD 情节）显示执法按「行为类型 × 条款」分组累计笔数，持续性的后续传输/服务可逐笔计为独立违规；VSD 与缓期执行（suspended）安排直接影响实际缴付金额，和解区间与披露策略可据本案对照。",
    "basis": "本案和解命令 Statement of Charges 分组与罚款/缓期条款（PDF 原文）+ EAR §764.2、§766.18 和解框架"
   },
   "url": "https://www.bis.gov/press-release/bis-reaches-administrative-enforcement-settlement-lambda-research-corporation",
   "pdf_url": "https://www.bis.gov/media/documents/lambda-research-corporation-10-2-2026.pdf",
   "source": {
    "channel": "BIS news-updates",
    "retrieved_at": "2026-10-23 10:38"
   },
   "penalty": {
    "amount_usd": 2000000.0,
    "text": "$2,000,000",
    "suspended": true
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20261001",
   "column": "lists",
   "action": "added",
   "date": "2026-10-01",
   "agency": "OFAC",
   "doc_no": "20261001",
   "title": "Iran-related Designations and Designations Updates; Transnational Criminal Organizations Designation; Publication of Iran-related Determination; Publication of Amended Iran-related Frequently Asked Question",
   "parties": [
    "HAMEDANI, Mehnoosh Poursaraf (Arabic: مهنوش پورصراف همدانی)",
    "KESHVARDOUST, Ramin (Arabic: رامین کشوردوست)",
    "A7 NETWORK",
    "BONASOL GROUP CO",
    "DOMINION TRADING GROUP LIMITED",
    "EAST CONCORD DEVELOPMENT LIMITED",
    "FIDAR FOOLAD RADMAN (Arabic: شرکت فیدار فولاد رادمان)",
    "HEAVY EQUIPMENT PRODUCTION COMPANY (Arabic: شرکت تولید تجهیزات سنگین هپکو)",
    "HEPCO SHANGHAI CO",
    "HESSENBERG CO",
    "INTEGRATED AUTO PARTS LLC (Arabic: انتجريتد لقطع غيار السيارات ذ م م)",
    "IRAN KHODRO COMPANY (Arabic: شرکت ایران خودرو سهامی علم)",
    "IRAN KHODRO DIESEL COMPANY (Arabic: شرکت ایران خودرو دیزل سهامی علم)",
    "ISLAMIC REPUBLIC OF IRAN RAILWAY COMPANY (Arabic: شرکت راه آهن جمهوري اسلامي ايران سهامي خاص)",
    "KGT TRADING LIMITED",
    "M AND R STEEL CO",
    "MEIZI CO",
    "NIROO MOTOR DAMAVAND COMPANY (Arabic: شرکت نیرو موتور دماوند)",
    "NIROO MOTOR SHIRAZ INDUSTRIAL AND MANUFACTURING COMPANY (Arabic: شرکت تولیدی و صنعتی نیرو موتور شیراز)",
    "PARS KHODRO COMPANY (Arabic: شرکت پارس خودرو سهامی علم)"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「China」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) has published a Determination Pursuant to Executive Order 13902 - Automotive and Rail Sectors of the Iranian Economy . Additionally, OFAC is publishing one amended Iran-related Frequently Asked Question ( FAQ 831) .  Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List:  HAMEDANI, Mehnoosh Poursaraf (Arabic: مهنوش پورصراف همدانی), China; DOB 07 Mar 1984; POB Qom, Iran; nationality Iran; alt. nationality Dominica; Additional Sanctions Information - Subject to Secondary Sa…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261001"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 2 条（individuals have been added to OFAC's SDN List）；新增 29 条（entities have been added to OFAC's SDN List）；修订 4 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261001"
    },
    {
     "text": "其中地址/注册地涉中国的条目：HAMEDANI, Mehnoosh Poursaraf (Arabic: مهنوش پورصراف همدانی)（新增）、KESHVARDOUST, Ramin (Arabic: رامین کشوردوست)（新增）、BONASOL GROUP CO（新增）、DOMINION TRADING GROUP LIMITED（新增）、EAST CONCORD DEVELOPMENT LIMITED（新增）、HEPCO SHANGHAI CO（新增）、HESSENBERG CO（新增）、KGT TRADING LIMITED（新增）、M AND R STEEL CO（新增）、MEIZI CO（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20261001"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20261001",
   "pdf_url": "https://ofac.treasury.gov/media/937086/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:06"
   },
   "cn_parties": [
    {
     "name": "HAMEDANI, Mehnoosh Poursaraf (Arabic: مهنوش پورصراف همدانی)",
     "kind": "新增"
    },
    {
     "name": "KESHVARDOUST, Ramin (Arabic: رامین کشوردوست)",
     "kind": "新增"
    },
    {
     "name": "BONASOL GROUP CO",
     "kind": "新增"
    },
    {
     "name": "DOMINION TRADING GROUP LIMITED",
     "kind": "新增"
    },
    {
     "name": "EAST CONCORD DEVELOPMENT LIMITED",
     "kind": "新增"
    },
    {
     "name": "HEPCO SHANGHAI CO",
     "kind": "新增"
    },
    {
     "name": "HESSENBERG CO",
     "kind": "新增"
    },
    {
     "name": "KGT TRADING LIMITED",
     "kind": "新增"
    },
    {
     "name": "M AND R STEEL CO",
     "kind": "新增"
    },
    {
     "name": "MEIZI CO",
     "kind": "新增"
    },
    {
     "name": "SHANGHAI RUIMI IMPORT AND EXPORT TRADE CO",
     "kind": "新增"
    },
    {
     "name": "TANEX GLOBAL TRADING HONG KONG LIMITED",
     "kind": "新增"
    },
    {
     "name": "EVER SHINING LIMITED (Chinese Simplified: 宜欣有限公司)",
     "kind": "修订"
    },
    {
     "name": "EVER SHINING LTD",
     "kind": "修订"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260930",
   "column": "lists",
   "action": "revised",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "20260930",
   "title": "Counter Terrorism and Transnational Criminal Organizations Designations; Belarus, Counter Narcotics, and Libya Designations Removals",
   "parties": [
    "CANELON AGUIRRE, Anibal Alexander",
    "CARDENAS ARZOLA, Eric Gabriel",
    "GALEANO BASURTO, Aslhy Javier",
    "GALEANO BAZURTO, Jose Dario",
    "HERNANDEZ GUERRERO, Anthony Wuiliam",
    "MARTINEZ ARMENTA, Carlos Javier",
    "MARTINEZ PIRONA, Oscar Leonardo",
    "MEJIA CASTILLO, Alejandro",
    "RIVAS NUNEZ, Juan Gabriel (Latin: RIVAS NUÑEZ",
    "ENIGMA COMMUNITY",
    "SOLUCIONES INTEGRALES TOLUCA",
    "PATRACA, S.A. DE C.V",
    "BOUTIQUE PATRACA",
    "MARAYA (f.k.a. MED PATRON) Palletized Cargo Ship Samoa flag; Vessel Registration Identification IMO 7514517 (vessel)",
    "MED PATRON",
    "PROTOPOVICH, Tatyana",
    "PROTOPOVICH, Tayuana"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: CANELON AGUIRRE, Anibal Alexander (a.k.a. \"Prometheus\"; a.k.a. \"The Engineer\"), Venezuela; DOB 15 May 1976; POB Venezuela; nationality Venezuela; Gender Male; Secondary sanctions risk: section 1(b) of Executive Order 13224, as amended by Executive Order 13886; Digital Currency Address - TRX TJjRAn9kLiyh8h6gjBjaYjkfDkskgZfyW9; Cedula No. V-13126628 (Venezuela) (individual) [SDGT] [TCO] (Linked To: TREN DE ARAGUA).  CARDENAS ARZOLA, Eric Gabriel, Venezuela; DOB 24 Feb 1991; nationality Venez…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260930"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 9 条（individuals have been added to OFAC's SDN List）；新增 2 条（entities have been added to OFAC's SDN List）；删除 6 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260930"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260930",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20014",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20014 / 91 FR 61762",
   "title": "Publication of Russian Harmful Foreign Activities Sanctions Regulations Web General Licenses 131E, 131F, and 131G",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing three general licenses (GLs) issued pursuant to the Russian Harmful Foreign Activities Sanctions Regulations: GLs 131E, 131F, and 131G, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61762；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Russian Harmful Foreign Activities」项目；通用许可 131E、131F 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20014/publication-of-russian-harmful-foreign-activities-sanctions-regulations-web-general-licenses-131e",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20014.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20012",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20012 / 91 FR 61771",
   "title": "Publication of Venezuela Sanctions Regulations Web General License 5W",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the Venezuela Sanctions Regulations: GL 5W, which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61771；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 5W 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20012/publication-of-venezuela-sanctions-regulations-web-general-license-5w",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20012.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20011",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20011 / 91 FR 61763",
   "title": "Publication of Transnational Criminal Organizations Sanctions Regulations Web General License 2",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the Transnational Criminal Organizations Sanctions Regulations: GL 2. This GL was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61763；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Transnational Criminal Organizations」项目；通用许可 2 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20011/publication-of-transnational-criminal-organizations-sanctions-regulations-web-general-license-2",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20011.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20010",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20010 / 91 FR 61758",
   "title": "Publication of Iran-Related Web General Licenses X and X1",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two Iran-related general licenses (GLs): GL X and GL X1. These GLs were previously made available on OFAC's website. GL X was revoked and superseded by GL X1. GL X1 has expired.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61758；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20010/publication-of-iran-related-web-general-licenses-x-and-x1",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20010.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20009",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20009 / 91 FR 61764",
   "title": "Publication of Venezuela Sanctions Regulations Web General Licenses 46D, 47B, 48C, 50C, 51C, 52B, 54B, and 61A",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing eight general licenses (GLs) issued pursuant to the Venezuela Sanctions Regulations: GLs 46D, 47B, 48C, 50C, 51C, 52B, 54B, and 61A, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61764；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 46D、47B、48C、50C、51C、52B 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20009/publication-of-venezuela-sanctions-regulations-web-general-licenses-46d-47b-48c-50c-51c-52b-54b-and",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20009.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20008",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20008 / 91 FR 61771",
   "title": "Publication of Venezuela Sanctions Regulations Web General Licenses 52, 53, 54, 55, 56, 57, and 58",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing seven general licenses (GLs) issued pursuant to the Venezuela Sanctions Regulations: GLs 52, 53, 54, 55, 56, 57, and 58, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61771；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 52、53、54、55、56、57 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20008/publication-of-venezuela-sanctions-regulations-web-general-licenses-52-53-54-55-56-57-and-58",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20008.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20007",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20007 / 91 FR 61727",
   "title": "Removing Duplicative Penalties Information and Reorganizing Certain Parts",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is removing duplicative regulatory provisions, and adding a provision to those parts directing readers to the Sanctions Penalties Regulations where the information is located. OFAC is also moving to an expanded subpart at the beginning of each part information regarding delegations of authority, recordkeeping and reporting requirements, and the Paperwork Reduction Act within multiple parts of the Office of Foreign Assets Control chapter of the CFR.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61727；生效 2026-09-30。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20007/removing-duplicative-penalties-information-and-reorganizing-certain-parts",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20007.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-20006",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-20006 / 91 FR 61775",
   "title": "Publication of Venezuela Sanctions Regulations Web General Licenses 46C, 47A, 48B, 50B, 51B, 52A, and 54A",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing seven general licenses (GLs) issued pursuant to the Venezuela Sanctions Regulations: GLs 46C, 47A, 48B, 50B, 51B, 52A, and 54A, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61775；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 46C、47A、48B、50B、51B、52A 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-20006/publication-of-venezuela-sanctions-regulations-web-general-licenses-46c-47a-48b-50b-51b-52a-and-54a",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-20006.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19978",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-19978 / 91 FR 61759",
   "title": "Iranian Transactions and Sanctions Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is adopting a final rule amending the Iranian Transactions and Sanctions Regulations to implement certain provisions of a January 10, 2020 Iran-related Executive order. This amendment also revises an existing definition and an existing exemption, and incorporates two exemptions from the January 10, 2020 Iran-related Executive order.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61759；生效 2026-09-30。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-19978/iranian-transactions-and-sanctions-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-19978.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19977",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-19977 / 91 FR 61748",
   "title": "Cuba Sanctions Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is adding regulations to implement a May 1, 2026 Cuba- related Executive order. OFAC intends to supplement these regulations with a more comprehensive set of regulations, which may include additional interpretive guidance and definitions, general licenses, and other regulatory provisions.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61748；生效 2026-09-30。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-19977/cuba-sanctions-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-19977.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19973",
   "column": "rules",
   "action": "",
   "date": "2026-09-30",
   "agency": "OFAC",
   "doc_no": "2026-19973 / 91 FR 61741",
   "title": "Cuban Assets Control Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is amending the Cuban Assets Control Regulations to implement portions of the President's foreign policy toward Cuba, including as directed by National Security Presidential Memorandum-5, \"Reissuance of and Amendments to National Security Presidential Memorandum 5 on Strengthening the Policy of the United States Toward Cuba\" (2025 NSPM-5), signed by the President on June 30, 2025. Among other things, this rule adds a prohibition on indirect financial transactions with entities or subentities on the Cuba Restricted List; amends other authorizations related to financial transactions, including removing an authorization for \"U-Turn\" transactions; and amends authorizations related to travel and related transactions, including removing authorizations for group people-to-people travel and professional meetings in Cuba.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 61741；生效 2026-09-30。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/30/2026-19973/cuban-assets-control-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-30/pdf/2026-19973.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260929_33",
   "column": "rules",
   "action": "",
   "date": "2026-09-29",
   "agency": "OFAC",
   "doc_no": "20260929_33",
   "title": "Publication of Regulatory Amendments; Publication of Cuba Sanctions Regulations; Issuance of New and Amended Cuba-related Frequently Asked Questions; Publication of Cuba-related OFAC Alert",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Regulations and Guidance（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing a rule removing duplicative regulatory provisions and reorganizing multiple parts within the Code of Federal Regulations (CFR). Through these actions, OFAC is eliminating over 100 subparts from its chapter of the CFR, and making information regarding delegations of authority, recordkeeping, and reporting requirements, and the Paperwork Reduction Act easier to locate . Additionally, OFAC is amending the Iranian Transactions and Sanctions Regulations to incorporate Executive Order (E.O.) 13902 of January 10, 2020…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260929_33"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Cuba」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260929_33",
   "pdf_url": "https://ofac.treasury.gov/media/937026/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260929",
   "column": "lists",
   "action": "added",
   "date": "2026-09-29",
   "agency": "OFAC",
   "doc_no": "20260929",
   "title": "Counter Narcotics, Counter Terrorism, Iran-related, and Non-Proliferation Designations",
   "parties": [
    "AHMADY, Ali Fotowat",
    "BUENROSTRO MARTIN, Rafael",
    "CASTILLO MALDONADO, Lorenzo",
    "CHAPOTIN VILLALBA, Diosvany Samuel",
    "FELIX RIVERA, Ilia Elizabeth",
    "GASTELUM GARCIA, Hildegardo",
    "HUEZO HERNANDEZ, Franklin Ernesto",
    "LALI, Parisa",
    "LI, Fen (Chinese Simplified: 李芬)",
    "MARTINEZ RODRIGUEZ, Pedro Humberto",
    "MENDIVIL GARCIA, Pedro Ariel",
    "MENDOZA URIARTE, Francisco Javier",
    "MENDOZA URIARTE, Jorge Luis",
    "MORENO GOMEZ SANTELICES, Marco Antonio",
    "TABATABAI, Seyyed Asghar Alizadeh",
    "TAJAMMAL, Waseem Pasha",
    "TORRES TORRES, Carlos Alberto",
    "TORRES TORRES, Luis Alfonso",
    "VERA AYALA, Jeronimo Javier",
    "VERA AYALA, Jorge Mario"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Chinese」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: AHMADY, Ali Fotowat (a.k.a. AHMADI, Ali Fotovat; a.k.a. AHMADI, Ali Fotowat), Tehran, Iran; DOB 22 Sep 1958; POB Shemiran, Iran; nationality Iran; alt. nationality United States; citizen United States; Additional Sanctions Information - Subject to Secondary Sanctions; Gender Male; Passport 642906027 (United States) expires 17 Dec 2028; alt. Passport F42549387 (Iran) expires 12 Aug 2022; National ID No. 0451991923 (Iran) (individual) [NPWMD] [IFSR] (Linked To: KAVOSHCOM ASIA R AND D GROUP).…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260929"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 23 条（individuals have been added to OFAC's SDN List）；新增 30 条（entities have been added to OFAC's SDN List）；修订 12 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260929"
    },
    {
     "text": "其中地址/注册地涉中国的条目：LI, Fen (Chinese Simplified: 李芬)（新增）、TABATABAI, Seyyed Asghar Alizadeh（新增）、EC MOJO TECHNOLOGY CO LIMITED (Chinese Traditional: 昴雋電訊有限公司)（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260929"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260929",
   "pdf_url": "https://ofac.treasury.gov/media/937021/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "cn_parties": [
    {
     "name": "LI, Fen (Chinese Simplified: 李芬)",
     "kind": "新增"
    },
    {
     "name": "TABATABAI, Seyyed Asghar Alizadeh",
     "kind": "新增"
    },
    {
     "name": "EC MOJO TECHNOLOGY CO LIMITED (Chinese Traditional: 昴雋電訊有限公司)",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260928",
   "column": "rules",
   "action": "",
   "date": "2026-09-28",
   "agency": "OFAC",
   "doc_no": "20260928",
   "title": "Issuance of Amended Venezuela General Licenses",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela-related General License 46E , \"Authorizing Certain Activities Involving Venezuelan-Origin Oil or Petrochemical Products;\" Venezuela-related General License 48D , \"Authorizing the Supply of Certain Items and Services to Venezuela;\" Venezuela-related General License 49B , \"Authorizing Negotiations of and Entry Into Contingent Contracts for Certain Investment in Venezuela.\"",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260928"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260928",
   "pdf_url": "https://ofac.treasury.gov/media/937006/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19678",
   "column": "rules",
   "action": "",
   "date": "2026-09-25",
   "agency": "OFAC",
   "doc_no": "2026-19678 / 91 FR 60821",
   "title": "Sanctions Penalties Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is adding the Sanctions Penalties Regulations. These new regulations consolidate previously existing information regarding penalties applicable to multiple sanctions programs implemented by OFAC.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60821；生效 2026-09-25。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/25/2026-19678/sanctions-penalties-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-25/pdf/2026-19678.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19657",
   "column": "rules",
   "action": "",
   "date": "2026-09-25",
   "agency": "OFAC",
   "doc_no": "2026-19657 / 91 FR 60825",
   "title": "Terrorism List Governments Sanctions Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is amending the Terrorism List Governments Sanctions Regulations to implement changes resulting from the rescission of the designation of Syria as a State Sponsor of Terrorism. Specifically, OFAC is removing and reserving a Syria-specific general license because the authorization is no longer necessary following the rescission.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60825；生效 2026-09-25。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/25/2026-19657/terrorism-list-governments-sanctions-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-25/pdf/2026-19657.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260924",
   "column": "rules",
   "action": "",
   "date": "2026-09-24",
   "agency": "OFAC",
   "doc_no": "20260924",
   "title": "Publication of Regulatory Amendments; Publication of Report for Licensing Activities Undertaken Pursuant to the Trade Sanctions Reform and Export Enhancement Act (TSRA)",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Regulations and Guidance（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury’s Office of Foreign Assets Control (OFAC) is consolidating previously existing information regarding enforcement procedures and penalties, including the rights of U.S. persons being investigated for violations, that are currently located in individual parts of 31 CFR chapter V into a new part, the Sanctions Penalties Regulations .  Following publication of this part, OFAC will update parts within 31 CFR chapter V to replace existing penalties information with cross-references to the Regulations, resulting in the deletion of over 100 subparts from existing regulat…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260924"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260924",
   "pdf_url": "https://ofac.treasury.gov/media/936981/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19537",
   "column": "rules",
   "action": "",
   "date": "2026-09-24",
   "agency": "BIS",
   "doc_no": "2026-19537 / 91 FR 60505",
   "title": "Measures To Restrict Stockpiling of Polysilicon and Polysilicon Derivatives Under Proclamation 11052",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "On August 6, 2026, the President issued Proclamation 11052, \"Adjusting Imports of Polysilicon and Its Derivatives Into the United States\" (Proclamation 11052), ordering the Secretary of Commerce (Secretary) to take action to restrict imports by a company if he determines the company is stockpiling polysilicon or polysilicon derivatives (Polysilicon Products) in advance of import adjustments that will be effective on December 4, 2026. The Bureau of Industry and Security (BIS), in this temporary final rule (TFR), announces the criteria and process it will use to monitor existing companies for evidence of stockpiling, limit a newly established importer's ability to stockpile, and subject companies that are stockpiling to an import prohibition if necessary. This TFR also establishes the process for such companies to obtain a waiver from any import prohibitions imposed pursuant to this rule, and imposes certain import limitations on new importers that register with U.S. Customs and Border Protection (CBP) on or after August 6, 2026.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60505；生效 2026-09-22。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/24/2026-19537/measures-to-restrict-stockpiling-of-polysilicon-and-polysilicon-derivatives-under-proclamation-11052",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-24/pdf/2026-19537.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260923",
   "column": "lists",
   "action": "revised",
   "date": "2026-09-23",
   "agency": "OFAC",
   "doc_no": "20260923",
   "title": "Democratic Republic of the Congo-related Designations Removals",
   "parties": [
    "OLENGA, Francois (Latin: OLENGA",
    "OLENGA TETE",
    "OLENGA TATE",
    "OKUNJI, Francois (Latin: OKUNJI",
    "OTSHUNDI, Francois (Latin: OTSHUNDI",
    "SAFARI CLUB",
    "CENTRE DE LOISIR SAFARI CLUB",
    "\"SAFARI BEACH\""
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Update The following deletions have been made to OFAC's SDN List: OLENGA, Francois (Latin: OLENGA, François) (a.k.a. OKUNJI, Francois (Latin: OKUNJI, François); a.k.a. OLENGA TATE, Francois; a.k.a. OLENGA TETE, Francois (Latin: OLENGA TETE, François); a.k.a. OTSHUNDI, Francois (Latin: OTSHUNDI, François)), Kinshasa, Congo, Democratic Republic of the; DOB 09 Oct 1948; alt. DOB 10 Sep 1948; alt. DOB 10 Jul 1949; POB Kindu, Maniema, Democratic Republic of the Congo; nationality Congo, Democratic Republic of the; citizen Congo, Democratic Republic of the; Gender…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260923"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 8 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260923"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260923",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19424",
   "column": "rules",
   "action": "",
   "date": "2026-09-23",
   "agency": "OFAC",
   "doc_no": "2026-19424 / 91 FR 60304",
   "title": "Publication of Iran-Related Web General Licenses Y and Z",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two Iran-related general licenses (GLs): GLs Y and Z. These GLs were previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60304；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/23/2026-19424/publication-of-iran-related-web-general-licenses-y-and-z",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-23/pdf/2026-19424.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19423",
   "column": "rules",
   "action": "",
   "date": "2026-09-23",
   "agency": "OFAC",
   "doc_no": "2026-19423 / 91 FR 60303",
   "title": "Publication of the Democratic Republic of the Congo Sanctions Regulations Web General License 2",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the Democratic Republic of the Congo Sanctions Regulations: GL 2. This GL was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60303；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Congo」项目；通用许可 2 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/23/2026-19423/publication-of-the-democratic-republic-of-the-congo-sanctions-regulations-web-general-license-2",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-23/pdf/2026-19423.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19422",
   "column": "rules",
   "action": "",
   "date": "2026-09-23",
   "agency": "OFAC",
   "doc_no": "2026-19422 / 91 FR 60304",
   "title": "Publication of Venezuela Sanctions Regulations Web General Licenses 5X and 5Y",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two general licenses (GLs) issued pursuant to the Venezuela Sanctions Regulations: GL 5X and 5Y, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60304；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 5X、5Y 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/23/2026-19422/publication-of-venezuela-sanctions-regulations-web-general-licenses-5x-and-5y",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-23/pdf/2026-19422.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-19421",
   "column": "rules",
   "action": "",
   "date": "2026-09-23",
   "agency": "OFAC",
   "doc_no": "2026-19421 / 91 FR 60303",
   "title": "Publication of International Criminal Court-Related Sanctions Regulations Web General License 12",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the International Criminal Court-Related Sanctions Regulations: GL 12. This GL was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 60303；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "通用许可 12 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/23/2026-19421/publication-of-international-criminal-court-related-sanctions-regulations-web-general-license-12",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-23/pdf/2026-19421.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260918",
   "column": "lists",
   "action": "revised",
   "date": "2026-09-18",
   "agency": "OFAC",
   "doc_no": "20260918",
   "title": "Expiration of Emergency With Respect to the Situation in Ethiopia; Ethiopia-related Designations Removals; Issuance of Amended Russia-related General License and Associated Frequently Asked Questions",
   "parties": [
    "PEOPLE'S FRONT FOR DEMOCRACY AND JUSTICE",
    "W KIDAN",
    "WOLDEKIDAN, Hagos Ghebrehiwet",
    "WELDEKIDANE, Hagos Ghebrehiwet",
    "NEMARIAM, Abraha Kassa",
    "KASSA, Wedi",
    "KASSA, Abraha",
    "ERITREAN DEFENSE FORCES",
    "ERITREAN DEFENSE FORCE",
    "RED SEA TRADING CORPORATION",
    "HIDRI TRUST"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The national emergency declared in Executive Order (E.O.) 14046 of September 17, 2021, \"Imposing Sanctions on Certain Persons With Respect to the Humanitarian and Human Rights Crisis in Ethiopia,\" has expired. Following the expiration of the national emergency declared in E.O. 14046, the Department of the Treasury's Office of Foreign Assets Control (OFAC) has removed from the List of Specially Designated Nationals and Blocked Persons (SDN List), persons designated pursuant to E.O. 14046 whose property had been blocked. In addition, OFAC has removed Frequently Asked Questions pertaining to this…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260918"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 11 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260918"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260918",
   "pdf_url": "https://ofac.treasury.gov/media/936951/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260917",
   "column": "lists",
   "action": "revised",
   "date": "2026-09-17",
   "agency": "OFAC",
   "doc_no": "20260917",
   "title": "Iran-related Designations; Cuba Designations; Belarus-related Designations Removals",
   "parties": [
    "CANCIO MONTEAGUDO, Joaquin Francisco",
    "HEIDARI, Seyed Adel (Arabic: سید عادل حیدری)",
    "HURTADO BETANCOURT, Julio",
    "PEDRERA ARGUELLO, Dioglis",
    "ZAKER HOSSEIN, Hossein Ali (Arabic: حسین‌علی ذاکر حسین)",
    "ZAKER HOSSEIN, Mohammad Mahdi (Arabic: محمد مهدی ذاکر حسین)",
    "BITBANK (Arabic: بیتبانک)",
    "CENTRO DE INVESTIGACION Y DESARROLLO DE ARMAMENTO DE INFANTERIA",
    "CENTRO DE INVESTIGACION Y DESARROLLO DE SIMULADORES",
    "CENTRO DE INVESTIGACION Y DESARROLLO NAVAL",
    "CENTRO DE INVESTIGACION",
    "CENTRO DE INVESTIGACIONES DEL NIQUEL CAPITAN ALBERTO FERNANDEZ MONTES DE OCA",
    "EMPRESA DE INGENIERIA Y PROYECTOS DEL NIQUEL",
    "EMPRESA DE SERVICIOS TECNICOS DE COMPUTACION COMUNICACIONES Y ELECTRONICA",
    "PINARES S.A",
    "PISHTAZ SIMORGH ELECTRONIC TRADE COMPANY (Arabic: شرکت تجارت الکترونیک پیشتاز سیمرغ)",
    "LAKOKRASKA OAO",
    "LAKOKRASKA OPEN JOINT-STOCK COMPANY",
    "KONTSERN BELLESBUMPROM (Cyrillic: КОНЦЕРН БЕЛЛЕСБУМПРОМ)"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List:  CANCIO MONTEAGUDO, Joaquin Francisco, 58 #2906 Eyrpto, Playa, Havana, Cuba; DOB 16 Sep 1945; nationality Cuba; Gender Male; Passport E493203 (Cuba) expires 20 May 2031 (individual) [CUBA-EO14404].  HEIDARI, Seyed Adel (Arabic: سید عادل حیدری), KH Shari'ati KH Va'zi P40 Vahda 3, Tehran, Iran; DOB 22 Nov 1974; POB Shahrekord, Iran; nationality Iran; Additional Sanctions Information - Subject to Secondary Sanctions; Gender Male; National ID No. 4621551825 (Iran) (individual) [IRAN] [IRAN-EO1…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260917"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 6 条（individuals have been added to OFAC's SDN List）；新增 10 条（entities have been added to OFAC's SDN List）；删除 5 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260917"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260917",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:08"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260916",
   "column": "lists",
   "action": "revised",
   "date": "2026-09-16",
   "agency": "OFAC",
   "doc_no": "20260916",
   "title": "Russia-related Designations Removals; Counter Narcotics Designation Removal; Issuance of Amended Venezuela General License and Frequently Asked Question",
   "parties": [
    "VEGA SANCHEZ",
    "BOMATTER, Hans Peter",
    "MODULSAN MAKINA KESICI TAKIM VE DISLI SANAYI TICARET LIMITED SIRKETI"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela-related General License 5Z , \"Authorizing Certain Transactions Related to the Petróleos de Venezuela, S.A. 2020 8.5 Percent Bond on or After November 5, 2026.\" OFAC is also issuing one amended Venezuela-related Frequently Asked Question, FAQ 595 . Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The following deletions have been made to OFAC's SDN List: VEGA SANCHEZ, Jose Raul, c/o AGRICOLA GAXIOLA S.A. DE C.V., Her…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260916"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 3 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260916"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260916",
   "pdf_url": "https://ofac.treasury.gov/media/936946/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:08"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260914",
   "column": "lists",
   "action": "added",
   "date": "2026-09-14",
   "agency": "OFAC",
   "doc_no": "20260914",
   "title": "Iran-related Designation; Issuance of Amended Venezuela-related General License and Frequently Asked Question",
   "parties": [
    "VTB BANK PUBLIC JOINT STOCK COMPANY (Cyrillic: БАНК ВТБ ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО)",
    "Sectoral Sanctions Identifications List Updates"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「SHANGHAI」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela-related General License 52C , \"Authorizing Certain Transactions Involving Petróleos de Venezuela, S.A.\" OFAC is also issuing one amended Venezuela-related Frequently Asked Question ( FAQ 1245 ). Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List and the Sectoral Sanctions Identifications List. Specially Designated Nationals List Updates The following changes have been made to OFAC's SDN List: VTB BANK PUBLIC JOINT STOCK COMPANY (Cyrillic: БАНК ВТБ ПУБЛИЧНОЕ АКЦИ…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260914"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：修订 3 条（changes have been made to OFAC's SDN List）；修订 2 条（changes have been made to OFAC's Sectoral Sanctions Identifi）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260914"
    },
    {
     "text": "其中地址/注册地涉中国的条目：VTB BANK PUBLIC JOINT STOCK COMPANY (Cyrillic: БАНК ВТБ ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО)（修订）、VTB BANK PUBLIC JOINT STOCK COMPANY (Cyrillic: БАНК ВТБ ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО)（修订）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260914"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260914",
   "pdf_url": "https://ofac.treasury.gov/media/936926/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:08"
   },
   "cn_parties": [
    {
     "name": "VTB BANK PUBLIC JOINT STOCK COMPANY (Cyrillic: БАНК ВТБ ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО)",
     "kind": "修订"
    },
    {
     "name": "VTB BANK PUBLIC JOINT STOCK COMPANY (Cyrillic: БАНК ВТБ ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО)",
     "kind": "修订"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-18576",
   "column": "rules",
   "action": "",
   "date": "2026-09-11",
   "agency": "OFAC",
   "doc_no": "2026-18576 / 91 FR 57795",
   "title": "Publication of Iran-Related Web General Licenses CC and DD.",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two Iran-related general licenses (GLs): GLs CC and DD, which were previously made available on OFAC's website upon issuance.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 57795；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/11/2026-18576/publication-of-iran-related-web-general-licenses-cc-and-dd",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-11/pdf/2026-18576.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-18572",
   "column": "rules",
   "action": "",
   "date": "2026-09-11",
   "agency": "OFAC",
   "doc_no": "2026-18572 / 91 FR 57791",
   "title": "Publication of Venezuela Sanctions Regulations Web General Licenses 50A and 51A",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two general licenses (GLs) issued pursuant to the Venezuela Sanctions Regulations: GLs 50A and 51A, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 57791；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 50A、51A 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/11/2026-18572/publication-of-venezuela-sanctions-regulations-web-general-licenses-50a-and-51a",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-11/pdf/2026-18572.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-18569",
   "column": "rules",
   "action": "",
   "date": "2026-09-11",
   "agency": "OFAC",
   "doc_no": "2026-18569 / 91 FR 57793",
   "title": "Publication of Venezuela Sanctions Regulations Web General Licenses 30B and 51.",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two general licenses (GLs) issued pursuant to the Venezuela Sanctions Regulations: GLs 30B and 51, each of which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 57793；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目；通用许可 30B、51 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/11/2026-18569/publication-of-venezuela-sanctions-regulations-web-general-licenses-30b-and-51",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-11/pdf/2026-18569.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-18565",
   "column": "rules",
   "action": "",
   "date": "2026-09-11",
   "agency": "OFAC",
   "doc_no": "2026-18565 / 91 FR 57791",
   "title": "Publication of Nicaragua Sanctions Regulations Web General License 5",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the Nicaragua Sanctions Regulations: GL 5, which was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 57791；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Nicaragua」项目；通用许可 5 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/11/2026-18565/publication-of-nicaragua-sanctions-regulations-web-general-license-5",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-11/pdf/2026-18565.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-18563",
   "column": "rules",
   "action": "",
   "date": "2026-09-11",
   "agency": "OFAC",
   "doc_no": "2026-18563 / 91 FR 57794",
   "title": "Publication of Global Terrorism Sanctions Regulations and Illicit Drug Trade Sanctions Regulations Web General License 35",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a general license (GL) issued pursuant to the Global Terrorism Sanctions Regulations and the Illicit Drug Trade Sanctions Regulations: GL 35. This GL was previously made available on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 57794；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Global Terrorism」项目；通用许可 35 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/11/2026-18563/publication-of-global-terrorism-sanctions-regulations-and-illicit-drug-trade-sanctions-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-11/pdf/2026-18563.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260910",
   "column": "lists",
   "action": "added",
   "date": "2026-09-10",
   "agency": "OFAC",
   "doc_no": "20260910",
   "title": "Iran-related and Counter Terrorism Designations; Licensing Policy Update under Operation Economic Outcast; Settlement Agreement between OFAC and an Individual",
   "parties": [
    "AL ABADA, Khaldoon Naser Maryoosh",
    "AL AMERI, Abdullah Nadhim Luaibi",
    "AL-DHUHAIBAWI, Hussein Ahmed Hussein",
    "AL-HRAISHAWI, Karrar Mohammed Qasim",
    "AL-LAMI, Ali Hasan Farhan",
    "AL-MAKANSI, Amir",
    "AL-MANDALAWI, Abdulhasan Ali Akbar Namdar",
    "AL-MANDALAWI, Majid Ali Akbar Namdar",
    "AL-SHAIKHLI, Mohamed Ameen Fadhil Ali",
    "AL-TAMEEMI, Abbas Jawad Kadhim",
    "HAMIEH, Abdallah",
    "IBRAHIM, Hussein (Arabic: حسين ابراهيم)",
    "WEHBE, Ghaith Hussein",
    "ZAHRELDINE, Mervat Jamil (Arabic: ميرفت جميل زهر الدين)",
    "AIN AL IRAQ FOR PROTECTION SYSTEMS TECHNOLOGY AND AUDIO",
    "AL BROUJ FOR GENERAL CONTRACTING COMPANY (Arabic: شركة البروج للمقاولات العامة محدود المسؤولية)",
    "GOLD PRO SARL",
    "SHAMS AND BAHR TRADING COMPANY L.L.C. (Arabic: شركة شمس وبحر للتجارة ذ م م)",
    "YOUSEF IBRAHIM MANSOUR AND PARTNER FOR EXCHANGE (Arabic: شركة یوسف ابراھیم منصور وشریكھ للصیرفة)"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "本条为混合行动：OFAC 列表标签为「Sanctions List Updates」，但标题含和解/处罚表述（Settlement/Penalty 类），故同时收录于「执法案例更新」视图；清单变动部分见本栏要点。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260910"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing a licensing policy update, an enforcement action, and updates to the list of Specially Designated Nationals and Blocked Persons (SDN List). Licensing Policy Update under Operation Economic Outcast OFAC's Iran-related specific licensing policy has been modified in furtherance of the U.S. Department of the Treasury-led Operation Economic Outcast . Effective immediately, OFAC is considering Iran-related specific license applications with a presumption of denial except as required by law or in certain circumstances…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260910"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 14 条（individuals have been added to OFAC's SDN List）；新增 5 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260910"
    },
    {
     "text": "和解/罚款金额：$1,427,230（详情页正文首个金额数字，口径以原文 PDF 为准）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260910"
    },
    {
     "text": "原文载：违规「未经自愿披露」（not voluntarily self-disclosed，含 largely not 等限定以原文为准）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260910"
    },
    {
     "text": "定性：egregious。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260910"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案要点：和解金额 $1,427,230；定性 egregious；未经自愿披露（含 largely not 等限定以原文为准）。执法公告所示金额、笔数与定性/VSD 情节可作为同类业务和解区间与披露策略的对照样本；具体裁量以执法文书为准。",
    "basis": "本案执法公告正文已解析字段 + OFAC 执法指南裁量因素框架"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260910",
   "pdf_url": "https://ofac.treasury.gov/media/936911/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 11:07"
   },
   "also_enforcement": true,
   "penalty": {
    "amount_usd": 1427230.0,
    "text": "$1,427,230",
    "suspended": false
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-18461",
   "column": "rules",
   "action": "",
   "date": "2026-09-10",
   "agency": "OFAC",
   "doc_no": "2026-18461 / 91 FR 57511",
   "title": "Iranian Transactions and Sanctions Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is indefinitely suspending three general licenses and one licensing policy issued pursuant to the Iranian Transactions and Sanctions Regulations to align with changes in the foreign policy of the United States towards Iran.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 57511；生效 2026-09-08。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/09/10/2026-18461/iranian-transactions-and-sanctions-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-09-10/pdf/2026-18461.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 11:07"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260909",
   "column": "lists",
   "action": "added",
   "date": "2026-09-09",
   "agency": "OFAC",
   "doc_no": "20260909",
   "title": "Transnational Criminal Organizations Designations; Counter Terrorism Designation; Issuance of New and Amended Frequently Asked Questions",
   "parties": [
    "ANWEN TECHNOLOGY CO",
    "LOS TIGUERONES",
    "SAFEW TECHNOLOGY CO",
    "XINBI GUARANTEE (Chinese Simplified: 新币担保)"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Chinese」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is amending several Frequently Asked Questions (FAQs) today ( 5 , 13 , 51 , 58 , 59 , 74 , 75 , 76 , 77 , and 78 ) as part of its ongoing process of reviewing published guidance to ensure information remains current. This batch includes review of OFAC's FAQ topic pages, OFAC Licenses, and Assessing OFAC Name Matches. OFAC is also publishing two new license-related FAQs ( FAQs 1269 and 1270 ). Specially Designated Nationals List Updates The following entities have been added to OFAC's SDN List:  ANWEN TECHNOLOGY CO., LTD.,…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260909"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 4 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260909"
    },
    {
     "text": "其中地址/注册地涉中国的条目：SAFEW TECHNOLOGY CO（新增）、XINBI GUARANTEE (Chinese Simplified: 新币担保)（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260909"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260909",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:08"
   },
   "cn_parties": [
    {
     "name": "SAFEW TECHNOLOGY CO",
     "kind": "新增"
    },
    {
     "name": "XINBI GUARANTEE (Chinese Simplified: 新币担保)",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260908",
   "column": "lists",
   "action": "added",
   "date": "2026-09-08",
   "agency": "OFAC",
   "doc_no": "20260908",
   "title": "Iran-related Designations; Counter Terrorism Designations; Updates to Iran-related General Licenses; Issuance of Counter Terrorism General License",
   "parties": [
    "MAHRAN, Ibrahim Ali Mohamed Mohamed",
    "AEROBRAVO AIRPLANE MANAGEMENT AND OPERATION LLC",
    "AIR SHIRAZ",
    "ASA JET AIRLINE",
    "ATA AIRLINES COMPANY",
    "ATLAS AVIATION GROUP",
    "AVA AIRLINES",
    "CHABAHAR AIRLINES COMPANY",
    "ECT AVIATION SUPPORT LLC (Arabic: إي سي تي أفيييشن سابورت ذ م م)",
    "ECT AVIATION SUPPORT LTD",
    "ERWAN AIRLINE COMPANY",
    "FLY KISH AIRLINES",
    "FLY PERSIA AIRLINES",
    "ICARGO SDN BHD",
    "IRAN AIR TOUR",
    "IRAN ASEMAN AIRLINES",
    "JSKY AIRLINES",
    "KARUN AIRLINES COMPANY",
    "KISH AIRLINES",
    "LAD AIRWAYS"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is implementing the following actions with regard to its Iran sanctions programs: Issuing Counter Terrorism General License 37 , \"Authorizing the Wind Down of Transactions Involving Certain Persons Blocked on September 8, 2026\" Publishing a Notice of Suspension of Certain Iranian Transactions and Sanctions Regulations General Licenses Iran General License J-1 , \"Authorizing the Reexportation of Certain Civil Aircraft to Iran on Temporary Sojourn and Related Transactions\" - Suspended as of September 08, 2026 Issuing Iran G…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260908"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 1 条（individual has been added to OFAC's SDN List）；新增 35 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260908"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260908",
   "pdf_url": "https://ofac.treasury.gov/media/936901/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:09"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260904",
   "column": "lists",
   "action": "added",
   "date": "2026-09-04",
   "agency": "OFAC",
   "doc_no": "20260904",
   "title": "Iran-related Designations; Issuance of Iran-related General License",
   "parties": [
    "GOLDEN GLOBAL PORTFOY YONETIMI ANONIM SIRKETI (Latin: GOLDEN GLOBAL PORTFÖY YÖNETİMİ ANONİM ŞİRKETİ)",
    "GOLDEN GLOBAL VARLIK KIRALAMA ANONIM SIRKETI (Latin: GOLDEN GLOBAL VARLIK KİRALAMA ANONİM ŞİRKETİ)",
    "GOLDEN GLOBAL YATIRIM BANKASI ANONIM SIRKETI (Latin: GOLDEN GLOBAL YATIRIM BANKASI ANONİM ŞİRKETİ)"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Iran General License CC , \"Authorizing the Wind Down of Transactions Involving Certain Persons Blocked on September 4, 2026.\" Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List.  Specially Designated Nationals List Updates The following entities have been added to OFAC's SDN List:  GOLDEN GLOBAL PORTFOY YONETIMI ANONIM SIRKETI (Latin: GOLDEN GLOBAL PORTFÖY YÖNETİMİ ANONİM ŞİRKETİ), Astoria D:21, N: 127A Esentepe Mahallesi, Buyukdere Caddesi, Sisli, Istanbul, Turkey; Websi…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260904"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 3 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260904"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260904",
   "pdf_url": "https://ofac.treasury.gov/media/936881/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:09"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260903",
   "column": "lists",
   "action": "revised",
   "date": "2026-09-03",
   "agency": "OFAC",
   "doc_no": "20260903",
   "title": "Cuba Designations; Russia-related Designation Removal; Issuance of Amended Cuba General License",
   "parties": [
    "CASTRO CALIS, Fidel Ernesto",
    "BANCO EXTERIOR DE CUBA",
    "COMERCIAL CUPET S.A",
    "EMPRESA DE SERVICIOS COMANDANTE RENE RAMOS LATOUR",
    "EMPRESA IMPORTADORA DE ABASTECIMIENTO PARA EL PETROLEO",
    "EMPRESA IMPORTADORA Y ABASTECEDORA DEL NIQUEL",
    "DULAC CAPITAL LTD",
    "PREDSTAVITELSTVO AKTSIONERNOGO OBSHCHESTVA DYULAK KEPITAL LTD SHVEITSARIYA V G SANKT PETERBURGE",
    "PREDSTAVITELSTVO AKTSIONERNOGO OBSHCHESTVA DYULAK KEPITAL LTD SHVEITSARIYA V G MOSCOW",
    "AK DYULAK KEPITAL LTD PREDSTAVITELSTVO"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Cuba General License 4A , \"Authorizing Transactions for Third-Country Diplomatic and Consular Missions in Cuba.\" Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The following individual has been added to OFAC's SDN List: CASTRO CALIS, Fidel Ernesto, Cuba; DOB 16 May 1995; nationality Cuba; Gender Male (individual) [CUBA-EO14404] (Linked To: CASTRO ESPIN, Alejandro). The following entities have been added to OFAC's SDN List: …",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260903"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 1 条（individual has been added to OFAC's SDN List）；新增 5 条（entities have been added to OFAC's SDN List）；删除 4 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260903"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260903",
   "pdf_url": "https://ofac.treasury.gov/media/936871/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:09"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260902",
   "column": "rules",
   "action": "",
   "date": "2026-09-02",
   "agency": "OFAC",
   "doc_no": "20260902",
   "title": "Reminder to file the 2026 Annual Report of Blocked Property; Issuance of Amended Venezuela-related General Licenses and Frequently Asked Question",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：On July 1, 2026, the Office of Foreign Assets Control (OFAC) issued a recent actions notice , reminding U.S. persons holding blocked property as of June 30, 2026, to file an Annual Report of Blocked Property (ARBP) no later than September 30, 2026. Failure to file the ARBP by September 30 may lead to an enforcement referral. For additional information, please review OFAC's Guidance on Filing the 2026 Annual Report of Blocked Property . Additionally, OFAC is issuing Venezuela-related General License 51D , \"Authorizing Certain Activities Involving Venezuelan-Origin Coal or Minerals, Including Go…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260902"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260902",
   "pdf_url": "https://ofac.treasury.gov/media/936866/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:09"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260828",
   "column": "lists",
   "action": "added",
   "date": "2026-08-28",
   "agency": "OFAC",
   "doc_no": "20260828",
   "title": "Iran-related and Counter Terrorism Designations",
   "parties": [
    "TAEEDI, Reza Mohammad (Arabic: محمد رضا تأیدی)",
    "KAMENG TRADING LIMITED"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Hong Kong」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individual has been added to OFAC's SDN List: TAEEDI, Reza Mohammad (Arabic: محمد رضا تأیدی), Dubai, United Arab Emirates; DOB 24 Aug 1975; nationality Iran; Additional Sanctions Information - Subject to Secondary Sanctions; Gender Male; Passport P6602606; alt. Passport E96037407; National ID No. 784-1975-3624749-3 (United Arab Emirates) (individual) [SDGT] [IFSR] (Linked To: BANK MELLI IRAN). The following entity has been added to OFAC's SDN List: KAMENG TRADING LIMITED, Room 701, Unit 108,7/F, Tower B, New Mandarin Plaza, 14 Science M…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260828"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 1 条（individual has been added to OFAC's SDN List）；新增 1 条（entity has been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260828"
    },
    {
     "text": "其中地址/注册地涉中国的条目：KAMENG TRADING LIMITED（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260828"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260828",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:35"
   },
   "cn_parties": [
    {
     "name": "KAMENG TRADING LIMITED",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-C1-2026-16628",
   "column": "rules",
   "action": "",
   "date": "2026-08-28",
   "agency": "BIS",
   "doc_no": "C1-2026-16628 / 91 FR 55457",
   "title": "Streamlining Export Controls for Drone Exports",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "文档类型 Rule；引文 91 FR 55457；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/28/C1-2026-16628/streamlining-export-controls-for-drone-exports",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-28/pdf/C1-2026-16628.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260827",
   "column": "rules",
   "action": "",
   "date": "2026-08-27",
   "agency": "OFAC",
   "doc_no": "20260827",
   "title": "Issuance of Amended Venezuela-related General Licenses and Associated Frequently Asked Questions",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela-related General License 46D , \"Authorizing Certain Activities Involving Venezuelan-Origin Oil or Petrochemical Products;\" Venezuela-related General License 47B , \"Authorizing the Sale of U.S.-Origin Diluents to Venezuela;\" Venezuela-related General License 48C , \"Authorizing the Supply of Certain Items and Services to Venezuela;\" Venezuela-related General License 50C , \"Authorizing Transactions Related to Oil or Gas Sector Operations in Venezuela of Certain Entities;\" Venezuela-related General License…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260827"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260827",
   "pdf_url": "https://ofac.treasury.gov/media/936841/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:35"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-17491",
   "column": "rules",
   "action": "",
   "date": "2026-08-27",
   "agency": "OFAC",
   "doc_no": "2026-17491 / 91 FR 55265",
   "title": "Publication of Iran-Related Web General Licenses AA and BB",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing two Iran-related general licenses (GLs): GLs AA and BB, which were previously made available on OFAC's website upon issuance.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 55265；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/27/2026-17491/publication-of-iran-related-web-general-licenses-aa-and-bb",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-27/pdf/2026-17491.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-17487",
   "column": "rules",
   "action": "",
   "date": "2026-08-27",
   "agency": "OFAC",
   "doc_no": "2026-17487 / 91 FR 55265",
   "title": "Publication of a Determination Issued Pursuant to Executive Order 13902.",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is publishing a sector determination pursuant to a January 10, 2020 Executive Order. The determination was previously issued on OFAC's website.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 55265；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/27/2026-17487/publication-of-a-determination-issued-pursuant-to-executive-order-13902",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-27/pdf/2026-17487.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260826",
   "column": "lists",
   "action": "added",
   "date": "2026-08-26",
   "agency": "OFAC",
   "doc_no": "20260826",
   "title": "Counter Terrorism Designations; Issuance of Counter Terrorism General License; Issuance of Amended Russia-related General License",
   "parties": [
    "ABDULNASSER, Zaid",
    "ALSAGHEER, Rawa",
    "AUTISTICI INVENTATI",
    "MASAR BADIL",
    "PALESTINE ACTION"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Counter Terrorism General License 36 , \"Authorizing the Wind Down of Transactions Involving Autistici Inventati.\" Additionally, OFAC is issuing Russia-related General License 104B , \"Authorizing Transactions Related to Imports of Certain Diamonds Prohibited by Executive Order 14068.\" Finally, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List:  ABDULNASSER, Zaid (a.k.a. \"TAMIM, Zid…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260826"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 2 条（individuals have been added to OFAC's SDN List）；新增 3 条（entities have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260826"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260826",
   "pdf_url": "https://ofac.treasury.gov/media/936796/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:35"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-17426",
   "column": "rules",
   "action": "",
   "date": "2026-08-26",
   "agency": "OFAC",
   "doc_no": "2026-17426 / 91 FR 54957",
   "title": "Iranian Transactions and Sanctions Regulations",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is indefinitely suspending five general licenses issued pursuant to the Iranian Transactions and Sanctions Regulations to align with changes in the foreign policy of the United States towards Iran.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 54957；生效 2026-08-24。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/26/2026-17426/iranian-transactions-and-sanctions-regulations",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-26/pdf/2026-17426.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260824",
   "column": "lists",
   "action": "revised",
   "date": "2026-08-24",
   "agency": "OFAC",
   "doc_no": "20260824",
   "title": "Removal of Syria's designation as a State Sponsor of Terrorism and Associated Sanctions List Updates; Iran-related Designations; Updates to Iran-related General Licenses",
   "parties": [
    "BALUJEH, Saber Shahbazi (Arabic: صابر شهبازی بالوجه)",
    "BEKGOZ, Cengiz",
    "BLAGH, Keyvan Fayyaz Gareh (Arabic: کیوان کریمی)",
    "DADASHOVA, Narmina",
    "FARAHI, Mohsen",
    "FATTOUH, Mohammad Ahmed Suhil (Arabic: محمد أحمد سهيل فتوح)",
    "GANDHI, Mansoor Tayabbhai",
    "GARG, Prashant",
    "GHAL'EH-KUHI, Mojtaba (Arabic: مجتبی قلعه کوهی)",
    "HATAMI, Amir (Arabic: امير حاتمی)",
    "KADKHODA'I, Mohammad Reza (Arabic: محمدرضا کدخدائی)",
    "KAHZADIAN, Arman (Arabic: آرمان کهزادیان)",
    "LI, Na (Chinese Simplified: 李娜)",
    "MOGHADDAM, Mohammad Hossein Aslani",
    "OBUKHOV, Ivan",
    "RANGI, Harish Ramchandra",
    "SHEKH, Indrismiya Asharafmiya",
    "TALAEI NIK, Reza (Arabic: رضا طلايی نيک)",
    "TIAN, Jianbai (Chinese Simplified: 天健栢)",
    "TSORIS, Almpertos"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Chinese」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：In line with President Trump's promise to deliver sanctions relief to Syria, the U.S. Department of State today removed Syria's designation as a State Sponsor of Terrorism. Accordingly, Syria is no longer subject to prohibitions under the Terrorism List Governments Sanctions Regulations, 31 CFR part 596 (TLGSR) , or 22 USC 7205(a)(1). The U.S. Department of State also revoked the designation of al-Nusrah Front, also known as Hay'at Tahrir al-Sham (HTS), as a Specially Designated Global Terrorist (SDGT) organization. Concurrently, the U.S. Department of the Treasury's Office of Foreign Assets C…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260824"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 23 条（individuals have been added to OFAC's SDN List）；新增 48 条（entities have been added to OFAC's SDN List）；新增 6 条（vessels have been added to OFAC's SDN List）；修订 22 条（changes have been made to OFAC's SDN List）；删除 109 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260824"
    },
    {
     "text": "其中地址/注册地涉中国的条目：LI, Na (Chinese Simplified: 李娜)（新增）、OBUKHOV, Ivan（新增）、TIAN, Jianbai (Chinese Simplified: 天健栢)（新增）、ZHANG, Limei (Chinese Simplified: 张丽美)（新增）、BOSITONG SUPPLY CHAIN SHENZHEN CO LTD (Chinese Simplified: 波斯通供应链深圳有限公司)（新增）、BRE INTERNATIONAL LOGISTICS CORPORATION HK LIMITED (Chinese Traditional: 波斯通香港國際物流有限公司)（新增）、CLEVER SHIPPING LIMITED (Chinese Traditional: 智運航運有限公司)（新增）、DEC PHOTONICS LIMITED (Chinese Traditional: 迪信光電有限公司)（新增）、FEILI CO LIMITED (Chinese Traditional: 乏得有限公司)（新增）、FEISU LIMITED (Chinese Traditional: 沸俗有限公司)（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260824"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260824",
   "pdf_url": "https://ofac.treasury.gov/media/936751/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:36"
   },
   "cn_parties": [
    {
     "name": "LI, Na (Chinese Simplified: 李娜)",
     "kind": "新增"
    },
    {
     "name": "OBUKHOV, Ivan",
     "kind": "新增"
    },
    {
     "name": "TIAN, Jianbai (Chinese Simplified: 天健栢)",
     "kind": "新增"
    },
    {
     "name": "ZHANG, Limei (Chinese Simplified: 张丽美)",
     "kind": "新增"
    },
    {
     "name": "BOSITONG SUPPLY CHAIN SHENZHEN CO LTD (Chinese Simplified: 波斯通供应链深圳有限公司)",
     "kind": "新增"
    },
    {
     "name": "BRE INTERNATIONAL LOGISTICS CORPORATION HK LIMITED (Chinese Traditional: 波斯通香港國際物流有限公司)",
     "kind": "新增"
    },
    {
     "name": "CLEVER SHIPPING LIMITED (Chinese Traditional: 智運航運有限公司)",
     "kind": "新增"
    },
    {
     "name": "DEC PHOTONICS LIMITED (Chinese Traditional: 迪信光電有限公司)",
     "kind": "新增"
    },
    {
     "name": "FEILI CO LIMITED (Chinese Traditional: 乏得有限公司)",
     "kind": "新增"
    },
    {
     "name": "FEISU LIMITED (Chinese Traditional: 沸俗有限公司)",
     "kind": "新增"
    },
    {
     "name": "GUSKA CO LIMITED (Chinese Traditional: 谷思卡有限公司)",
     "kind": "新增"
    },
    {
     "name": "HK JIATAI TECHNOLOGY LIMITED (Chinese Traditional: 香港嘉泰科技有限公司)",
     "kind": "新增"
    },
    {
     "name": "LILIMOON NAVIGATION INC",
     "kind": "新增"
    },
    {
     "name": "MINVUR LIMITED (Chinese Traditional: 明霧有限公司)",
     "kind": "新增"
    },
    {
     "name": "MT TRADING AND LOGISTICS HK LIMITED (Chinese Traditional: 尚乘商貿物流有限公司)",
     "kind": "新增"
    },
    {
     "name": "RIQUEZA GROUP LTD",
     "kind": "新增"
    },
    {
     "name": "RPT TECHNOLOGY LIMITED (Chinese Traditional: 瑞普達科技有限公司)",
     "kind": "新增"
    },
    {
     "name": "SELENIUM RESOURCES LIMITED",
     "kind": "新增"
    },
    {
     "name": "SHENZHEN BOSITONG LOGISTICS CO LTD (Chinese Simplified: 深圳波斯通物流有限公司)",
     "kind": "新增"
    },
    {
     "name": "SHENZHEN HUAMEI LIANYUN INTERNATIONAL LOGISTICS CO LTD (Chinese Simplified: 深圳市华美联运国际物流有限公司)",
     "kind": "新增"
    },
    {
     "name": "SHENZHEN SWEET OCEAN TECHNOLOGY LIMITED (Chinese Simplified: 深圳市晨涛科技有限公司)",
     "kind": "新增"
    },
    {
     "name": "SHIPOIL LIMITED",
     "kind": "新增"
    },
    {
     "name": "SKY OIL AND GAS ASIA LIMITED (Chinese Traditional: 天石油天然氣亞洲有限公司)",
     "kind": "新增"
    },
    {
     "name": "SWEET OCEAN INDUSTRIAL LIMITED (Chinese Traditional: 思源實業有限公司)",
     "kind": "新增"
    },
    {
     "name": "TIANY TECHNOLOGY LIMITED (Chinese Traditional: 天毅科技有限公司)",
     "kind": "新增"
    },
    {
     "name": "VIENNA SHIPPING CO",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-17231",
   "column": "lists",
   "action": "revised",
   "date": "2026-08-24",
   "agency": "BIS",
   "doc_no": "2026-17231 / 91 FR 54658",
   "title": "Revisions to the Entity List",
   "parties": [
    "Arrow China Electronics Trading Co., Ltd"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Hong Kong」（全文检索）"
   },
   "points": [
    {
     "text": "In this rule, the Bureau of Industry and Security (BIS) revises the Export Administration Regulations (EAR) by removing two addresses associated with Arrow Electronics (Hong Kong) Co., Ltd. from the Entity List under the destination of China, People's Republic of (China). This determination follows the removal from the Entity List of Arrow China Electronics Trading Co., Ltd., and the removal of six aliases for Arrow Electronics (Hong Kong) Co., Ltd. in November 2025.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "数量（原文句摘录）：…IS) revises the Export Administration Regulations (EAR) by removing two addresses associated with Arrow Electronics (Hong… → 移除 2 个addresses。",
     "layer": "external",
     "source": "https://www.federalregister.gov/documents/full_text/text/2026/08/24/2026-17231.txt"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 54658；生效 2026-08-21。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "实体清单变动直接影响涉美出口/再出口/境内转让：清单主体交易须按该规则所载许可要求与许可政策申请 BIS 许可（多数为推定拒绝）。相关中企及其供应链应核对清单条目、更新筛查。",
    "basis": "EAR §744.16（实体清单许可要求）+ 本规则原文的许可政策列"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/24/2026-17231/revisions-to-the-entity-list",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-24/pdf/2026-17231.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "cn_parties": [
    {
     "name": "Arrow China Electronics Trading Co., Ltd",
     "kind": "修订"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-17230",
   "column": "lists",
   "action": "removed",
   "date": "2026-08-24",
   "agency": "BIS",
   "doc_no": "2026-17230 / 91 FR 54657",
   "title": "Removal From the Entity List",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "In this rule, the Bureau of Industry and Security (BIS) amends the Export Administration Regulations (EAR) by removing one entity from the Entity List under the destination of Turkey.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "数量（原文句摘录）：…BIS) amends the Export Administration Regulations (EAR) by removing one entity from the Entity List under the destina… → 移除 1 个entity。",
     "layer": "external",
     "source": "https://www.federalregister.gov/documents/full_text/text/2026/08/24/2026-17230.txt"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 54657；生效 2026-08-21。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "实体清单变动直接影响涉美出口/再出口/境内转让：清单主体交易须按该规则所载许可要求与许可政策申请 BIS 许可（多数为推定拒绝）。相关中企及其供应链应核对清单条目、更新筛查。",
    "basis": "EAR §744.16（实体清单许可要求）+ 本规则原文的许可政策列"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/24/2026-17230/removal-from-the-entity-list",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-24/pdf/2026-17230.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "bis-press-release-bis-reaches-administrative-enforcement-settlement-container-manufa",
   "column": "enforcement",
   "action": "",
   "date": "2026-08-24",
   "agency": "BIS",
   "doc_no": "",
   "title": "BIS Reaches Administrative Enforcement Settlement with Container Manufacturing Ltd.",
   "parties": [
    "Container Manufacturing Ltd"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「China」（全文检索）"
   },
   "points": [
    {
     "text": "栏目标签：Enforcement（BIS 新闻页）。",
     "layer": "external",
     "source": "BIS news-updates"
    },
    {
     "text": "民事罚款：$1,000,000（和解命令原文）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/container-manufacturing-ltd-8-24-2026.pdf"
    },
    {
     "text": "违规总数：10 笔（和解命令原文：committed ten (10) violations）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/container-manufacturing-ltd-8-24-2026.pdf"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案（罚款 $1,000,000；违规 10 笔；未见自愿披露表述）显示执法按「行为类型 × 条款」分组累计笔数，持续性的后续传输/服务可逐笔计为独立违规；VSD 与缓期执行（suspended）安排直接影响实际缴付金额，和解区间与披露策略可据本案对照。",
    "basis": "本案和解命令 Statement of Charges 分组与罚款/缓期条款（PDF 原文）+ EAR §764.2、§766.18 和解框架"
   },
   "url": "https://www.bis.gov/press-release/bis-reaches-administrative-enforcement-settlement-container-manufacturing-ltd.",
   "pdf_url": "https://www.bis.gov/media/documents/container-manufacturing-ltd-8-24-2026.pdf",
   "source": {
    "channel": "BIS news-updates",
    "retrieved_at": "2026-10-23 10:38"
   },
   "penalty": {
    "amount_usd": 1000000.0,
    "text": "$1,000,000",
    "suspended": false
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260821",
   "column": "rules",
   "action": "",
   "date": "2026-08-21",
   "agency": "OFAC",
   "doc_no": "20260821",
   "title": "Issuance of Venezuela-related General Licenses and Associated Frequently Asked Question",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela General License 61 - Authorizing the Supply of Certain Items and Services to Venezuela Related to Telecommunications, and Venezuela General License 62 - Authorizing Negotiations of and Entry Into Contingent Contracts for Investment in the Telecommunications Sector of Venezuela.  Additionally, OFAC is issuing one new Venezuela-related Frequently Asked Question ( FAQ 1266 ).",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260821"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260821",
   "pdf_url": "https://ofac.treasury.gov/media/936741/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:36"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260820",
   "column": "lists",
   "action": "added",
   "date": "2026-08-20",
   "agency": "OFAC",
   "doc_no": "20260820",
   "title": "Counter Narcotics, Counter Terrorism, Cuba-related, and Iran-related Designations; Issuance of Russia-related General License; Issuance of Associated Frequently Asked Questions",
   "parties": [
    "ACUR, Mehmet",
    "AKYUZ, Mehmet",
    "AKYUZ, Vasfi",
    "ALARCON HOLGUIN, Jimmy Leonidas",
    "AYAZ, Emrah",
    "DEDE, Onder",
    "KACMAZ, Halil Ibrahim",
    "MARTINEZ FREIRE, Leima",
    "MARTINEZ MENDOZA, Milton Edixson",
    "MERO ARCENTALES, Edwar Alexis",
    "MERO ARCENTALES, Roberth Alfonso",
    "MERO BERMELLO, Byron Aladino",
    "MERO FRANCO, Julio Javier",
    "MERO MERO, Alfonso",
    "MOUSAFAR, Masoud",
    "RABAZA FERNANDEZ, Noemi Ramona",
    "SAVCI, Gulay Kaya",
    "VERA LAZ, Jhonny Francisco",
    "YILMAZ, Yunus Alper",
    "ACINOX COMERCIAL"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Russia-related General License 131I , \"Authorizing Certain Transactions for the Negotiation of and Entry Into Contingent Contracts for the Sale of Lukoil International GmbH and Related Maintenance Activities.\" In addition, OFAC is amending two associated, Russia-related Frequently Asked Questions ( FAQs 1224 and 1225 ) and one Cuba-related Frequently Asked Question ( FAQ 1265 ). Lastly, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The …",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260820"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 19 条（individuals have been added to OFAC's SDN List）；新增 16 条（entities have been added to OFAC's SDN List）；新增 10 条（vessels have been added to OFAC's SDN List）；修订 4 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260820"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260820",
   "pdf_url": "https://ofac.treasury.gov/media/936731/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:36"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260818",
   "column": "lists",
   "action": "added",
   "date": "2026-08-18",
   "agency": "OFAC",
   "doc_no": "20260818",
   "title": "International Criminal Court-related Designations; Venezuela-related Designation; Issuance of International Criminal Court-related General License",
   "parties": [
    "AKANE, Tomoko",
    "SEYE, Abdoulaye",
    "BLUWAVES PROPERTIES LIMITED"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing International Criminal Court-related General License 12 , \"Authorizing the Wind Down of Transactions Involving Certain Persons Blocked on August 18, 2026.\"  Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: AKANE, Tomoko, Netherlands; DOB 28 Jun 1956; POB Aichi, Japan; nationality Japan; Gender Female; Passport RA3001686 (…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260818"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 2 条（individuals have been added to OFAC's SDN List）；新增 1 条（entity has been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260818"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260818",
   "pdf_url": "https://ofac.treasury.gov/media/936716/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:36"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-16628",
   "column": "rules",
   "action": "",
   "date": "2026-08-14",
   "agency": "BIS",
   "doc_no": "2026-16628 / 91 FR 52501",
   "title": "Streamlining Export Controls for Drone Exports",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Bureau of Industry and Security (BIS) is easing export controls on certain Unmanned Aerial Vehicles (UAVs or drones) and related parts, components, accessories, attachments, technology, and software under the Export Administration Regulations (EAR). Specifically, this rule: eliminates wind gust tolerance as a parameter for determining UAV controls under the EAR; increases the threshold for national security controls on certain UAVs from an endurance of 30 minutes to an endurance of 3 hours; makes conforming changes to remove national security controls on software and technology associated with UAVs with an endurance less than 3 hours; maintains military end-use and end-user controls on those lower endurance drones and associated software and technology; clarifies Commerce Control List (CCL) controls for certain UAVs specially designed for military use; and removes national security controls on certain specially designed parts, components, accessories, and attachments for such UAVs as they do not provide any significant military or intelligence capabilities.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 52501；生效 2026-08-13。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/14/2026-16628/streamlining-export-controls-for-drone-exports",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-14/pdf/2026-16628.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "bis-press-release-bis-reaches-administrative-enforcement-settlement-plexon-inc",
   "column": "enforcement",
   "action": "",
   "date": "2026-08-14",
   "agency": "BIS",
   "doc_no": "",
   "title": "BIS Reaches Administrative Enforcement Settlement with Plexon, Inc.",
   "parties": [
    "Plexon, Inc"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「China」（全文检索）"
   },
   "points": [
    {
     "text": "栏目标签：Enforcement（BIS 新闻页）。",
     "layer": "external",
     "source": "BIS news-updates"
    },
    {
     "text": "违规笔数与条款：8 笔 × Export Administration Regulations（指控文书口径）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/plexon-inc.-8-14-2026.pdf"
    },
    {
     "text": "涉案清单对手方（原文）：Omniplex systems（Entity List）。",
     "layer": "external",
     "source": "https://www.bis.gov/media/documents/plexon-inc.-8-14-2026.pdf"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案（对手方 Omniplex systems（Entity List）；未见自愿披露表述）显示执法按「行为类型 × 条款」分组累计笔数，持续性的后续传输/服务可逐笔计为独立违规；VSD 与缓期执行（suspended）安排直接影响实际缴付金额，和解区间与披露策略可据本案对照。",
    "basis": "本案和解命令 Statement of Charges 分组与罚款/缓期条款（PDF 原文）+ EAR §764.2、§766.18 和解框架"
   },
   "url": "https://www.bis.gov/press-release/bis-reaches-administrative-enforcement-settlement-plexon-inc.",
   "pdf_url": "https://www.bis.gov/media/documents/plexon-inc.-8-14-2026.pdf",
   "source": {
    "channel": "BIS news-updates",
    "retrieved_at": "2026-10-23 10:38"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260812",
   "column": "enforcement",
   "action": "",
   "date": "2026-08-12",
   "agency": "OFAC",
   "doc_no": "20260812",
   "title": "Settlement Agreement between the U.S. Department of the Treasury's Office of Foreign Assets Control and Rice Lake Weighing Systems, Inc.",
   "parties": [
    "Rice Lake Weighing Systems, Inc"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Enforcement Actions（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "和解/罚款金额：$60,764（详情页正文首个金额数字，口径以原文 PDF 为准）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260812"
    },
    {
     "text": "涉及制裁项目（原文）：OFAC sanctions on Iran。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260812"
    },
    {
     "text": "原文提及自愿披露（voluntarily self-disclosed）情节，是否构成 VSD 及程度以执法文书为准。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260812"
    },
    {
     "text": "定性：non-egregious。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260812"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本案要点：和解金额 $60,764；涉及 OFAC sanctions on Iran；定性 non-egregious；原文提及自愿披露情节，程度以执法文书为准。执法公告所示金额、笔数与定性/VSD 情节可作为同类业务和解区间与披露策略的对照样本；具体裁量以执法文书为准。",
    "basis": "本案执法公告正文已解析字段 + OFAC 执法指南裁量因素框架"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260812",
   "pdf_url": "https://ofac.treasury.gov/media/936706/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 11:09"
   },
   "penalty": {
    "amount_usd": 60764.0,
    "text": "$60,764",
    "suspended": false
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260807",
   "column": "lists",
   "action": "revised",
   "date": "2026-08-07",
   "agency": "OFAC",
   "doc_no": "20260807",
   "title": "Counter Terrorism and Iran-related Designations; Counter Narcotics Designations Removals; Issuance of Amended Iran-related Frequently Asked Question",
   "parties": [
    "GHASEMPOUR, Saeed (Arabic: سعید قاسم پور)",
    "HENDI, Amir (Arabic: امیر هندی)",
    "KAYVANPOUR, Siavash",
    "MOHAMMAD, Peivand",
    "SHARIFI, Shima (Arabic: شیما شریفی)",
    "ABAN TETHER EXCHANGE (Arabic: صرافی آبان تتر)",
    "ALPS INTERNATIONAL L.L.C-FZ",
    "AYDENIZ GENERAL TRADING L.L.C",
    "BLUE DASH GENERAL TRADING COMPANY LIMITED",
    "CAILAFANG PTE. LTD",
    "CRYPTO HOME DMCC (Arabic: كريبتو هوم م.د.م.س)",
    "GLEAMING HK TRADING LIMITED",
    "NFT HOME DMCC (Arabic: إن إف تي هوم م.د.م.س)",
    "OVIEDO OVERSEAS COMPANY LIMITED",
    "SHELBIT GENERAL TRADING LLC (Arabic: شيلبيت للتجارة العامة ش.ذ.م.م)",
    "SHPS SHELBIT",
    "TITAN EXCHANGE",
    "SATIZABAL RENGIFO",
    "\"PELO DE COBRE\"",
    "AYALA BARRERA"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Hong Kong」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing an amended Iran-related Frequently Asked Question, FAQ 1257 . Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: GHASEMPOUR, Saeed (Arabic: سعید قاسم پور) (a.k.a. GHASEMPUR, Sa'id), Iran; DOB 10 Feb 1980; POB Babol, Iran; nationality Iran; Additional Sanctions Information - Subject to Secondary Sanctions; Gender Male; National ID No. 2060455065 (Iran) (individual) [I…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260807"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 5 条（individuals have been added to OFAC's SDN List）；新增 13 条（entities have been added to OFAC's SDN List）；删除 11 条（deletions have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260807"
    },
    {
     "text": "其中地址/注册地涉中国的条目：BLUE DASH GENERAL TRADING COMPANY LIMITED（新增）、GLEAMING HK TRADING LIMITED（新增）、OVIEDO OVERSEAS COMPANY LIMITED（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260807"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260807",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:36"
   },
   "cn_parties": [
    {
     "name": "BLUE DASH GENERAL TRADING COMPANY LIMITED",
     "kind": "新增"
    },
    {
     "name": "GLEAMING HK TRADING LIMITED",
     "kind": "新增"
    },
    {
     "name": "OVIEDO OVERSEAS COMPANY LIMITED",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260806",
   "column": "lists",
   "action": "added",
   "date": "2026-08-06",
   "agency": "OFAC",
   "doc_no": "20260806",
   "title": "Cuba-related Designations; Issuance of Cuba-related Frequently Asked Question",
   "parties": [
    "BIOSCA GALLEGO, Oscar Enrique",
    "MILIAN GOMEZ, Monica",
    "PEREZ CORTES, Waldo",
    "REMON RODRIGUEZ, Jose Antonio",
    "SANCHEZ ALLEYNE, Heriberto",
    "VICIANA MOUSSET, Roberto Jesus",
    "EMPRESA CUBANA EXPORTADORA E IMPORTADORA DE SERVICIOS",
    "EMPRESA CUBANA IMPORTADA Y EXPORTADA DE PRODUCTOS TECNICOS",
    "EMPRESA MILITAR INDUSTRIAL YURI GAGARIN",
    "SOCIEDAD MERCANTIL DUNA SA",
    "UNION DE INDUSTRIA MILITAR",
    "LEGRA SOTOLONGO",
    "LOPEZ MIERA"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Beijing」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing a new Cuba-related Frequently Asked Question, FAQ 1264 . Additionally, OFAC has updated the Specially Designated Nationals and Blocked Persons List. Specially Designated Nationals List Updates The following individuals have been added to OFAC's SDN List: BIOSCA GALLEGO, Oscar Enrique, Cuba; DOB 01 Jul 1958; POB Holguin, Cuba; nationality Cuba; Gender Male; Passport A011514 (Cuba) expires 14 Sep 2029 (individual) [CUBA-EO14404].  MILIAN GOMEZ, Monica, Moscow, Russia; DOB 13 Dec 1963; POB Havana, Cuba; nationalit…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260806"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 6 条（individuals have been added to OFAC's SDN List）；新增 5 条（entities have been added to OFAC's SDN List）；修订 4 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260806"
    },
    {
     "text": "其中地址/注册地涉中国的条目：PEREZ CORTES, Waldo（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260806"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260806",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:37"
   },
   "cn_parties": [
    {
     "name": "PEREZ CORTES, Waldo",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-16078",
   "column": "rules",
   "action": "",
   "date": "2026-08-06",
   "agency": "BIS",
   "doc_no": "2026-16078 / 91 FR 50701",
   "title": "DPAS Directive Allocation Order and Additional Requirements for Recoverable Critical Minerals and Materials",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Bureau of Industry and Security (\"BIS\") is publishing this temporary final rule to restrict the exportation of black mass and tungsten waste and scrap without a license. Specifically, as of August 27, 2026, U.S. persons engaged in the sale of black mass and tungsten waste and scrap must allocate 100 percent of monthly sales to U.S. persons, unless an adjustment or exception is obtained in advance from BIS. This action is taken pursuant to section 101 of the Defense Production Act of 1950, as amended (\"DPA\" or the \"Act\"), the Defense Priorities and Allocations System (15 CFR part 700) and Presidential Determination Pursuant to Section 101 of the Defense Production Act of 1950, as Amended, on Recoverable Critical Minerals and Materials, dated July 30, 2026 (\"DPA Determination on Recoverable CMMs\"), in which the President authorized the Department of Commerce (\"Commerce\") to address the scarcity of recoverable critical minerals and materials (\"CMMs\"). BIS invites the public to submit comments on whether any additional sales requirements are necessary or appropriate to promote the national defense.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 50701；生效 2026-08-27。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/06/2026-16078/dpas-directive-allocation-order-and-additional-requirements-for-recoverable-critical-minerals-and",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-06/pdf/2026-16078.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260805",
   "column": "lists",
   "action": "revised",
   "date": "2026-08-05",
   "agency": "OFAC",
   "doc_no": "20260805",
   "title": "Counter Terrorism Designations Removals and Update",
   "parties": [
    "FLY BAGHDAD AIRLINES COMPANY",
    "AL-SHABBANI, Basheer Abdulkadhim Alwan"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following deletions have been made to OFAC's SDN List:  FLY BAGHDAD AIRLINES COMPANY (a.k.a. FLY BAGHDAD (Arabic: فلاي بغداد); a.k.a. IRAQ EXPRESS), Hurriya Square, Building 66, Street 25, Sector 925, Babil Neighborhood, Baghdad, Iraq; Jamia Street, Jadriya, Baghdad, Iraq; Secondary sanctions risk: section 1(b) of Executive Order 13224, as amended by Executive Order 13886; Organization Established Date 2014; Organization Type: Passenger air transport [SDGT] (Linked To: ISLAMIC REVOLUTIONARY GUARD CORPS (IRGC)-QODS FORCE).  IRAQ EXPRESS (a.k.a. FL…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260805"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 2 条（deletions have been made to OFAC's SDN List）；修订 2 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260805"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260805",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:37"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260803",
   "column": "rules",
   "action": "",
   "date": "2026-08-03",
   "agency": "OFAC",
   "doc_no": "20260803",
   "title": "Issuance of Amended Venezuela-related General License and Frequently Asked Question",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：General Licenses（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：The Department of the Treasury's Office of Foreign Assets Control (OFAC) is issuing Venezuela-related General License 5Y , \"Authorizing Certain Transactions Related to the Petróleos de Venezuela, S.A. 2020 8.5 Percent Bond on or After September 17, 2026.\" Additionally, OFAC is issuing one amended Venezuela-related Frequently Asked Question, FAQ 595 .",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260803"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "「Venezuela」项目 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260803",
   "pdf_url": "https://ofac.treasury.gov/media/936651/download?inline",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:37"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-15628",
   "column": "lists",
   "action": "added",
   "date": "2026-08-03",
   "agency": "DHS/FLETF",
   "doc_no": "2026-15628 / 91 FR 48913",
   "title": "Notice Regarding the Uyghur Forced Labor Prevention Act Entity List",
   "parties": [
    "Xinjiang Communications Construction Group Co., Ltd",
    "Xinjiang Nuziline Bio-Pharmaceutical Co., Ltd",
    "Xinjiang Tianyun Organic Agriculture Co., Ltd",
    "Zhengzhou Synear Food Co., Ltd",
    "Alar Nanjiang Carbon New Material Co., Ltd",
    "Aksu Aodu Sugar Industry Co., Ltd",
    "Baiyin Nonferrous Group Co., Ltd",
    "Baoji Jucheng Titanium Industry Co., Ltd",
    "Chacha Food Company, Limited",
    "Chalkis Health Industry Co., Ltd",
    "Fujian Septwolves Industry Co., Ltd",
    "Guangxi Kelun Pharmaceutical Co., Ltd",
    "Henan Guorong Electronic Technology Co., Ltd",
    "Henan Tongzhou Cotton Industry Co., Ltd",
    "Hunan Aihua Group Co., Ltd",
    "Jiangsu Tiangong Technology Co., Ltd",
    "Jiangyin Xinren Aluminum Foil Technology Co., Ltd",
    "Jiangyin Xinren Aluminum Technology Co., Ltd",
    "Kashgar Aodu Sugar Industry Co., Ltd",
    "Kashgar Jiangguoguo Agricultural Technology Co., Ltd",
    "Nanjing Lilai Pharmaceutical Technology Co., Ltd",
    "SDIC Xinjiang Lithium Industry Co., Ltd",
    "SDIC Xinjiang Luobupo Potash Co., Ltd",
    "Shandong Gold Mining Co., Ltd",
    "Shandong Gold Smelting Co., Ltd",
    "Shandong Weiqiao Pioneering Group Co., Ltd",
    "Shandong Weiqiao Textile Technology Co., Ltd",
    "Shihezi Xinren Battery Aluminum Foil Technology Co., Ltd",
    "TBEA Co., Ltd",
    "Tefeng Pharmaceutical Co., Ltd",
    "Tianshan Aluminum Group Co., Ltd",
    "Xinjiang Baiyin Mining Development Co., Ltd",
    "Xinjiang Biochemical Pharmaceutical Co., Ltd",
    "Xinjiang Huashidan Pharmaceutical Co., Ltd",
    "Xinjiang Jinchuan Mining Industry Co., Ltd",
    "Xinjiang Production and Construction Corps Eighth Division Tianshan Aluminum Co., Ltd",
    "Xinjiang Tefeng Pharmaceutical Industry Co., Ltd",
    "Xinjiang Tianchi Energy Co., Ltd",
    "Xinjiang Tianhongji Technology Co., Ltd",
    "Xinjiang Tianshan Snow Lotus Pharmaceutical Co., Ltd",
    "Xinjiang Tianshan Yingda Carbon Co., Ltd",
    "Xinjiang Tianzhan New Material Technology Co., Ltd",
    "Yili Chuanning Biotechnology Co., Ltd",
    "Xinjiang GCL New Energy Material Technology, Co. Ltd",
    "Xinjiang Tianmian Foundation Textile Co., Ltd"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "UFLPA 列入通知，法律依据为涉疆强迫劳动条款"
   },
   "points": [
    {
     "text": "The U.S. Department of Homeland Security (DHS), as the Chair of the Forced Labor Enforcement Task Force (FLETF), announces the publication and availability of the updated Uyghur Forced Labor Prevention Act (UFLPA) Entity List, a consolidated register of the four lists required to be developed and maintained pursuant to the UFLPA, on the DHS UFLPA website. The updated UFLPA Entity List is also published as an appendix to this notice. This update adds forty-three new entities to the UFLPA Entity List, two of which appear on two separate sub-lists. In addition, this update includes technical corrections to two existing entities on the UFLPA Entity List. Details related to the process for revising the UFLPA Entity List are included in this Federal Register notice.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "数量（原文句摘录）：…also published as an appendix to this notice. This update adds forty-three new entities to the UFLPA Entity List, two of which… → 新增 43 个entities。",
     "layer": "external",
     "source": "https://www.federalregister.gov/documents/full_text/text/2026/08/03/2026-15628.txt"
    },
    {
     "text": "数量（原文句摘录）：…st is available as an appendix to this notice. This update adds four entities to the section 2(d)(2)(B)(ii) list of… → 新增 4 个entities。",
     "layer": "external",
     "source": "https://www.federalregister.gov/documents/full_text/text/2026/08/03/2026-15628.txt"
    },
    {
     "text": "数量（原文句摘录）：…of the Xinjiang Uyghur Autonomous Region. This update also adds forty-one entities to the section 2(d)(2)(B)(v) list of th… → 新增 41 个entities。",
     "layer": "external",
     "source": "https://www.federalregister.gov/documents/full_text/text/2026/08/03/2026-15628.txt"
    },
    {
     "text": "数量（原文句摘录）：…or scheme that uses forced labor. In addition, this update modifies two entities on the UFLPA Entity List to reflect te… → 修订 2 个entities。",
     "layer": "external",
     "source": "https://www.federalregister.gov/documents/full_text/text/2026/08/03/2026-15628.txt"
    },
    {
     "text": "文档类型 Notice；引文 91 FR 48913；生效 见原文。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    },
    {
     "text": "DHS UFLPA 实体清单页同步收录该批 47 个实体（含别名与生效日期，生效 2026-08-03）。",
     "layer": "external",
     "source": "https://www.dhs.gov/uflpa-entity-list"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "UFLPA 实体清单主体涉疆产品适用“可反驳推定”禁止进口；进口商须准备清晰且令人信服的供应链证据。相关出口/采购企业应更新供应商筛查并留存溯源文件。",
    "basis": "UFLPA §3 可反驳推定 + DHS/CBP 进口商指引"
   },
   "url": "https://www.federalregister.gov/documents/2026/08/03/2026-15628/notice-regarding-the-uyghur-forced-labor-prevention-act-entity-list",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-08-03/pdf/2026-15628.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "cn_parties": [
    {
     "name": "Xinjiang Communications Construction Group Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Nuziline Bio-Pharmaceutical Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianyun Organic Agriculture Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Zhengzhou Synear Food Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Alar Nanjiang Carbon New Material Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Aksu Aodu Sugar Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Baiyin Nonferrous Group Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Baoji Jucheng Titanium Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Chacha Food Company, Limited",
     "kind": "新增/修订"
    },
    {
     "name": "Chalkis Health Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Fujian Septwolves Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Guangxi Kelun Pharmaceutical Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Henan Guorong Electronic Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Henan Tongzhou Cotton Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Hunan Aihua Group Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Jiangsu Tiangong Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Jiangyin Xinren Aluminum Foil Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Jiangyin Xinren Aluminum Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Kashgar Aodu Sugar Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Kashgar Jiangguoguo Agricultural Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Nanjing Lilai Pharmaceutical Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "SDIC Xinjiang Lithium Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "SDIC Xinjiang Luobupo Potash Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Shandong Gold Mining Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Shandong Gold Smelting Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Shandong Weiqiao Pioneering Group Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Shandong Weiqiao Textile Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Shihezi Xinren Battery Aluminum Foil Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "TBEA Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Tefeng Pharmaceutical Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Tianshan Aluminum Group Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Baiyin Mining Development Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Biochemical Pharmaceutical Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Huashidan Pharmaceutical Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Jinchuan Mining Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Production and Construction Corps Eighth Division Tianshan Aluminum Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tefeng Pharmaceutical Industry Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianchi Energy Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianhongji Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianshan Snow Lotus Pharmaceutical Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianshan Yingda Carbon Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianzhan New Material Technology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Yili Chuanning Biotechnology Co., Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang GCL New Energy Material Technology, Co. Ltd",
     "kind": "新增/修订"
    },
    {
     "name": "Xinjiang Tianmian Foundation Textile Co., Ltd",
     "kind": "新增/修订"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260730",
   "column": "lists",
   "action": "added",
   "date": "2026-07-30",
   "agency": "OFAC",
   "doc_no": "20260730",
   "title": "Counter Terrorism Designations; Non-Proliferation Designation Update",
   "parties": [
    "TANG, Xin",
    "AIR CARGO PRO LIMITED",
    "DADENEGAR STARTUP STUDIO",
    "SHANGHAI ELITE INTERNATIONAL TRAVEL CO LTD (Chinese Simplified: 上海马汉国际旅行社有限公司)",
    "SHANGHAI WINGS INTERNATIONAL LOGISTICS CO (Chinese Simplified: 上海翼上国际货运有限公司)",
    "SKIEZ TRAVELS AND LOGISTICS PRIVATE LIMITED",
    "DURANSOY, Cagri; DOB 04 Aug 1985; POB Kadikoy",
    "DURANSOY, Cagri"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「China」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following individual has been added to OFAC's SDN List: TANG, Xin (a.k.a. \"TANG, Mike\"), China; DOB 16 Dec 1969; nationality China; Gender Male; Secondary sanctions risk: section 1(b) of Executive Order 13224, as amended by Executive Order 13886; National ID No. 110105196912164113 (China) (individual) [SDGT] [IFSR] (Linked To: MAHAN AIR). The following entities have been added to OFAC's SDN List: AIR CARGO PRO LIMITED (a.k.a. AIRCARGOPRO LTD; a.k.a. LIMITED LIABILITY COMPANY AIRCARGOPRO), Moscow, Russia; Secondary sanctions risk: section 1(b) of …",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260730"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 1 条（individual has been added to OFAC's SDN List）；新增 5 条（entities have been added to OFAC's SDN List）；修订 2 条（changes have been made to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260730"
    },
    {
     "text": "其中地址/注册地涉中国的条目：TANG, Xin（新增）、SHANGHAI ELITE INTERNATIONAL TRAVEL CO LTD (Chinese Simplified: 上海马汉国际旅行社有限公司)（新增）、SHANGHAI WINGS INTERNATIONAL LOGISTICS CO (Chinese Simplified: 上海翼上国际货运有限公司)（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260730"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260730",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:37"
   },
   "cn_parties": [
    {
     "name": "TANG, Xin",
     "kind": "新增"
    },
    {
     "name": "SHANGHAI ELITE INTERNATIONAL TRAVEL CO LTD (Chinese Simplified: 上海马汉国际旅行社有限公司)",
     "kind": "新增"
    },
    {
     "name": "SHANGHAI WINGS INTERNATIONAL LOGISTICS CO (Chinese Simplified: 上海翼上国际货运有限公司)",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260729",
   "column": "lists",
   "action": "added",
   "date": "2026-07-29",
   "agency": "OFAC",
   "doc_no": "20260729",
   "title": "Iran-related Designations",
   "parties": [
    "BILLION NEXUS INT'L CO",
    "BRANCH SAYING INTERNATIONAL TRADING CO LTD",
    "CONFIDENT APEX LIMITED (Chinese Traditional: 帆起有限公司)",
    "HORMUZSAFE MARINE SERVICES AUTHORITY",
    "MARINOVA FREIGHT LIMITED",
    "NEVADA SPIRIT COMPANY LIMITED",
    "OCEAN TRANQUILITY LIMITED",
    "PERSIAN GULF MARINE INSURANCE COMPANY (Arabic: شركة تأمين الخليج الفارسي البحري)",
    "QI HANG SHIP MANAGEMENT LIMITED (Chinese Traditional: 啟航船舶管理有限公司)",
    "VAST MIGHTY LIMITED",
    "AL SALMI Crude Oil Tanker Unknown",
    "BREEZE V",
    "CRYSTAL",
    "LILY",
    "NATSUMI",
    "NIRETA",
    "WELL SAIL",
    "YEHOPE"
   ],
   "china_link": {
    "value": "是",
    "layer": "external",
    "basis": "原文命中关键词「Hong Kong」（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：Specially Designated Nationals List Updates The following entities have been added to OFAC's SDN List: BILLION NEXUS INT'L CO., LIMITED (a.k.a. BILLION NEXUS INT'L CO LTD), Unit 60, 3rd Floor, Yau Lee Centre, 45, Hoi Yuen Road, Kwun Tong, Kowloon, Hong Kong, China; Organization Established Date 22 Jul 2025; Identification Number IMO 0306224; Business Registration Number 78498463 (Hong Kong) [IRAN-EO13902].  BRANCH SAYING INTERNATIONAL TRADING CO LTD, Trust Company Complex, Ajeltake Road, Ajeltake Island, Majuro 96960, Marshall Islands; Organization Established Date 10 Sep 2025; Identification …",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260729"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：新增 10 条（entities have been added to OFAC's SDN List）；新增 8 条（vessels have been added to OFAC's SDN List）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260729"
    },
    {
     "text": "其中地址/注册地涉中国的条目：BILLION NEXUS INT'L CO（新增）、CONFIDENT APEX LIMITED (Chinese Traditional: 帆起有限公司)（新增）、MARINOVA FREIGHT LIMITED（新增）、NEVADA SPIRIT COMPANY LIMITED（新增）、QI HANG SHIP MANAGEMENT LIMITED (Chinese Traditional: 啟航船舶管理有限公司)（新增）、VAST MIGHTY LIMITED（新增）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260729"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260729",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:37"
   },
   "cn_parties": [
    {
     "name": "BILLION NEXUS INT'L CO",
     "kind": "新增"
    },
    {
     "name": "CONFIDENT APEX LIMITED (Chinese Traditional: 帆起有限公司)",
     "kind": "新增"
    },
    {
     "name": "MARINOVA FREIGHT LIMITED",
     "kind": "新增"
    },
    {
     "name": "NEVADA SPIRIT COMPANY LIMITED",
     "kind": "新增"
    },
    {
     "name": "QI HANG SHIP MANAGEMENT LIMITED (Chinese Traditional: 啟航船舶管理有限公司)",
     "kind": "新增"
    },
    {
     "name": "VAST MIGHTY LIMITED",
     "kind": "新增"
    }
   ],
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "ofac-20260727",
   "column": "lists",
   "action": "removed",
   "date": "2026-07-27",
   "agency": "OFAC",
   "doc_no": "20260727",
   "title": "Sanctions List Removals; Sanctions List Updates",
   "parties": [
    "RODRIGUEZ OREJUELA",
    "\"THE CHESS PLAYER\"",
    "\"LUCAS\"",
    "ARELLANO FELIX",
    "COMACHO RODRIGUES",
    "TORRES MENDEZ",
    "CHANG, Chi Fu",
    "KHUN SA",
    "CHAN, Changtrakul",
    "CHANG, Shi-Fu",
    "CHANG, Xifu",
    "CHANGTRAKUL, Chan",
    "HEATH, Noel Timothy",
    "ZAMBA, Noel Heath",
    "ZAMBO, Noel Heath",
    "OGUNGBUYI, Oluwole A",
    "ADEMULERO, Babestan Oluwole",
    "BABESTAN, Wole A",
    "OGUNGBUYI, Wally",
    "OGUNGBUYI, Wole A"
   ],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "类型标签：Sanctions List Updates（OFAC recent-actions 列表）。",
     "layer": "external",
     "source": "OFAC recent-actions"
    },
    {
     "text": "摘要：table, th, td { border: 1px solid black; border-collapse: collapse; } OFAC has made the following updates to its sanctions lists as part of its ongoing effort to remove and update old information on its sanctions lists. As part of this effort, OFAC has consolidated 18 duplicate list entries in which a distinct target appears on OFAC's sanctions lists multiple times. Although OFAC has removed certain duplicate entries, the persons and property associated with those entries remain sanctioned and any related assets also remain blocked. The chart below provides detailed information on what duplica…",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260727"
    },
    {
     "text": "SDN 变动明细（原文逐条解析；删除段含 a.k.a. 别名重复列示，条数为原文行列数）：删除 286 条（deletions have been made to OFAC's SDN List）；修订 74 条（changes have been made to OFAC's SDN List）；新增 4 条（entities have been added to OFAC's Sectoral Sanctions Identi）；删除 20 条（deletions have been made to OFAC's Sectoral Sanctions Identi）；新增 1 条（individual has been added to OFAC's Non-SDN Palestinian Legi）；删除 3 条（deletions have been made to OFAC's Non-SDN Palestinian Legis）。",
     "layer": "external",
     "source": "https://ofac.treasury.gov/recent-actions/20260727"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "清单变动主体及其（OFAC 项下）持股≥50% 的实体均受相应限制；企业筛查口径应覆盖别名与股权穿透。",
    "basis": "OFAC 50% 规则指南（2014-08-13）/ BIS 相应清单条款，以原文为准"
   },
   "url": "https://ofac.treasury.gov/recent-actions/20260727",
   "pdf_url": "https://ofac.treasury.gov/media/935656/download?inline=",
   "source": {
    "channel": "OFAC recent-actions",
    "retrieved_at": "2026-10-23 10:37"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "fr-2026-15112",
   "column": "rules",
   "action": "",
   "date": "2026-07-27",
   "agency": "OFAC",
   "doc_no": "2026-15112 / 91 FR 46836",
   "title": "Updating Website and Contact Information, and Authorizations for Payments for Legal Services",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "The Department of the Treasury's Office of Foreign Assets Control (OFAC) is adopting a final rule to update website and contact information in certain parts of the Code of Federal Regulations (CFR). Additionally, OFAC is amending one CFR Part to update general licenses authorizing payments for legal services from funds originating outside the United States to replace the reporting requirement in the general license with a recordkeeping requirement and correcting typographical errors in two CFR Parts. OFAC is also updating its regulations to correct an erroneous cross-reference.",
     "layer": "external",
     "source": "Federal Register 摘要"
    },
    {
     "text": "文档类型 Rule；引文 91 FR 46836；生效 2026-07-27。",
     "layer": "external",
     "source": "Federal Register 文档元数据"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.federalregister.gov/documents/2026/07/27/2026-15112/updating-website-and-contact-information-and-authorizations-for-payments-for-legal-services",
   "pdf_url": "https://www.govinfo.gov/content/pkg/FR-2026-07-27/pdf/2026-15112.pdf",
   "source": {
    "channel": "Federal Register API",
    "retrieved_at": "2026-10-23 09:43"
   },
   "first_seen": "2026-10-23 02:13"
  },
  {
   "id": "bis-press-release-department-commerce-streamlines-export-controls-sound-suppressors",
   "column": "rules",
   "action": "",
   "date": "2026-07-27",
   "agency": "BIS",
   "doc_no": "",
   "title": "Department of Commerce Streamlines Export Controls for Sound Suppressors",
   "parties": [],
   "china_link": {
    "value": "否",
    "layer": "external",
    "basis": "原文未出现中国相关关键词（全文检索）"
   },
   "points": [
    {
     "text": "栏目标签：Regulations（BIS 新闻页）。",
     "layer": "external",
     "source": "BIS news-updates"
    }
   ],
   "impact": {
    "layer": "analysis",
    "text": "本文 的发布/修订改变相关交易的授权边界：须以原文逐项核对授权范围、附加条件、生效/失效与过渡安排；存量交易与既有许可策略应按新文本重新核对授权依据，失效许可项下的进行中的交易须及时收尾。",
    "basis": "本文档标题/摘要与 dates、CFR 引用所载条款（以原文为准）"
   },
   "url": "https://www.bis.gov/press-release/department-commerce-streamlines-export-controls-sound-suppressors",
   "pdf_url": null,
   "source": {
    "channel": "BIS news-updates",
    "retrieved_at": "2026-10-23 10:38"
   },
   "first_seen": "2026-10-23 02:13"
  }
 ],
 "uflpa": {
  "retrieved_at": "2026-10-23 11:09",
  "sha256": "c1d2be544109b27f3efee9131620df92b75d5ce97a938dd3eb6df184dc8fd6ed",
  "count": 205,
  "entries": [
   {
    "name": "Baoding LYSZD Trade and Business Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Hetian Haolin Hair Accessories Co. Ltd.",
    "aliases": [
     "Hotan Haolin Hair Accessories",
     "Hollin Hair Accessories"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Hetian Taida Apparel Co., Ltd",
    "aliases": [
     "one alias: Hetian TEDA Garment"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Hoshine Silicon Industry (Shanshan) Co., Ltd (including one alias: Hesheng Silicon Industry (Shanshan) Co.) and subsidiaries",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Xinjiang Daqo New Energy, Co. Ltd",
    "aliases": [
     "Xinjiang Great New Energy Co., Ltd",
     "Xinjiang Daxin Energy Co., Ltd",
     "Xinjiang Daqin Energy Co., Ltd"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Xinjiang East Hope Nonferrous Metals Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Xinjiang Goens Energy Technology Co., Ltd.",
    "aliases": [
     "Xinjiang GCL New Energy Material Technology Co., Ltd",
     "Xinjiang GCL New Energy Materials Technology Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Xinjiang Junggar Cotton and Linen Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Xinjiang Production and Construction Corps (including three aliases: XPCC; Xinjiang Corps; and Bingtuan) and its subordinate and affiliated entities",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(i)"
   },
   {
    "name": "Aksu Huafu Color Spinning Co., Ltd.",
    "aliases": [
     "Aksu Huafu Textiles Co., Ltd",
     "Akesu Huafu",
     "Aksu Huafu Dyed Melange Yarn",
     "Akesu Huafu Melange Yarn Co., Ltd"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Anhui Xinya New Materials Co., Ltd.",
    "aliases": [
     "Chaohu Youngor Color Spinning Technology Co., Ltd",
     "Chaohu Xinya Color Spinning Technology Co., Ltd"
    ],
    "effective": "2023-12-11",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Baowu Group Xinjiang Bayi Iron and Steel Co., Ltd.",
    "aliases": [
     "Xinjiang Bayi Iron",
     "Steel Co. Ltd",
     "Baosteel Group Xinjiang Bayi Iron",
     "Steel Co., Ltd",
     "Bayi Iron",
     "Steel"
    ],
    "effective": "2024-10-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Camel Group Co., Ltd.",
    "aliases": [],
    "effective": "2023-08-02",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Changhong Meiling Co., Ltd.",
    "aliases": [
     "Hefei Meiling Co., Ltd",
     "Hefei Meiling Group Holdings Limited"
    ],
    "effective": "2024-10-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "COFCO Sugar Holdings Co., Ltd.",
    "aliases": [],
    "effective": "2023-12-11",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Dongguan Oasis Shoes Co., Ltd.",
    "aliases": [
     "Dongguan Oasis Shoe Industry Co. Ltd",
     "Dongguan Luzhou Shoes Co., Ltd",
     "Dongguan Lvzhou Shoes Co., Ltd"
    ],
    "effective": "2024-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Geehy Semiconductor Co., Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Hefei Bitland Information Technology Co., Ltd.",
    "aliases": [
     "Anhui Hefei Baolongda Information Technology",
     "Hefei Baolongda Information Technology Co., Ltd",
     "Hefei Bitland Optoelectronic Technology Co., Ltd"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Kashgar Construction Engineering (Group) Co., Ltd.",
    "aliases": [],
    "effective": "2024-08-09",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "KTK Group",
    "aliases": [
     "Jiangsu Jinchuang Group",
     "Jiangsu Jinchuang Holding Group",
     "KTK Holding"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Lop County Hair Product Industrial Park",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Lop County Meixin Hair Products Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Nanjing Synergy Textiles Co., Ltd.",
    "aliases": [
     "Nanjing Xinyi Cotton Textile Printing",
     "Dyeing",
     "Nanjing Xinyi Cotton Textile"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Ninestar Corporation",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "No. 4 Vocation Skills Education Training Center (VSETC)",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Shandong Meijia Group Co., Ltd.",
    "aliases": [
     "Rizhao Meijia Group"
    ],
    "effective": "2024-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Sichuan Jingweida Technology Group Co., Ltd.",
    "aliases": [
     "Sichuan Mianyang Jingweida Technology Co., Ltd",
     "JWD Technology",
     "formerly known as Mianyang High-tech Zone Jingweida Technology Co., Ltd"
    ],
    "effective": "2023-12-11",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Tanyuan Technology Co. Ltd.",
    "aliases": [
     "Carbon Yuan Technology",
     "Changzhou Carbon Yuan Technology Development",
     "Carbon Element Technology",
     "Jiangsu Carbon Element Technology",
     "Tanyuan Technology Development"
    ],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Western Gold Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Western Gold Hami Gold Mine Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Western Gold Karamay Hatu Gold Mine Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Communications Construction Group Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Energy (Group) Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Energy (Group) Real Estate Co., Ltd",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Habahe Ashele Copper Co., Ltd.",
    "aliases": [
     "Ashele Copper"
    ],
    "effective": "2024-08-09",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Jinbao Mining Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Nonferrous Metals Industry Group Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Nuziline Bio-Pharmaceutical Co., Ltd.",
    "aliases": [
     "Xinjiang Xinziyuan Biopharmaceutical Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Production and Construction Corps (XPCC) and its subordinate and affiliated entities",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Shenhuo Coal and Electricity Co., Ltd.",
    "aliases": [],
    "effective": "2024-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Tengxiang Magnesium Products Co., Ltd.",
    "aliases": [],
    "effective": "2024-08-09",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Kuitun Yadasi Textile Co., Ltd.",
    "aliases": [
     "Kuitun Yadaxi Textile Co., Ltd",
     "formerly known as Xinjiang Tianmian Foundation Textile Co., Ltd",
     "Xinjiang Tianhong Jiye Textile Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Tianshan Wool Textile Co. Ltd.",
    "aliases": [],
    "effective": "2023-09-27",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Tianyun Organic Agriculture Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Zhonghe Co., Ltd.",
    "aliases": [
     "Xinjiang Joinworld Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Zhongtai Chemical Co. Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Zhongtai Group Co. Ltd",
    "aliases": [],
    "effective": "2023-09-27",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Xinjiang Zijin Zinc Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhengzhou Synear Food Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai Apex Microelectronics Co., Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai G&G Digital Technology Co., Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai Ninestar Information Technology Co. Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai Ninestar Management Co., Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai Pantum Electronics Co. Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai Pu-Tech Industrial Co., Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Zhuhai Seine Printing Technology Co., Ltd.",
    "aliases": [],
    "effective": "2023-06-12",
    "section": "§2(d)(2)(B)(ii)"
   },
   {
    "name": "Aksu Aodu Sugar Industry Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Aksu Biaoxin Fiber Co., Ltd.",
    "aliases": [
     "Aksu Shangheng Fiber Co., Ltd"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Aksu Huafu Color Spinning Co., Ltd.",
    "aliases": [
     "Aksu Huafu Textiles Co., Ltd",
     "Akesu Huafu",
     "Aksu Huafu Dyed Melange Yarn",
     "Akesu Huafu Melange Yarn Co., Ltd"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Alar Nanjiang Carbon New Material Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Anhui Yaozhiyuan Biotechnology Development Co., Ltd.",
    "aliases": [
     "Anhui Yaozhiyuan Chinese Herbal Medicine Co., Ltd",
     "Anhui Yaozhiyuan Chinese Medicinal Materials Co., Ltd",
     "Anhui Yaozhiyuan Biological Technology Development Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Annan Canned Food Co., Ltd.",
    "aliases": [
     "Nanling County Annan Canned Food Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Awati Huafu Textile Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Baiyin Nonferrous Group Co., Ltd.",
    "aliases": [
     "Baiyin Nonferrous",
     "BNMC",
     "formerly known as Baiyin Nonferrous Metals Company"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Baoding LYSZD Trade and Business Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Baoji Jucheng Titanium Industry Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Baotou Meike Silicon Energy Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Binzhou Chinatex Yintai Industrial Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Century Sunshine Group Holdings, Ltd.",
    "aliases": [],
    "effective": "2024-08-09",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Chacha Food Company, Limited",
    "aliases": [
     "Chacha Food Co., Ltd",
     "Qia Qia Food",
     "Chia Chia Food Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Chalkis Health Industry Co., Ltd.",
    "aliases": [
     "Xinjiang Chalkis Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Changji Esquel Textile Co., Ltd.",
    "aliases": [
     "Changji Yida Textile Co., Ltd"
    ],
    "effective": "2024-11-01",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Changzhou Guanghui Food Ingredients Co., Ltd.",
    "aliases": [
     "GSweet",
     "Changzhou Guanghui Food Additive Co., Ltd",
     "Changzhou Guanghui Food Technology Co., Ltd",
     "formerly known as Changzhou Guanghui Biotechnology Co., Ltd"
    ],
    "effective": "2024-10-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Chenguang Biotech Group Co., Ltd.",
    "aliases": [],
    "effective": "2023-08-02",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Chenguang Biotechnology Group Yanqi Co. Ltd.",
    "aliases": [],
    "effective": "2023-08-02",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "China Cotton Group Henan Logistics Park Co., Ltd., Xinye Branch",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "China Cotton Group Nangong Hongtai Cotton Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "China Cotton Group Shandong Logistics Park Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "China Cotton Group Xinjiang Cotton Co.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Dalian Sunspeed Foods Co., Ltd.",
    "aliases": [
     "Dalian Shengchi International Trade Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Donghai JA Solar Technology Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Esquel Group",
    "aliases": [
     "Esquel China Holdings Limited"
    ],
    "effective": "2024-11-01",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Fujian Minlong Warehousing Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Fujian Septwolves Industry Co., Ltd.",
    "aliases": [
     "Septwolves"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Gansu Yasheng International Trading Co., Ltd.",
    "aliases": [
     "Gansu Yasheng International Trade Co., Ltd",
     "Yasheng International Trade",
     "formerly known as Gansu Yasheng International Trade Group Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Guangdong Esquel Textile Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-01",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Guangxi Kelun Pharmaceutical Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hangzhou Union Biotechnology Co., Ltd.",
    "aliases": [
     "Hangzhou Youer Biotechnology Co., Ltd",
     "Youer Biotech",
     "Union Biotech"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hebei Suguo International Trade Co., Ltd.",
    "aliases": [
     "Suguo International"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hebei Tomato Industry Co., Ltd.",
    "aliases": [
     "Hebei Temeite Industrial Group Co., Ltd",
     "formerly known as Hebei Temeite International Trade Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hefei Bitland Information Technology Co. Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Henan Guorong Electronic Technology Co., Ltd.",
    "aliases": [
     "Goroe",
     "Guorong Shares"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Henan Tongzhou Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Henan Yumian Group Industrial Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Henan Yumian Logistics Co., Ltd.",
    "aliases": [
     "841 Cotton Transfer Warehouse"
    ],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hengshui Cotton and Linen Corporation Reserve Library",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hetian Haolin Hair Accessories Co. Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hetian Taida Apparel Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Heze Cotton and Linen Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Heze Cotton and Linen Economic and Trade Development Corporation",
    "aliases": [
     "Heze Cotton",
     "Linen Trading Development General Company"
    ],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hongyuan Green Energy Co., Ltd.",
    "aliases": [
     "HY Solar",
     "Hoyuan Green Energy Co. Ltd",
     "formerly known as Wuxi Shangji CNC Co., Ltd",
     "Wuxi Shangji Automation Co., Ltd",
     "Wuxi Shangji Grinding Machine Co., Ltd"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hongyuan New Materials (Baotou) Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hoshine Silicon Industry (Shanshan) Co., Ltd., and Subsidiaries",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Huafu Fashion Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hunan Aihua Group Co., Ltd.",
    "aliases": [
     "Aihua Group",
     "AiSHi"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Huangmei Xiaochi Yinfeng Cotton",
    "aliases": [
     "Hubei Provincial Cotton Corporation's Xiaochi Transfer Reserve"
    ],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hubei Jingtian Cotton Industry Group Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hubei Qirun Investment Development Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hubei Yinfeng Cotton Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hubei Yinfeng Warehousing and Logistics Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Hunan Nanmo Biotechnology Co., Ltd.",
    "aliases": [
     "Hunan Nanmomo Technology Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Huyanghe Huafu Hongsheng Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Inner Mongolia Qileyuan Food Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Inner Mongolia Xuanda Food Co., Ltd.",
    "aliases": [
     "Xuanda Food",
     "formerly known as Wuyuan County Xuanda Cereals, Oils",
     "Foods Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangsu Meike Solar Technology Co., Ltd.",
    "aliases": [
     "Meike Co",
     "formerly known as Jiangsu Gaozhao New Energy Development Co., Ltd"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangsu Tiangong Technology Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangsu Yinhai Nongjiale Storage Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangsu Yinlong Warehousing and Logistics Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangyin Lianyun Co. Ltd.",
    "aliases": [
     "Jiangyin Intermodal Transport Co",
     "Jiangyin United Transport Co"
    ],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangyin Xiefeng Cotton and Linen Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangyin Xinren Aluminum Foil Technology Co., Ltd.",
    "aliases": [
     "Xinren Aluminum Foil"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jiangyin Xinren Aluminum Technology Co., Ltd.",
    "aliases": [
     "Xinren Aluminum"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jinan Haihong International Trade Co., Ltd.",
    "aliases": [
     "Jinan Haifang Trading Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Jining Pengjie Trading Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Junan Jinsheng Import & Export Co., Ltd.",
    "aliases": [
     "Junan County Jinsheng Import",
     "Export Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Juye Cotton and Linen Station of the Heze Cotton and Linen Corporation",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Kashgar Aodu Sugar Industry Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Kashgar Jiangguoguo Agricultural Technology Co., Ltd.",
    "aliases": [
     "Jiangguoguo"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Kingherbs Limited",
    "aliases": [
     "Changsha Jincao Biotechnology Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Kuche Zongheng Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Kuitun Jinfu Textile Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Lanxi Huachu Logistics Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Linxi County Fangpei Cotton Buying and Selling Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Lop County Hair Product Industrial Park",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Lop County Meixin Hair Products Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Nanjing Lilai Pharmaceutical Technology Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Nanyang Hongmian Logistics Co., Ltd.",
    "aliases": [
     "Nanyang Red Cotton Logistics Co., Ltd"
    ],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Ningbo Huafu Donghao Industrial Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Ninghai Huafu Textile Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "No. 4 Vocation Skills Education Training Center (VSETC)",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Qingdao Vital Nutraceutical Ingredients BioScience Co., Ltd.",
    "aliases": [
     "Qingdao Weiyikang Biotechnology Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Rare Earth Magnesium Technology Group Holdings, Ltd.",
    "aliases": [],
    "effective": "2024-08-09",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "SDIC Xinjiang Lithium Industry Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "SDIC Xinjiang Luobupo Potash Co., Ltd.",
    "aliases": [
     "SDIC Xinjiang Lop Nur Potash Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shandong Gold Mining Co., Ltd.",
    "aliases": [
     "Shandong Gold"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shandong Gold Smelting Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shandong Weiqiao Pioneering Group Co., Ltd.",
    "aliases": [
     "Shandong Weiqiao Chuangye Group Co., Ltd",
     "Shandong Weiqiao Venture Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shandong Weiqiao Textile Technology Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shanghai JUMP Machinery & Technology Co., Ltd.",
    "aliases": [
     "Shanghai Jiapai Machinery Technology Co., Ltd",
     "formerly known as Shanghai Chituma Food Machinery Technology Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shaya Yinhua Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shihezi Huafu Hongfeng Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shihezi Huafu Hongsheng Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shihezi Standard Fiber Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shihezi Xinren Battery Aluminum Foil Technology Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Shuangliang Silicon Materials (Baotou) Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Sichuan Yuan’an Pharmaceutical Co., Ltd.",
    "aliases": [
     "Sichuan Yuanan Pharmaceutical Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Taiyuan Weishan International Economic Business Co., Ltd.",
    "aliases": [
     "Taiyuan Weishan International Trade Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "TBEA Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Tefeng Pharmaceutical Co., Ltd.",
    "aliases": [
     "Tefeng Pharmaceutical",
     "formerly known as Tefeng Health Technology Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "The TNN Development Limited",
    "aliases": [
     "Dehui (Dalian) International Trade Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Tianjin Dunhe International Trade Co., Ltd.",
    "aliases": [
     "Dunhe Foods"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Tianjin Kunyu International Co., Ltd.",
    "aliases": [
     "China Kunyu Industrial Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Tianjin Tianwei Food Co., Ltd.",
    "aliases": [
     "Tianjin Sanhe Fruit",
     "Vegetable Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Tianshan Aluminum Group Co., Ltd.",
    "aliases": [
     "Shimge Pump Industry Group Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Turpan Esquel Textile Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-01",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Weifang Alice Food Co., Ltd.",
    "aliases": [],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Wugang Zhongchang Logistics Co., Ltd.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Baiyin Mining Development Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Biochemical Pharmaceutical Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Cotton Industry Group Jiashi Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Cotton Industry Group Yuepu Lake Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Daqo New Energy Co., Ltd.",
    "aliases": [
     "Xinjiang Great New Energy Co., Ltd",
     "Xinjiang Daxin Energy Co., Ltd",
     "Xinjiang Daqin Energy Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Habahe Ashele Copper Co., Ltd.",
    "aliases": [
     "Ashele Copper"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Huafu Color Spinning Group Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Huafu Cotton Industry Group Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Huafu Hengfeng Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Huafu Hongfeng Agricultural Development Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Huafu Textile Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Huashidan Pharmaceutical Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Jinchuan Mining Industry Co., Ltd.",
    "aliases": [
     "Xinjiang Jinchuan Company"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Junggar Cotton and Linen Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Liufu Textile Industrial Park Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Nuziline Bio-Pharmaceutical Co., Ltd.",
    "aliases": [
     "Xinjiang Xinziyuan Biopharmaceutical Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Production and Construction Corps (XPCC) and its subordinate and affiliated entities",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Production and Construction Corps Eighth Division Tianshan Aluminum Co., Ltd.",
    "aliases": [
     "Tian Aluminum Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Shengfu Cotton Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tefeng Pharmaceutical Industry Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tengxiang Magnesium Products Co., Ltd.",
    "aliases": [],
    "effective": "2024-08-09",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianchi Energy Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianfu Cotton Supply Chain Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianhong Xinba Cotton Industry Co., Ltd.",
    "aliases": [
     "Xinjiang Tianhong New Eight Cotton Industry Co., Ltd"
    ],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianhongji Technology Co., Ltd.",
    "aliases": [
     "Xinjiang Tianhongji Silicon Industry Co., Ltd"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianshan Snow Lotus Pharmaceutical Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianshan Yingda Carbon Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianyun Organic Agriculture Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Tianzhan New Material Technology Co., Ltd.",
    "aliases": [],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Yinlong Agricultural International Cooperation Co.",
    "aliases": [],
    "effective": "2024-05-17",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Zefu Cotton Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Zijin Nonferrous Metals Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Xinjiang Zijin Zinc Industry Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Yili Chuanning Biotechnology Co., Ltd.",
    "aliases": [
     "Twinings Bio",
     "CN BIO"
    ],
    "effective": "2026-08-03",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Yili Zhuowan Garment Manufacturing Co., Ltd.",
    "aliases": [],
    "effective": "2022-06-21",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Zhangzhou Hang Fat Import & Export Co., Ltd.",
    "aliases": [
     "Zhangzhou Hengfa Import",
     "Export Co., Ltd"
    ],
    "effective": "2024-11-25",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Zhejiang Weixin Trading Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   },
   {
    "name": "Zijin Mining Group Co., Ltd.",
    "aliases": [],
    "effective": "2025-01-15",
    "section": "§2(d)(2)(B)(v)"
   }
  ]
 },
 "uflpa_count": 205,
 "watch": {
  "list": "OFAC SDN",
  "list_version": "2026-10-20",
  "retrieved_at": "2026-10-23 02:33",
  "sha256": "96dade5a1cde8c9746937b4859ad75d8f2a34eed1a4046cc1f2240a830f70bda",
  "entry_count": 19471,
  "subject_count": 171,
  "results": {
   "no_hit": 171,
   "name_match_only": 0,
   "confirmed": 0
  },
  "matches": [],
  "method": "名称归一（大小写/标点/法律后缀/括号注记）+ 别名表精确匹配；confirmed 需名称+独立标识（地址/证件/国别）一致，脚本数据侧无独立标识，confirmed 只能由人工核验置位。"
 }
};
