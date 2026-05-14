# 韩立人生数据库 · Han Li Life Database

一个基于《凡人修仙传》章节级结构化数据生成的网页数据库。站点不提供小说原文阅读，只展示抽取后的事件、境界、地点、法宝、人物、置信度和统计口径，用来回答“韩立这辈子到底经历了什么”。

线上站点：[https://hanli-life-database.pages.dev](https://hanli-life-database.pages.dev)

英文版：[https://hanli-life-database.pages.dev/en](https://hanli-life-database.pages.dev/en)

## 当前数据规模

- 1324 条章节记录
- 1998 条原子事件
- 22 段境界档案
- 409 个战斗章节
- 410 个得宝章节
- 179 条待复核记录，前端不隐藏

## 功能页面

- `/` 总览：核心 KPI、境界推进线、事件热力图、事件类型排行
- `/timeline` 人生时间轴：按风险、资产、地图和数据质量筛选事件
- `/events` 事件库：表格 / 卡片视图，支持搜索、类型、境界、置信度筛选
- `/events/[id]` 单事件详情：展示事件元数据和同章上下文
- `/realms` 境界档案：按修为阶段汇总战斗、得宝、秘境、关系等指标
- `/realms/[slug]` 单境界详情：该境界内的完整事件流
- `/cards` 分享卡：1200x630 PNG 卡片预览和下载入口
- `/methodology` 数据口径：解释 schema、置信度、闭关估算和复核逻辑
- `/privacy` 隐私与广告：广告脚本、Cookie、数据边界和 `ads.txt` 准备说明
- `/en` 英文版入口：英文导航、SEO alternate、英文数据说明和同一套数据库镜像

## 技术栈

- Next.js App Router
- React 18
- TypeScript
- better-sqlite3
- Vitest
- Playwright
- Cloudflare Pages 静态部署

## 本地运行

```bash
npm install
npm run schema:dump
npm run dev
```

开发服务默认运行在 `http://127.0.0.1:3000`。

安装依赖后，`postinstall` 会把 `@fontsource/noto-serif-sc` 的中文 WOFF 字体复制到 `public/fonts/`，供页面字体和 `next/og` 分享卡使用。

## 数据与导出

唯一真源是：

```text
data/han-li.sqlite
```

运行时通过 `better-sqlite3` 只读访问。也可以用环境变量显式指定：

```bash
DATABASE_PATH=./data/han-li.sqlite npm run dev
```

常用数据命令：

```bash
npm run schema:dump
npm run data:export
```

`data:export` 会从 SQLite 生成：

- `src/data/site-data.json`：静态页面和查询层使用的聚合数据
- `public/data/events.json`：Cloudflare Pages 静态版的客户端筛选数据

## 质量检查

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

本项目的 Playwright 配置会优先使用本机 Chrome：

```text
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

## Cloudflare Pages 部署

Cloudflare Pages 走静态导出版，避免在 Workers runtime 中运行 `better-sqlite3` native module。

```bash
npm run build:cloudflare
npx wrangler pages deploy out --project-name hanli-life-database --branch main --commit-dirty=true
```

默认站点地址：

```text
https://hanli-life-database.pages.dev
```

如果以后启用自定义域，可以在构建时覆盖站点 URL：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build:cloudflare
```

## Google 广告准备

广告脚本默认不会加载。只有配置对应环境变量后，构建产物才会带上 Google 脚本或有效 `ads.txt`。

```bash
# AdSense auto ads
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-xxxxxxxxxxxxxxxx

# Google tag / Google Ads measurement
NEXT_PUBLIC_GOOGLE_TAG_ID=G-XXXXXXXXXX
# 或
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
```

相关文件：

- `src/components/ads/GoogleAdsScripts.tsx`
- `src/app/ads.txt/route.ts`
- `src/app/privacy/page.tsx`
- `src/app/en/privacy/page.tsx`

上线 AdSense 审核前，至少确认：

- `https://hanli-life-database.pages.dev/ads.txt` 返回真实 `pub-...`
- 隐私与广告页可访问
- 英文版 `/en`、`/en/events`、`/en/timeline` 可访问
- 站点仍然不展示小说原文全文，只展示结构化字段和摘要

## 仓库边界

- 不提交 `.next/`、`out/`、`.wrangler/`、`.vercel/`、`.env*`、`public/fonts/`、`CODEX_TASKS.md`
- 不把 Cloudflare、GitHub 或其他平台 token 写入代码或文档
- 本项目以结构化事实和统计为主，不保存或展示小说原文章节内容

## License

Creative Commons Attribution-NonCommercial 4.0 International.

详见 [LICENSE](./LICENSE)。
