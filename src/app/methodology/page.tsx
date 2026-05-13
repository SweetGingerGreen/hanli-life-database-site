import { SectionHeader } from "@/components/ui/atoms";
import { getOverview } from "@/lib/queries/overview";
import { getSeclusionStats } from "@/lib/queries/seclusion";

export const revalidate = 604800;

export default function MethodologyPage() {
  const overview = getOverview();
  const seclusion = getSeclusionStats();
  const highRate = Math.round((seclusion.highConfidenceYears / seclusion.estimatedYears) * 100);
  const conservativeRate = Math.round((seclusion.conservativeYears / seclusion.estimatedYears) * 100);

  return (
    <div className="page">
      <SectionHeader
        kicker="数据口径"
        en="METHODOLOGY"
        title="这不是原文站，是一份可追溯的人生账本"
        meta="SCHEMA v1.1"
      />

      <div className="methodology-grid">
        <div>
          <section className="mt-section">
            <h3>三层口径</h3>
            <div className="sub">CHAPTER · EVENT · SECLUSION</div>
            <p>
              首页的大数默认是章节级口径：同一章里发生多场战斗，也只算一个战斗章节。
              事件库使用事件原子口径，每条抽取记录独立展示，所以适合反查人物、法宝、地点和质量。
            </p>
            <div className="code-block">
              <span className="k">chapters</span> = <span className="v">{overview.chapters}</span> <span className="c"># 章节记录</span><br />
              <span className="k">events</span> = <span className="v">{overview.events}</span> <span className="c"># 事件原子</span><br />
              <span className="k">numbering_anomaly_count</span> = <span className="v">{overview.numberingAnomalies}</span><br />
              <span className="k">needs_review</span> = <span className="v">{overview.needsReview}</span>
            </div>
          </section>

          <section className="mt-section">
            <h3>闭关为什么有三套数字</h3>
            <div className="sub">HIGH CONFIDENCE · ESTIMATED · CONSERVATIVE</div>
            <p>
              闭关时长经常写成“数年”“月余”“又过数载”，直接相加会误导。
              所以这里同时展示高置信合计、全估算合计、去掉跨章延续嫌疑后的保守合计。
            </p>
            <div className="quality-bars">
              <div className="row">
                <span>高置信</span>
                <div className="b high"><div style={{ width: `${highRate}%` }} /></div>
                <strong>{seclusion.highConfidenceYears.toFixed(1)} 年</strong>
              </div>
              <div className="row">
                <span>全估算</span>
                <div className="b mid"><div style={{ width: "100%" }} /></div>
                <strong>{seclusion.estimatedYears.toFixed(1)} 年</strong>
              </div>
              <div className="row">
                <span>保守</span>
                <div className="b low"><div style={{ width: `${conservativeRate}%` }} /></div>
                <strong>{seclusion.conservativeYears.toFixed(1)} 年</strong>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <section className="mt-section qa-list">
            <div className="qa-item">
              <div className="q">为什么不展示原文？</div>
              <div className="a">本站只展示结构化字段和抽取摘要，不做原文阅读器，避免把小说正文塞进前端 payload。</div>
            </div>
            <div className="qa-item">
              <div className="q">待复核记录怎么处理？</div>
              <div className="a">不隐藏。它们会带低置信/待复核标记，方便之后人工校对，也避免统计口径看起来过度确定。</div>
            </div>
            <div className="qa-item">
              <div className="q">境界为什么是 {overview.events} 事件而不是固定 14 档？</div>
              <div className="a">真实数据里有炼气细分、未知段和临时跌落/恢复记录，因此按数据库实际境界分组展示。</div>
            </div>
          </section>

          <section className="note">
            <div className="h">质量快照</div>
            平均置信度 <strong>{overview.avgConfidence.toFixed(3)}</strong>。
            待复核 <strong>{overview.needsReview}</strong> 条。
            闭关延续嫌疑 <strong>{seclusion.continuationSuspects}</strong> 段。
          </section>
        </aside>
      </div>
    </div>
  );
}
