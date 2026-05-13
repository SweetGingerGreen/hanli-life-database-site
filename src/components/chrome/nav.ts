export const NAV = [
  { href: "/", zh: "首页", en: "OVERVIEW", no: "00" },
  { href: "/timeline", zh: "人生时间轴", en: "TIMELINE", no: "01" },
  { href: "/realms", zh: "境界档案", en: "REALMS", no: "02" },
  { href: "/events", zh: "事件库", en: "EVENTS DB", no: "03" },
  { href: "/cards", zh: "分享卡", en: "SHARE CARDS", no: "04" },
  { href: "/methodology", zh: "数据口径", en: "METHODOLOGY", no: "05" },
] as const;

export function navForPath(pathname: string) {
  return NAV.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ?? NAV[0];
}
