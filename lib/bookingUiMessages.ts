import type { Locale } from "@/lib/messages";

const toZh: Record<string, string> = {
  "Thanks — you are booked.": "谢谢 — 已记录。",
  "You are booked. See you at Circle Kettle.": "预约成功，Circle Kettle 见。",
  "Please choose a valid timeslot.": "请选择一个有效时段。",
  "Please choose a coffee from the list (or Unsure).": "请从列表中选择一款咖啡（或「不确定」）。",
  "Bookings are not configured yet. Add Supabase keys to enable reservations.":
    "预约功能尚未配置。请添加 Supabase 密钥以启用预约。",
  "That slot just filled up. Please pick another time.": "该时段刚刚约满，请选择其他时间。",
  "We could not complete the booking. Please try again.": "无法完成预约，请重试。",
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
