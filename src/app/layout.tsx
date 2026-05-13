// src/app/layout.tsx — root shell
import type { Metadata } from "next";
import "@/styles/globals.css";
import { TopBar } from "@/components/chrome/TopBar";
import { SideRail } from "@/components/chrome/SideRail";
import { Footer } from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "韩立人生数据库 · Han Li · Life Database",
  description: "1324 章、1998 事件、22 段境界、3 套闭关口径，全部公开口径与置信度。",
  openGraph: {
    title: "韩立人生数据库",
    description: "一份算得清楚的修仙履历。",
    type: "website",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      data-color-mode="paper"
      data-font="song"
      suppressHydrationWarning
    >
      <body>
        <div className="shell">
          <TopBar initialColorMode="paper" initialFont="song" />
          <div className="layout">
            <SideRail />
            <main className="main">
              {children}
              <Footer />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
