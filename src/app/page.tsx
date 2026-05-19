// src/app/page.tsx — Home, fully RSC, all data server-side
import Link from "next/link";
import { getOverview, getEventTypeBreakdown } from "@/lib/queries/overview";
import { getRealmProfiles } from "@/lib/queries/realms";
import { getSeclusionStats } from "@/lib/queries/seclusion";
import { SectionHeader } from "@/components/ui/atoms";
import { RealmProgression } from "@/components/charts/RealmProgression";
import { EventTypeRanked } from "@/components/charts/EventTypeRanked";
import { EventDensityHeatmap } from "@/components/charts/EventDensityHeatmap";

// Generate at build time; revalidate weekly when the sqlite snapshot may bump.
export const revalidate = 604800;

export default async function Home() {
  const o = getOverview();
  const realms = getRealmProfiles();
  const eventTypes = getEventTypeBreakdown();
  const s = getSeclusionStats();

  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <div className="hero__head">
          <div>
            <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
              <span className="eyebrow">主线数据库</span>
              <span className="eyebrow is-en">Han Li · Life Database · v1.1</span>
            </div>
            <h1 className="hero__title">
              韩立这辈子<br />
              到底干了 <em>{o.chapters} 章</em> <span className="nowrap">什么。</span>
            </h1>
          </div>
          <div className="hero__lede">
            <p>
              基于《凡人修仙传》<strong>章节级事件</strong>结构化整理。
              这里没有原文阅读器，只有一份算得清楚的修仙履历：
              <strong>多少次战斗、多少次跑路、多少件宝物、多少年闭关。</strong>
            </p>
            <p style={{ marginTop: 12, color: "var(--ink-faint)", fontSize: 12 }}>
              数据口径：章节级统计 · 高置信优先 · 估算标注「约」 · 待复核 {o.needsReview} 条不隐藏。
            </p>
          </div>
        </div>

        <div className="kpiwall">
          <div className="kpiwall__cell">
            <div className="num tnum">{o.chapters}</div>
            <div className="label">章节记录 <span className="unit">chapters</span></div>
            <div className="en">SOURCE ROWS</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num num--cinnabar tnum">{o.battleChapters}</div>
            <div className="label">战斗章节</div>
            <div className="en">BATTLE CH.</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num num--cinnabar tnum">{o.killChapters}</div>
            <div className="label">明确击杀章节</div>
            <div className="en">KILL CH.</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num num--gold tnum">{o.treasureChapters}</div>
            <div className="label">获得宝物章节</div>
            <div className="en">TREASURE CH.</div>
          </div>
          <div className="kpiwall__cell">
            <div className="num tnum">{s.estimatedYears.toFixed(0)}<span className="unit">年</span></div>
            <div className="label">闭关时长估算</div>
            <div className="en">SECLUSION YR</div>
          </div>
        </div>

        <div className="sub-strip">
          <div><div className="n tnum">{s.highConfidenceYears.toFixed(1)}</div><div className="l">闭关 · 高置信合计（年）</div></div>
          <div><div className="n tnum">{s.estimatedYears.toFixed(0)}</div><div className="l">闭关 · 全估算合计（年）</div></div>
          <div><div className="n tnum">{s.conservativeYears.toFixed(0)}</div><div className="l">闭关 · 去跨章重复（年）</div></div>
          <div><div className="n tnum">{o.events}</div><div className="l">事件总数（原子）</div></div>
        </div>
      </section>

      <SectionHeader
        kicker="人生主图" en="THREE-CHART OVERVIEW"
        title="境界推进 / 事件分布 / 密度热力"
        meta="REALM × EVENT × DENSITY"
      />

      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card__head">
          <div>
            <span className="eyebrow">境界推进线</span>
            <h3 className="chart-card__title">从 10 岁到 900+ 岁的境界曲线</h3>
            <div className="chart-card__sub" style={{ marginTop: 6 }}>
              横轴章节 · 纵轴境界 · 朱砂虚线标注四次大境界突破
            </div>
          </div>
          <span className="chip ink">{realms.length} 阶段</span>
        </div>
        <RealmProgression realms={realms} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <span className="eyebrow cinnabar">事件密度热力图</span>
              <h3 className="chart-card__title">人生哪一段最忙</h3>
              <div className="chart-card__sub" style={{ marginTop: 6 }}>
                按章节分段聚合 · 越深表示该类事件越密集
              </div>
            </div>
          </div>
          <EventDensityHeatmap realms={realms} />
        </div>
        <div className="chart-card">
          <div className="chart-card__head">
            <div>
              <span className="eyebrow gold">事件类型排行</span>
              <h3 className="chart-card__title">韩立到底在干什么</h3>
              <div className="chart-card__sub" style={{ marginTop: 6 }}>
                按事件原子计数 · 含估算
              </div>
            </div>
          </div>
          <EventTypeRanked items={eventTypes} />
        </div>
      </div>

      <SectionHeader kicker="四条主入口" en="START HERE" title="进入数据库" />
      <div className="entries">
        <Link className="entry" href="/timeline">
          <span className="eyebrow">人生时间轴</span>
          <div className="num tnum">{o.chapters}</div>
          <div className="h">按章节浏览经历</div>
          <div className="d">
            事件流 + 7 条筛选：境界、事件类型、是否战斗、是否得宝、是否跑路、是否濒死、是否待复核。
          </div>
          <div className="go">打开时间轴</div>
        </Link>
        <Link className="entry cinnabar" href="/realms">
          <span className="eyebrow cinnabar">境界档案</span>
          <div className="num num--cinnabar tnum">{realms.length}</div>
          <div className="h">按修为阶段看人生</div>
          <div className="d">
            {realms.length} 段境界档案。每段都列出战斗、击杀、跑路、宝物、秘境、人物、置信度。
          </div>
          <div className="go">打开境界档案</div>
        </Link>
        <Link className="entry gold" href="/treasures">
          <span className="eyebrow gold">韩老魔的储物袋</span>
          <div className="num num--gold tnum">{o.treasureChapters}</div>
          <div className="h">看资产如何进出储物袋</div>
          <div className="d">
            法宝、丹药、功法、材料和战利品按入袋章节整理；已消耗或离袋的物品会灰显。
          </div>
          <div className="go">打开储物袋</div>
        </Link>
        <Link className="entry jade" href="/cards">
          <span className="eyebrow jade">分享卡</span>
          <div className="num num--gold tnum">4</div>
          <div className="h">截图传播的修仙履历</div>
          <div className="d">
            阶段履历卡 / 境界档案卡 / 风险年报卡 / 资产清单卡，1200×630，可下载。
          </div>
          <div className="go">查看分享卡</div>
        </Link>
      </div>

      <div className="note" style={{ marginTop: 32 }}>
        <div className="h">关于这份数据库</div>
        现有事件主表来自 <span className="mono">凡人修仙传_UTF8全本.txt</span> 的规则与模糊抽取，
        共 <strong>{o.chapters}</strong> 行章节记录、<strong>{o.events}</strong> 条原子事件。
        平均置信度 <strong>{o.avgConfidence.toFixed(3)}</strong>，含 <strong>{o.needsReview} 条</strong>待复核记录。
        闭关有三套合理口径，
        <Link href="/methodology" style={{ borderBottom: "1px solid currentColor" }}>详见数据口径</Link>。
      </div>
    </div>
  );
}
