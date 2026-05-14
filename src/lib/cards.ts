export const SHARE_CARDS = [
  {
    slug: "resume-yuanying-mid",
    zh: "阶段履历卡 · 元婴中期",
    en: "Life-phase resume · Nascent Soul Mid",
    sub: "LIFE-PHASE RESUME",
  },
  {
    slug: "profile-jiedan-1",
    zh: "境界档案卡 · 结丹初期",
    en: "Realm profile · Core Formation Early",
    sub: "REALM PROFILE",
  },
  {
    slug: "risk-annual",
    zh: "风险年报卡 · 全局",
    en: "Risk annual · global",
    sub: "RISK ANNUAL",
  },
  {
    slug: "seclusion-ledger",
    zh: "资产清单卡 · 闭关年报",
    en: "Asset ledger · seclusion annual",
    sub: "ASSET LEDGER · DARK",
  },
] as const;

export function getShareCard(slug: string) {
  return SHARE_CARDS.find((card) => card.slug === slug) ?? null;
}
