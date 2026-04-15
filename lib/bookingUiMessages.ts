import type { Locale } from "@/lib/messages";

const toZh: Record<string, string> = {
  "Thanks — you are booked.": "谢谢 — 已记录。",
  "You are booked. See you at Circle Kettle.": "预约成功，Circle Kettle 见。",
  "Please choose a valid timeslot.": "请选择一个有效时段。",
  "Please choose at least one coffee from the list (quantity 1–4 per selection).":
    "请从列表中至少选择一款咖啡（每项数量 1–4）。",
  "Please choose a timeslot.": "请选择一个时段。",
  "Please enter your name.": "请填写您的姓名。",
  "Please enter a valid email address.": "请填写有效的邮箱地址。",
  "Please choose a party size between 1 and 4.": "请选择 1–4 人的同行人数。",
  "Total tasting quantities cannot exceed party size.": "所选咖啡总数量不能超过同行人数。",
  "Bookings are not configured yet. Add Supabase keys to enable reservations.":
    "预约功能尚未配置。请添加 Supabase 密钥以启用预约。",
  "That slot just filled up. Please pick another time.": "该时段刚刚约满，请选择其他时间。",
  "We could not complete the booking. Please try again.": "无法完成预约，请重试。",
  "This email already has a reservation. One booking per guest.":
    "该邮箱已有一条预约记录。每位客人仅限预约一次。",
  "One of the coffees you picked just sold out. Adjust quantities or pick another lot.":
    "您选择的咖啡刚刚售罄。请调整数量或更换款式。",
  "Please enter every guest’s full name for your party size.": "请按人数填写每位客人的全名。",
  "Please enter every guest’s full name (guest 2).": "请填写第二位客人的全名。",
  "Please enter every guest’s full name (guest 3).": "请填写第三位客人的全名。",
  "Please enter every guest’s full name (guest 4).": "请填写第四位客人的全名。",
};

/** Best-effort Chinese copy for known server / client booking strings. */
export function translateBookingUiMessage(message: string, locale: Locale): string {
  if (locale !== "zh" || !message) return message;
  if (toZh[message]) return toZh[message];
  if (message.startsWith("Could not complete booking:")) {
    return `无法完成预约：${message.slice("Could not complete booking:".length).trim()}`;
  }
  const loadMatch = message.match(/^Could not load availability \((\d+)\)\.?$/);
  if (loadMatch) {
    return `无法加载可预约时段（${loadMatch[1]}）。`;
  }
  if (message.startsWith("Live counts unavailable (")) {
    const m = message.match(/^Live counts unavailable \(([^)]+)\)\./);
    if (m) {
      return `实时余位不可用（${m[1]}）。为便于规划，时段仍显示满额容量。`;
    }
  }
  return message;
}
