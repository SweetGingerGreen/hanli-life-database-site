// src/app/cards/[card]/opengraph-image.tsx
// ⭐ THE MAGIC FILE: serve real 1200×630 PNGs via next/og
//
// URL: /cards/{card}/opengraph-image  →  Content-Type: image/png
//
// Cards:
//   resume-yuanying-mid  →  CardA (阶段履历卡)
//   profile-jiedan-1     →  CardB (境界档案卡)
//   risk-annual          →  CardC (风险年报卡)
//   seclusion-ledger     →  CardD (资产清单卡)

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { getOverview } from "@/lib/queries/overview";
import { getRealmProfiles } from "@/lib/queries/realms";
import { getSeclusionStats } from "@/lib/queries/seclusion";
import type { Overview, RealmProfile, SeclusionStats } from "@/lib/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs"; // need fs + better-sqlite3

const PAPER = "#ebe2cb";
const INK = "#1a140e";
const INK_FAINT = "#6b5d49";
const RULE = "rgba(26, 20, 14, 0.2)";
const CINNABAR = "#b4392b";
const GOLD = "#b88224";
const JADE = "#3d6e6b";

type CardStats =
  | { kind: "resume"; r: RealmProfile }
  | { kind: "profile"; r: RealmProfile }
  | { kind: "risk"; o: Overview }
  | { kind: "seclusion"; s: SeclusionStats };

export function generateStaticParams() {
  return [
    { card: "resume-yuanying-mid" },
    { card: "profile-jiedan-1" },
    { card: "risk-annual" },
    { card: "seclusion-ledger" },
  ];
}

export default async function CardOG({ params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const serif = await readFile(
    path.join(process.cwd(), "public/fonts/NotoSerifSC-Bold.woff")
  ).catch(() => null);
  const serifReg = await readFile(
    path.join(process.cwd(), "public/fonts/NotoSerifSC-Regular.woff")
  ).catch(() => null);

  const stats = await pickCardStats(card);
  const tree = renderCard(card, stats);

  return new ImageResponse(tree, {
    ...size,
    fonts: [
      ...(serif ? [{ name: "Noto Serif SC", data: serif as Buffer, weight: 700 as const, style: "normal" as const }] : []),
      ...(serifReg ? [{ name: "Noto Serif SC", data: serifReg as Buffer, weight: 400 as const, style: "normal" as const }] : []),
    ],
  });
}

async function pickCardStats(card: string): Promise<CardStats> {
  switch (card) {
    case "resume-yuanying-mid": {
      const r = getRealmProfiles().find(x => x.realm === "元婴中");
      if (!r) throw new Error("missing realm profile: 元婴中");
      return { kind: "resume", r };
    }
    case "profile-jiedan-1": {
      const r = getRealmProfiles().find(x => x.realm === "结丹初");
      if (!r) throw new Error("missing realm profile: 结丹初");
      return { kind: "profile", r };
    }
    case "risk-annual": {
      return { kind: "risk", o: getOverview() };
    }
    case "seclusion-ledger": {
      return { kind: "seclusion", s: getSeclusionStats() };
    }
    default: throw new Error(`unknown card: ${card}`);
  }
}

function renderCard(card: string, stats: CardStats) {
  const isArchive = card === "seclusion-ledger";
  const bg = isArchive ? "#1a140e" : PAPER;
  const fg = isArchive ? PAPER : INK;
  const rule = isArchive ? "rgba(235, 226, 203, 0.15)" : RULE;
  return (
    <div style={{
      width: "100%", height: "100%", background: bg, color: fg,
      fontFamily: "Noto Serif SC", display: "flex", flexDirection: "column",
      padding: 56, position: "relative",
    }}>
      <div style={{ display: "flex", fontFamily: "monospace", fontSize: 14,
                    color: isArchive ? "rgba(235,226,203,0.5)" : INK_FAINT,
                    letterSpacing: 4, textTransform: "uppercase", marginBottom: 32 }}>
        {eyebrowFor(card)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
        {titleFor(card, stats)}
      </div>
      <div style={{ display: "flex", marginTop: 24, fontSize: 22,
                    color: isArchive ? "rgba(235,226,203,0.65)" : INK_FAINT,
                    maxWidth: 800, lineHeight: 1.5 }}>
        {subFor(card)}
      </div>
      <div style={{ display: "flex", gap: 0, marginTop: "auto", borderTop: `1px solid ${rule}` }}>
        {statsFor(card, stats).map((s, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", padding: "24px 16px 0",
            borderRight: i < 3 ? `1px solid ${rule}` : "0", flex: 1,
          }}>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: s.color }}>{s.n}</div>
            <div style={{ display: "flex", fontSize: 16, marginTop: 4 }}>{s.l}</div>
            <div style={{ display: "flex", fontSize: 11, fontFamily: "monospace", letterSpacing: 2, marginTop: 4,
                          color: isArchive ? "rgba(235,226,203,0.45)" : INK_FAINT }}>{s.e}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 12,
                    color: isArchive ? "rgba(235,226,203,0.5)" : INK_FAINT, fontFamily: "monospace" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 22, height: 22, background: fg, color: bg, display: "flex",
                          alignItems: "center", justifyContent: "center", fontFamily: "Noto Serif SC",
                          fontWeight: 700, fontSize: 14 }}>韩</span>
          <span style={{ fontFamily: "Noto Serif SC", fontWeight: 700, fontSize: 14, color: fg }}>
            韩立人生数据库
          </span>
        </div>
        <div style={{ display: "flex" }}>数据口径 · 章节级统计 · v1.1</div>
      </div>
    </div>
  );
}

function eyebrowFor(c: string) {
  switch (c) {
    case "resume-yuanying-mid": return "韩立人生数据库 · 阶段履历 · CH855–CH1124";
    case "profile-jiedan-1":     return "境界档案 · 乱星海漂泊期";
    case "risk-annual":          return "风险年报 · 全 1324 章 · 全境界口径";
    case "seclusion-ledger":     return "闭关专题 · 88 段 · 三套口径";
  }
  return "";
}
function titleFor(c: string, s: CardStats): ReactNode {
  if (c === "resume-yuanying-mid")
    return <><div style={{ display: "flex" }}>韩立 247-350 岁</div><div style={{ display: "flex" }}>元婴中期修仙履历</div></>;
  if (c === "profile-jiedan-1")
    return <><div style={{ display: "flex" }}>结丹初期</div><div style={{ display: "flex" }}>乱星海漂泊期</div></>;
  if (c === "risk-annual" && s.kind === "risk")
    return <><div style={{ display: "flex" }}>韩立这辈子</div><div style={{ display: "flex" }}>差点死了 {s.o.nearDeathChapters} 次。</div></>;
  if (c === "seclusion-ledger" && s.kind === "seclusion")
    return <><div style={{ display: "flex" }}>韩立闭关了</div><div style={{ display: "flex" }}>{s.s.estimatedYears.toFixed(0)} 年。可能。</div></>;
  return null;
}
function subFor(c: string) {
  switch (c) {
    case "resume-yuanying-mid": return "在灵界漂流约十年，参与多场势力混战。事件密度最高的人生阶段之一。";
    case "profile-jiedan-1":     return "韩立 133–166 岁。从天星城出关，到玄天宗废墟混战。";
    case "risk-annual":          return "含战斗、击杀、跑路、被骗、濒死五条风险信号。";
    case "seclusion-ledger":     return "高置信合计、全估算合计、去跨章重复——三套口径并行。这就是为什么需要一份数据口径。";
  }
  return "";
}
function statsFor(c: string, s: CardStats): Array<{ n: string; l: string; e: string; color: string }> {
  if (c === "resume-yuanying-mid" && s.kind === "resume") {
    const r = s.r;
    return [
      { n: String(r.battles),       l: "章战斗",     e: "BATTLE",       color: CINNABAR },
      { n: String(r.kills),         l: "明确击杀",   e: "KILL",         color: CINNABAR },
      { n: String(r.treasures),     l: "章得宝",     e: "TREASURE",     color: GOLD },
      { n: String(r.secretRealms),  l: "章秘境",     e: "SECRET REALM", color: JADE },
    ];
  }
  if (c === "profile-jiedan-1" && s.kind === "profile") {
    const r = s.r;
    return [
      { n: String(r.battles),       l: "战斗章节",   e: "BATTLES",       color: CINNABAR },
      { n: String(r.treasures),     l: "得宝章节",   e: "TREASURES",     color: GOLD },
      { n: String(r.secretRealms),  l: "秘境章节",   e: "SECRET REALMS", color: JADE },
      { n: String(r.relationships), l: "结识章节",   e: "SOCIAL",        color: "#6b7a3a" },
    ];
  }
  if (c === "risk-annual" && s.kind === "risk") {
    const o = s.o;
    return [
      { n: String(o.battleChapters),    l: "章战斗",     e: "BATTLE CH.", color: CINNABAR },
      { n: String(o.killChapters),      l: "明确击杀",   e: "KILL CH.",   color: CINNABAR },
      { n: String(o.fleeChapters),      l: "章跑路",     e: "FLEE CH.",   color: CINNABAR },
      { n: String(o.nearDeathChapters), l: "章濒死",     e: "NEAR-DEATH", color: CINNABAR },
    ];
  }
  if (s.kind !== "seclusion") return [];
  const x = s.s;
  return [
    { n: x.highConfidenceYears.toFixed(1), l: "高置信合计 · 年", e: "HIGH-CONF.",   color: GOLD },
    { n: x.estimatedYears.toFixed(0),       l: "全估算合计 · 年", e: "ESTIMATED",    color: GOLD },
    { n: x.conservativeYears.toFixed(0),    l: "去跨章重复 · 年", e: "CONSERVATIVE", color: GOLD },
    { n: String(x.periods),                 l: "段闭关记录",       e: "PERIODS",      color: GOLD },
  ];
}
