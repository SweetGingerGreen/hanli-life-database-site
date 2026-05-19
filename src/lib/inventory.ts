import siteData from "@/data/site-data.json";

type TreasureRecord = {
  eventId: number;
  chapterId: number;
  chapterTitle: string;
  ageText: string;
  realm: string;
  location: string;
  treasureName: string;
  rawText: string;
  confidenceScore: number;
  extractionMethod: string;
  needsReview: number;
};

type InventorySource = {
  overview: {
    chapters: number;
  };
  treasureRecords: TreasureRecord[];
};

const data = siteData as InventorySource;

export type InventoryStatus = "held" | "left" | "consumed" | "regained" | "unknown";
export type InventoryAction = "acquired" | "left" | "consumed" | "regained" | "unknown";
export type InventoryCategory =
  | "artifact"
  | "consumable"
  | "manual"
  | "talisman"
  | "material"
  | "loot"
  | "spirit"
  | "other";

export type InventoryPoint = {
  chapterId: number;
  eventId: number;
  chapterTitle: string;
  ageText: string;
  realm: string;
  location: string;
};

export type InventoryEvent = InventoryPoint & {
  action: InventoryAction;
  itemName: string;
  sourceName: string;
  rawText: string;
  confidenceScore: number;
  needsReview: boolean;
  note: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  aliases: string[];
  category: InventoryCategory;
  status: InventoryStatus;
  acquiredAt: InventoryPoint;
  lostAt?: InventoryPoint;
  lastSeen: InventoryPoint;
  statusReason: string;
  confidence: number;
  needsReview: boolean;
  events: InventoryEvent[];
};

export type InventoryCategorySummary = {
  category: InventoryCategory;
  count: number;
  held: number;
  gone: number;
};

export type InventoryStats = {
  records: number;
  parsed: number;
  total: number;
  held: number;
  left: number;
  consumed: number;
  regained: number;
  unknown: number;
  maxChapter: number;
  categorySummary: InventoryCategorySummary[];
};

export const CATEGORY_META: Record<InventoryCategory, { zh: string; en: string; seal: string; tone: string }> = {
  artifact: { zh: "法宝法器", en: "Artifacts", seal: "器", tone: "gold" },
  consumable: { zh: "丹药灵草", en: "Pills & herbs", seal: "丹", tone: "jade" },
  manual: { zh: "功法玉简", en: "Manuals", seal: "简", tone: "ink" },
  talisman: { zh: "符箓令牌", en: "Talismans", seal: "符", tone: "cinnabar" },
  material: { zh: "材料灵石", en: "Materials", seal: "石", tone: "moss" },
  spirit: { zh: "灵虫灵兽", en: "Spirits", seal: "灵", tone: "jade" },
  loot: { zh: "战利杂物", en: "Loot", seal: "袋", tone: "ink" },
  other: { zh: "状态杂项", en: "Other", seal: "杂", tone: "ink" },
};

const STATUS_PRIORITY: Record<InventoryAction, number> = {
  acquired: 1,
  unknown: 1,
  left: 2,
  consumed: 2,
  regained: 3,
};

function splitTopLevel(value: string) {
  const raw = String(value || "").trim();
  if (!raw || raw === "无") return [];

  const parts: string[] = [];
  let buffer = "";
  let depth = 0;

  for (const char of raw) {
    if ("(（[【《".includes(char)) depth += 1;
    const isSeparator = depth === 0 && /[\/+＋、，,；;]/.test(char);
    if (isSeparator) {
      if (buffer.trim()) parts.push(buffer.trim());
      buffer = "";
      continue;
    }
    buffer += char;
    if (")）]】》".includes(char)) depth = Math.max(0, depth - 1);
  }

  if (buffer.trim()) parts.push(buffer.trim());
  return parts;
}

function cleanItemName(segment: string) {
  return segment
    .trim()
    .replace(/^以.*?换得[^:：]*[:：]/, "")
    .replace(/^换得/, "")
    .replace(/^取得/, "")
    .replace(/^获得/, "")
    .replace(/^获知/, "")
    .replace(/^学得/, "")
    .replace(/^付出/, "")
    .replace(/^重得/, "")
    .replace(/^取回/, "")
    .replace(/^清理整理/, "")
    .replace(/^其他若干/, "若干")
    .replace(/[。；;，,]+$/, "")
    .trim();
}

function isDescriptionFragment(name: string) {
  if (!name || name === "无" || name.startsWith("无(")) return true;
  if (name.length < 2) return true;
  return /^(可|有|以|用|由|含|号称|传闻|对抗|背后|未明|救人|可解|可灭|可施|到期|后续|首次|其余|另有|筑基期祭炼)/.test(name);
}

function canonicalName(name: string) {
  return name
    .replace(/[（(].*?[）)]/g, "")
    .replace(/^法宝/, "")
    .replace(/^古宝/, "")
    .replace(/^灵宝/, "")
    .replace(/一套$/, "")
    .replace(/数颗$/, "")
    .replace(/数本$/, "")
    .replace(/若干$/, "")
    .replace(/\s+/g, "")
    .trim() || name.trim();
}

function itemKey(name: string) {
  return canonicalName(name).toLowerCase();
}

function inferCategory(name: string, source: string): InventoryCategory {
  const text = `${name} ${source}`;
  if (/噬金虫|啼魂|灵兽|灵虫|傀儡|曲魂/.test(text)) return "spirit";
  if (/功|诀|决|秘籍|剑谱|玉简|玉筒|书|心得|笔录|秘术|法术|咒|真解|典籍/.test(text)) return "manual";
  if (/符|符箓|符宝|令牌|令|禁制|阵盘|阵旗|阵法/.test(text)) return "talisman";
  if (/瓶|剑|刀|盾|鼎|旗|幡|环|珠|尺|扇|舟|靴|镜|钵|钟|铃|刃|锤|甲|针|宝|法器|法宝|古宝|灵宝|玄天/.test(text)) {
    return "artifact";
  }
  if (/灵石|晶|铁|石|材料|鳞|筋|蛟丹|妖丹|矿|金精|乌铁|银芯/.test(text)) return "material";
  if (/丹|丸|散|药|草|芝|参|果|灵花|药花|液|髓|回阳水|灵乳|寒髓|神血/.test(text)) return "consumable";
  if (/储物袋|战利品|遗物|月俸|信物|灵地|洞府|药园/.test(text)) return "loot";
  return "other";
}

function inferAction(segment: string, record: TreasureRecord): { action: InventoryAction; note: string } {
  const direct = segment;
  const source = `${record.treasureName} ${record.rawText}`;

  if (/取回|重得|收回|夺回/.test(source) || /取回|重得|收回|夺回/.test(direct)) {
    return { action: "regained", note: "文本含取回/重得线索" };
  }
  if (/毁|毁灭|耗尽|消耗|用掉|服下|喂|炼化|炼成|成药/.test(direct)) {
    return { action: "consumed", note: "文本含消耗/炼化/毁灭线索" };
  }
  if (/付出|让出|归还|交付|献|脱控|被夺|失去|换出/.test(direct)) {
    return { action: "left", note: "文本含离袋/交付/失去线索" };
  }
  if (/^\(?让出|^\(?被迫交易|^付出/.test(source) && /^让出|^被迫交易|^付出/.test(direct)) {
    return { action: "left", note: "交易或付出线索" };
  }
  if (record.needsReview || /无\(|状态不明|未明/.test(direct)) {
    return { action: "unknown", note: "低置信或待复核线索" };
  }
  return { action: "acquired", note: "按得宝事件计入储物袋" };
}

function toPoint(event: InventoryEvent): InventoryPoint {
  return {
    chapterId: event.chapterId,
    eventId: event.eventId,
    chapterTitle: event.chapterTitle,
    ageText: event.ageText,
    realm: event.realm,
    location: event.location,
  };
}

function statusFromEvents(events: InventoryEvent[]): InventoryStatus {
  const last = [...events]
    .sort((a, b) => a.chapterId - b.chapterId || a.eventId - b.eventId || STATUS_PRIORITY[a.action] - STATUS_PRIORITY[b.action])
    .at(-1);
  if (!last) return "unknown";
  if (last.action === "regained") return "regained";
  if (last.action === "left") return "left";
  if (last.action === "consumed") return "consumed";
  if (events.every((event) => event.action === "unknown")) return "unknown";
  return "held";
}

function statusReason(status: InventoryStatus) {
  if (status === "regained") return "后续取回，重新计入袋中";
  if (status === "left") return "已有离袋/交付/失去线索";
  if (status === "consumed") return "已有消耗/炼化/毁灭线索";
  if (status === "unknown") return "记录置信度较低或语义不完整";
  return "未见明确离袋线索";
}

function buildEvents() {
  return data.treasureRecords.flatMap((record) => {
    const sourceName = record.treasureName || record.rawText || "";
    const segments = splitTopLevel(sourceName);
    return segments.flatMap((segment) => {
      const itemName = cleanItemName(segment);
      if (isDescriptionFragment(itemName)) return [];
      const action = inferAction(segment, record);
      return [{
        eventId: record.eventId,
        chapterId: record.chapterId,
        chapterTitle: record.chapterTitle,
        ageText: record.ageText || "未标注",
        realm: record.realm || "未知",
        location: record.location || "未标注",
        action: action.action,
        itemName,
        sourceName,
        rawText: record.rawText || sourceName,
        confidenceScore: Number(record.confidenceScore ?? 0),
        needsReview: Boolean(record.needsReview),
        note: action.note,
      }];
    });
  });
}

export function getInventoryData() {
  const parsedEvents = buildEvents();
  const groups = new Map<string, InventoryEvent[]>();

  for (const event of parsedEvents) {
    const key = itemKey(event.itemName);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  const items: InventoryItem[] = Array.from(groups.entries()).map(([key, events]) => {
    const sorted = [...events].sort((a, b) => a.chapterId - b.chapterId || a.eventId - b.eventId);
    const status = statusFromEvents(sorted);
    const acquiredEvent = sorted.find((event) => event.action === "acquired" || event.action === "regained") ?? sorted[0];
    const goneEvent = [...sorted].reverse().find((event) => event.action === "left" || event.action === "consumed");
    const lastSeen = sorted[sorted.length - 1];
    const aliases = Array.from(new Set(sorted.map((event) => event.itemName))).slice(0, 5);
    const displayName = aliases.sort((a, b) => a.length - b.length)[0] ?? key;
    const confidence = sorted.reduce((sum, event) => sum + event.confidenceScore, 0) / sorted.length;

    return {
      id: key,
      name: displayName,
      aliases,
      category: inferCategory(displayName, sorted.map((event) => event.sourceName).join(" ")),
      status,
      acquiredAt: toPoint(acquiredEvent),
      lostAt: status === "left" || status === "consumed" ? goneEvent && toPoint(goneEvent) : undefined,
      lastSeen: toPoint(lastSeen),
      statusReason: statusReason(status),
      confidence: Number(confidence.toFixed(3)),
      needsReview: sorted.some((event) => event.needsReview),
      events: sorted,
    };
  });

  items.sort((a, b) => a.acquiredAt.chapterId - b.acquiredAt.chapterId || a.name.localeCompare(b.name, "zh-Hans-CN"));

  const categories = Object.keys(CATEGORY_META) as InventoryCategory[];
  const categorySummary = categories.map((category) => {
    const inCategory = items.filter((item) => item.category === category);
    return {
      category,
      count: inCategory.length,
      held: inCategory.filter((item) => item.status === "held" || item.status === "regained").length,
      gone: inCategory.filter((item) => item.status === "left" || item.status === "consumed").length,
    };
  }).filter((item) => item.count > 0);

  const stats: InventoryStats = {
    records: data.treasureRecords.length,
    parsed: parsedEvents.length,
    total: items.length,
    held: items.filter((item) => item.status === "held").length,
    left: items.filter((item) => item.status === "left").length,
    consumed: items.filter((item) => item.status === "consumed").length,
    regained: items.filter((item) => item.status === "regained").length,
    unknown: items.filter((item) => item.status === "unknown").length,
    maxChapter: data.overview.chapters,
    categorySummary,
  };

  return { items, stats };
}

export function getFeaturedInventory(items: InventoryItem[]) {
  const names = ["神秘小瓶", "青竹蜂云剑", "清竹蜂云剑", "虚天鼎", "八灵尺", "三焰扇", "元磁山", "噬金虫", "曲魂"];
  return names.flatMap((name) => {
    const found = items.find((item) => item.name.includes(name) || item.aliases.some((alias) => alias.includes(name)));
    return found ? [found] : [];
  }).slice(0, 8);
}
