export type Locale = "en" | "zh";

export const messages = {
  en: {
    nav: { bookTasting: "Book a tasting", home: "Home" },
    language: {
      ariaToZh: "Switch site language to Chinese",
      ariaToEn: "Switch site language to English",
    },
    home: {
      calmTitle: "Calm space, clear flavors",
      calmBody:
        "We keep things simple so the coffee speaks for itself. No distractions—just clear, expressive cups.",
    },
    hero: {
      kicker: "One day only · UIUC",
      title: "Black Coffee, Reimagined.",
      lead: `Forget what you know about typical black coffee.

Floral. Fruity. Naturally sweet—
nothing added.

Come taste the difference.`,
      bookCta: "Book a tasting",
      exploreCoffees: "Explore our coffees",
      hours: "Hours",
      contact: "Contact",
      address: "Address",
    },
    visitBlock: {
      hours: "Hours",
      contact: "Contact",
      address: "Address",
    },
    beans: {
      listLabel: "Featured coffees",
      moreDetails: "More details",
      closeDetails: "Close coffee details",
      close: "Close",
      origin: "Origin",
      variety: "Variety",
      producer: "Producer",
      elevation: "Elevation",
      process: "Process",
      cupsLeft: "{count} tasting cups left",
      soldOut: "Sold out for this event",
      cupCountsUnavailable: "Cup counts unavailable right now.",
    },
    bookPage: {
      kicker: "Reservations",
      title: "Book a tasting",
      intro:
        "Saturday, April 18, 2026 · 1:00–5:00 PM at {address}. Choose a half-hour window, up to four people, and which coffee(s) you would like to taste.",
      introAddress: "1004 W Main Street, Urbana, IL 61801, Unit 204",
    },
    bookForm: {
      yourVisit: "Your visit",
      visitHelp:
        "Slots are 30 minutes, shared with other small parties until the room cap is reached.",
      whenLabel: "When ·",
      whereLabel: "Where ·",
      whenValue: "Saturday, April 18, 2026 · 1:00–5:00 PM (Central)",
      whereValue: "1004 W Main Street, Urbana, IL 61801, Unit 204",
      loadingSlots: "Loading…",
      timeslot: "Timeslot",
      noSlots: "No slots are available right now. Please check back later.",
      full: "Full",
      spots: "{remaining} / {capacity} spots",
      partySize: "Party size",
      guest: "guest",
      guests: "guests",
      coffeeChoice: "Coffee to taste",
      coffeeChoiceHelp:
        "Check one or more coffees and choose quantity (1–4 cups each, up to your party size).",
      priceSuffix: "7 USD",
      qty: "Qty",
      selectPlaceholder: "Select…",
      guest1: "Guest 1 name",
      guest2: "Guest 2 name",
      guest3: "Guest 3 name",
      guest4: "Guest 4 name",
      name: "Name",
      email: "Email",
      phone: "Phone",
      optional: "(optional)",
      notes: "Notes",
      privacy:
        "We only use your details to run this reservation. You can add a fuller privacy policy later; nothing here opts you into marketing.",
      sending: "Sending…",
      confirm: "Confirm booking",
      slotLoadError: "Could not load availability.",
      slotLoadErrorStatus: "Could not load availability ({status}).",
      slotLiveCounts:
        "Live counts unavailable ({reason}). Slots still show full capacity for planning.",
      coffeeCupsLeft: "{count} cups left",
      coffeeSoldOutBadge: "Sold out",
      coffeeCupLiveCounts:
        "Live cup counts unavailable ({reason}). You can still choose coffees; we will confirm at booking.",
    },
    theme: {
      useDark: "Use dark hero",
      useLight: "Use light hero",
      darkTitle: "Dark hero",
      lightTitle: "Light hero",
    },
  },
  zh: {
    nav: { bookTasting: "预约品鉴", home: "首页" },
    language: {
      ariaToZh: "切换为中文",
      ariaToEn: "切换为英文",
    },
    home: {
      calmTitle: "安静空间，风味清晰",
      calmBody:
        "我们把一切保持简单，让咖啡自己说话。没有干扰——只有清晰、富有表达力的风味。",
    },
    hero: {
      kicker: "仅一天 · UIUC",
      title: "咖啡，慢慢来。最多四人的三十分钟小桌。",
      lead: `黑咖啡？又苦、又冲、又涩？

再想想。

花香、果香、自然回甘—
不加任何东西。

不信？来试试。`,
      bookCta: "预约品鉴",
      exploreCoffees: "探索我们的咖啡",
      hours: "时间",
      contact: "联系",
      address: "地址",
    },
    visitBlock: {
      hours: "时间",
      contact: "联系",
      address: "地址",
    },
    beans: {
      listLabel: "精选咖啡",
      moreDetails: "更多详情",
      closeDetails: "关闭咖啡详情",
      close: "关闭",
      origin: "产地",
      variety: "品种",
      producer: "生产者",
      elevation: "海拔",
      process: "处理法",
      cupsLeft: "剩余 {count} 杯品鉴",
      soldOut: "本场已售罄",
      cupCountsUnavailable: "暂时无法显示剩余杯数。",
    },
    bookPage: {
      kicker: "预约",
      title: "预约品鉴",
      intro:
        "2026年4月18日 · 下午1:00–5:00，地点 {address}。选择半小时时段，最多四人，并选择想品鉴的咖啡。",
      introAddress: "1004 W Main Street, Urbana, IL 61801, Unit 204",
    },
    bookForm: {
      yourVisit: "你的到访",
      visitHelp: "每个时段为30分钟，与其他小桌共享空间，直至人数上限。",
      whenLabel: "时间 ·",
      whereLabel: "地点 ·",
      whenValue: "2026年4月18日 · 下午1:00–5:00（美中时间）",
      whereValue: "1004 W Main Street, Urbana, IL 61801, Unit 204",
      loadingSlots: "加载中…",
      timeslot: "时段",
      noSlots: "目前没有可预约时段，请稍后再试。",
      full: "已满",
      spots: "剩余 {remaining} / {capacity} 位",
      partySize: "人数",
      guest: "位",
      guests: "位",
      coffeeChoice: "想品鉴的咖啡",
      coffeeChoiceHelp:
        "可勾选一款或多款咖啡并分别选择数量（1–4 杯，且不超过人数）。",
      priceSuffix: "7 美元",
      qty: "数量",
      selectPlaceholder: "请选择…",
      guest1: "第 1 位姓名",
      guest2: "第 2 位姓名",
      guest3: "第 3 位姓名",
      guest4: "第 4 位姓名",
      name: "姓名",
      email: "邮箱",
      phone: "电话",
      optional: "（选填）",
      notes: "备注",
      privacy:
        "我们仅将您的信息用于本次预约。完整的隐私政策可后续补充；此处不会将您加入营销列表。",
      sending: "提交中…",
      confirm: "确认预约",
      slotLoadError: "无法加载可预约时段。",
      slotLoadErrorStatus: "无法加载可预约时段（{status}）。",
      slotLiveCounts: "实时余位不可用（{reason}）。为便于规划，时段仍显示满额容量。",
      coffeeCupsLeft: "剩余 {count} 杯",
      coffeeSoldOutBadge: "已售罄",
      coffeeCupLiveCounts:
        "实时杯数不可用（{reason}）。仍可勾选；最终以提交预约时为准。",
    },
    theme: {
      useDark: "使用深色主视觉",
      useLight: "使用浅色主视觉",
      darkTitle: "深色主视觉",
      lightTitle: "浅色主视觉",
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Replace `{key}` placeholders in a string. */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export function getMessage(locale: Locale, path: string): string {
  const fromLocale = getNested(messages[locale] as unknown as Record<string, unknown>, path);
  if (fromLocale) return fromLocale;
  const fallback = getNested(messages.en as unknown as Record<string, unknown>, path);
  return fallback ?? path;
}
