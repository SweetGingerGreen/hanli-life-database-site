import type { EventFlag, EventType, RealmKey, TimelineEvent } from "./types";

export type Locale = "zh" | "en";

export const LOCALES: Locale[] = ["zh", "en"];

export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
}

export function localizedPath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === "zh") return clean === "/en" ? "/" : clean.replace(/^\/en(?=\/|$)/, "") || "/";
  const withoutLocale = clean.replace(/^\/en(?=\/|$)/, "") || "/";
  return withoutLocale === "/" ? "/en" : `/en${withoutLocale}`;
}

export function alternatePath(pathname: string, target: Locale) {
  return localizedPath(target, pathname);
}

export const SITE_COPY = {
  zh: {
    name: "韩立人生数据库",
    enName: "Han Li · Life Database · v1.1",
    seal: "韩",
    chapters: "章",
    events: "事件",
    realms: "境界",
    navHead: "导航",
    navHeadEn: "NAV",
    schema: "schema",
    updated: "updated",
    numbering: "numbering",
    license: "license",
    licenseValue: "非商用引用",
    languageLabel: "EN",
  },
  en: {
    name: "Han Li Life Database",
    enName: "Mortal's Journey to Immortality · v1.1",
    seal: "HL",
    chapters: "chapters",
    events: "events",
    realms: "realms",
    navHead: "Sections",
    navHeadEn: "NAV",
    schema: "schema",
    updated: "updated",
    numbering: "numbering",
    license: "license",
    licenseValue: "non-commercial citation",
    languageLabel: "中文",
  },
} as const;

export const NAV_COPY = [
  { key: "home", href: "/", zh: "首页", en: "Overview", eyebrow: "OVERVIEW", no: "00" },
  { key: "timeline", href: "/timeline", zh: "人生时间轴", en: "Timeline", eyebrow: "TIMELINE", no: "01" },
  { key: "realms", href: "/realms", zh: "境界档案", en: "Realm Profiles", eyebrow: "REALMS", no: "02" },
  { key: "events", href: "/events", zh: "事件库", en: "Events DB", eyebrow: "EVENTS DB", no: "03" },
  { key: "treasures", href: "/treasures", zh: "韩老魔的储物袋", en: "Storage Pouch", eyebrow: "POUCH", no: "04" },
  { key: "cards", href: "/cards", zh: "分享卡", en: "Share Cards", eyebrow: "SHARE CARDS", no: "05" },
  { key: "methodology", href: "/methodology", zh: "数据口径", en: "Methodology", eyebrow: "METHODOLOGY", no: "06" },
  { key: "privacy", href: "/privacy", zh: "隐私与广告", en: "Privacy & Ads", eyebrow: "PRIVACY", no: "07" },
] as const;

export function navForPath(pathname: string) {
  const withoutLocale = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return NAV_COPY.find((item) => item.href === "/" ? withoutLocale === "/" : withoutLocale.startsWith(item.href)) ?? NAV_COPY[0];
}

export const TYPE_LABELS: Record<EventType, { zh: string; en: string; rail: "cinnabar"|"gold"|"jade"|"moss"|"ink" }> = {
  battle:       { zh: "战斗", en: "Battle", rail: "cinnabar" },
  injury:       { zh: "受伤", en: "Injury", rail: "cinnabar" },
  relationship: { zh: "结识", en: "Relationship", rail: "moss" },
  treasure:     { zh: "宝物", en: "Treasure", rail: "gold" },
  secret_realm: { zh: "秘境", en: "Secret realm", rail: "jade" },
  seclusion:    { zh: "闭关", en: "Seclusion", rail: "ink" },
  refining:     { zh: "炼丹", en: "Alchemy", rail: "gold" },
  lifespan:     { zh: "寿元", en: "Lifespan", rail: "gold" },
  other:        { zh: "其他", en: "Other", rail: "ink" },
};

export const FLAG_LABELS: Record<EventFlag, { zh: string; en: string; shortZh: string; shortEn: string; rail: "cinnabar"|"gold"|"jade"|"moss"|"ink" }> = {
  battle: { zh: "战斗", en: "Battle", shortZh: "战", shortEn: "BAT", rail: "cinnabar" },
  kill: { zh: "击杀", en: "Kill", shortZh: "杀", shortEn: "KILL", rail: "cinnabar" },
  flee: { zh: "跑路", en: "Escape", shortZh: "逃", shortEn: "RUN", rail: "cinnabar" },
  near_death: { zh: "濒死", en: "Near death", shortZh: "危", shortEn: "RISK", rail: "cinnabar" },
  betrayed: { zh: "被骗", en: "Betrayed", shortZh: "叛", shortEn: "BET", rail: "cinnabar" },
  injury: { zh: "受伤", en: "Injury", shortZh: "伤", shortEn: "INJ", rail: "cinnabar" },
  treasure: { zh: "得宝", en: "Treasure", shortZh: "宝", shortEn: "TRS", rail: "gold" },
  refining: { zh: "炼丹", en: "Alchemy", shortZh: "丹", shortEn: "ALC", rail: "gold" },
  lifespan: { zh: "寿元", en: "Lifespan", shortZh: "寿", shortEn: "LIFE", rail: "gold" },
  secret_realm: { zh: "秘境", en: "Secret realm", shortZh: "秘", shortEn: "MAP", rail: "jade" },
  seclusion: { zh: "闭关", en: "Seclusion", shortZh: "闭", shortEn: "SECL", rail: "ink" },
  relationship: { zh: "结识", en: "Relationship", shortZh: "友", shortEn: "REL", rail: "moss" },
};

const REALM_EN: Record<string, string> = {
  "凡人": "Mortal",
  "炼气1": "Qi Condensation 1",
  "炼气3": "Qi Condensation 3",
  "炼气4": "Qi Condensation 4",
  "炼气5": "Qi Condensation 5",
  "炼气6": "Qi Condensation 6",
  "炼气7": "Qi Condensation 7",
  "炼气8": "Qi Condensation 8",
  "炼气9": "Qi Condensation 9",
  "炼气11": "Qi Condensation 11",
  "未知": "Unknown",
  "炼气13": "Qi Condensation 13",
  "筑基初": "Foundation Establishment Early",
  "筑基中": "Foundation Establishment Mid",
  "筑基后": "Foundation Establishment Late",
  "结丹初": "Core Formation Early",
  "结丹中": "Core Formation Mid",
  "结丹后": "Core Formation Late",
  "元婴初": "Nascent Soul Early",
  "元婴中": "Nascent Soul Mid",
  "元婴后": "Nascent Soul Late",
  "化神": "Deity Transformation",
};

export function label(locale: Locale, zh: string, en: string) {
  return locale === "en" ? en : zh;
}

export function eventTypeLabel(type: EventType, locale: Locale) {
  const meta = TYPE_LABELS[type] ?? TYPE_LABELS.other;
  return locale === "en" ? meta.en : meta.zh;
}

export function realmLabel(realm: RealmKey, locale: Locale) {
  return locale === "en" ? (REALM_EN[realm] ?? realm) : realm;
}

export function valueLabel(value: string, locale: Locale) {
  if (locale === "zh") return value;
  if (!value || value === "无") return "none";
  if (value === "未标注") return "unmarked";
  if (value === "未知") return "unknown";
  return value;
}

export function ageLabel(age: string, locale: Locale) {
  if (locale === "zh") return age;
  if (!age || age === "未标注") return "age unmarked";
  return age.replace(/约/g, "~").replace(/岁/g, " yrs").replace(/前后/g, " approx.");
}

export function eventHref(event: TimelineEvent, locale: Locale) {
  return localizedPath(locale, `/events/${event.id}`);
}

export function realmHref(slug: string, locale: Locale) {
  return localizedPath(locale, `/realms/${slug}`);
}
