import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/atoms";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "隐私与广告 · 韩立人生数据库",
  description: "韩立人生数据库的隐私、广告、数据边界和第三方服务说明。",
  alternates: {
    canonical: "/privacy",
    languages: { "zh-CN": "/privacy", en: "/en/privacy" },
  },
};

export default function PrivacyPage() {
  return (
    <div className="page">
      <SectionHeader kicker="隐私与广告" en="PRIVACY & ADS" title="隐私、广告与数据边界" meta="AD-READY" />
      <div className="methodology-grid">
        <div>
          <section className="mt-section">
            <h3>本站收集什么</h3>
            <p>
              本站本身不提供账号注册、评论、支付或用户上传功能。页面展示的是结构化事件字段、统计指标和方法说明。
              站点不会主动要求访问者提交个人信息。
            </p>
          </section>
          <section className="mt-section">
            <h3>广告和分析服务</h3>
            <p>
              站点已预留 Google AdSense / Google tag 接入位。只有在部署环境设置了
              <span className="mono"> NEXT_PUBLIC_ADSENSE_CLIENT </span> 或
              <span className="mono"> NEXT_PUBLIC_GOOGLE_TAG_ID </span> 后，相关第三方脚本才会加载。
              这些服务可能使用 Cookie 或类似技术进行广告投放、频次控制、效果衡量和滞留分析。
            </p>
          </section>
          <section className="mt-section">
            <h3>内容边界</h3>
            <p>
              本项目是非官方同人数据项目，只展示抽取摘要、章号、类型、人物、法宝、地点、置信度和统计口径，
              不作为小说原文阅读器，也不公开章节原文全文。
            </p>
          </section>
        </div>
        <aside>
          <section className="note">
            <div className="h">广告审核准备项</div>
            根目录 <span className="mono">/ads.txt</span> 已预留。
            获取 AdSense 发布商 ID 后，需要在部署环境填入
            <span className="mono"> NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-...</span>。
          </section>
          <section className="note" style={{ marginTop: 16 }}>
            <div className="h">语言版本</div>
            英文版见 <Link href="/en">/en</Link>。英文页面和中文页面共享同一份数据库。
          </section>
        </aside>
      </div>
    </div>
  );
}
