export type Locale = "en" | "zh";

export const messages = {
  en: {
    nav: { bookTasting: "Book a tasting" },
    language: {
      ariaToZh: "Switch site language to Chinese",
      ariaToEn: "Switch site language to English",
    },
    home: {
      calmTitle: "Calm space, clear flavors",
      calmBody:
        "Editorial layouts and generous margins keep the focus on what is in the cup—similar spirit to the quiet confidence of a well-made storefront site, without borrowing anyone else's identity.",
    },
    hero: {
      kicker: "One day only · UIUC",
      title: "Coffee, unhurried. A thirty-minute table for up to four.",
      lead:
        "We brew a focused menu of single-origin lots—bright, balanced, and bold—so you can taste with a little guidance and a lot of room to talk. Book a slot, pick a coffee or stay open-minded, and we will meet you there.",
      bookCta: "Book a tasting",
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
      closeDetails: "Close coffee details",
      close: "Close",
      origin: "Origin",
      variety: "Variety",
      producer: "Producer",
      elevation: "Elevation",
      process: "Process",
    },
    bookPage: {
      kicker: "Reservations",
      title: "Book a tasting",
      intro:
        "Saturday, April 18, 2026 · 1:00–5:00 PM at {address}. Choose a half-hour window, up to four people, and a coffee—or pick Unsure and we will pour something that fits the table.",
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
      selectPlaceholder: "Select…",
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
    },
    theme: {
      useDark: "Use dark hero",
      useLight: "Use light hero",
      darkTitle: "Dark hero",
      lightTitle: "Light hero",
    },
  },
  zh: {
    nav: { bookTasting: "预约品鉴" },
    language: {
      ariaToZh: "切换为中文",
      ariaToEn: "切换为英文",
    },
    home: {
      calmTitle: "安静空间，风味清晰",
      calmBody:
        "版式留白把视线留在杯中——像一家用心的小店网站那样克制、自信，但不借用任何人的身份。",
    },
    hero: {
      kicker: "仅一天 · UIUC",
      title: "咖啡，慢慢来。最多四人的三十分钟小桌。",
      lead:
        "我们精选单一产区豆单——明亮、平衡、也有力量感——让你有一点引导，也有足够空间聊天。预约时段，选一款咖啡或保持开放，我们在桌前见。",
      bookCta: "预约品鉴",
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
      closeDetails: "关闭咖啡详情",
      close: "关闭",
      origin: "产地",
      variety: "品种",
      producer: "生产者",
      elevation: "海拔",
      process: "处理法",
    },
    bookPage: {
      kicker: "预约",
      title: "预约品鉴",
      intro:
        "2026年4月18日 · 下午1:00–5:00，地点 {address}。选择半小时时段，最多四人，并选一款咖啡——或选择「不确定」，我们会为这一桌搭配合适的出品。",
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
      selectPlaceholder: "请选择…",
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
