import { apiFetch } from "../api/client";

/**
 * How each recorded action reads in the activity feed.
 *
 * Phrases are stored whole rather than assembled from a verb plus a noun, because Arabic
 * agreement changes the adjective with the noun's gender — "كتاب … جديد" but "باقة جديدة".
 * Composing them would get that wrong about half the time.
 *
 * `{name}` is replaced with the affected thing's name; `_fallback` covers records whose
 * entity type has no phrase of its own.
 */
const PHRASES = {
  Registered: {
    ApplicationUser: "انضم كطالب جديد",
    _fallback: "انضم كطالب جديد",
  },
  RoleChanged: {
    ApplicationUser: "قام بتغيير دور {name}",
    _fallback: "قام بتغيير دور مستخدم",
  },
  UserActivated: {
    ApplicationUser: "قام بتفعيل حساب {name}",
    _fallback: "قام بتفعيل حساب مستخدم",
  },
  UserDeactivated: {
    ApplicationUser: "قام بإيقاف حساب {name}",
    _fallback: "قام بإيقاف حساب مستخدم",
  },
  AchievementUnlocked: {
    Achievement: "حصل على إنجاز {name}",
    _fallback: "حصل على إنجاز",
  },
  Created: {
    HadithBook: "قام بإضافة كتاب {name}",
    ExplanationBook: "قام بإضافة كتاب شرح للشيخ {name}",
    SubscriptionPlan: "قام بإضافة باقة {name}",
    SubscriptionPlanPrice: "قام بإضافة سعر جديد لباقة {name}",
    Achievement: "قام بإضافة إنجاز {name}",
    _fallback: "قام بإضافة عنصر جديد",
  },
  Updated: {
    HadithBook: "قام بتعديل كتاب {name}",
    ExplanationBook: "قام بتعديل كتاب شرح الشيخ {name}",
    SubscriptionPlan: "قام بتعديل باقة {name}",
    SubscriptionPlanPrice: "قام بتعديل سعر باقة {name}",
    Achievement: "قام بتعديل إنجاز {name}",
    _fallback: "قام بتعديل عنصر",
  },
  SoftDeleted: {
    HadithBook: "قام بحذف كتاب {name}",
    ExplanationBook: "قام بحذف كتاب شرح الشيخ {name}",
    SubscriptionPlan: "قام بحذف باقة {name}",
    Achievement: "قام بحذف إنجاز {name}",
    _fallback: "قام بحذف عنصر",
  },
  Restored: {
    _fallback: "قام باسترجاع عنصر محذوف",
  },
};

/** Stand-ins for records that carry no name, so no row renders an empty slot. */
const NAMELESS = {
  HadithBook: "أحاديث",
  ExplanationBook: "غير محدد",
  SubscriptionPlan: "غير محددة",
  SubscriptionPlanPrice: "غير محددة",
  Achievement: "غير محدد",
  ApplicationUser: "مستخدم",
};

/**
 * The sentence shown after the actor's name, e.g. "قام بإضافة كتاب رياض الصالحين".
 * Falls back to the server's own description if the action is one we have no phrase for.
 */
export function describeAuditEntry(entry) {
  const byAction = PHRASES[entry.action];
  if (!byAction) return entry.description || "قام بإجراء";

  const template = byAction[entry.entityType] || byAction._fallback;
  if (!template) return entry.description || "قام بإجراء";
  if (!template.includes("{name}")) return template;

  const name = entry.entityName || NAMELESS[entry.entityType];
  if (!name) return byAction._fallback || template.replace(" {name}", "");

  return template.replace("{name}", name);
}

/**
 * Who performed the action. The record stores the display name as it stood at the time;
 * rows written before that column existed fall back to the email, whose local part reads
 * better than the full address in a feed.
 */
export function describeActor(entry) {
  if (entry.actorName) return entry.actorName;
  if (entry.actorEmail) return entry.actorEmail.split("@")[0];
  return "مستخدم";
}


/**
 * The categories offered in the feed's filter.
 *
 * Each maps to whatever the API needs to express it, which is sometimes more than one
 * value: a "الباقات" entry covers both the plan and its prices, and the endpoint accepts
 * those as a comma-separated list so the category stays a single request.
 */
export const ACTIVITY_CATEGORIES = [
  { id: "all", label: "كل النشاطات", filters: {} },
  { id: "new-users", label: "مستخدمون جدد", filters: { action: "Registered" } },
  { id: "roles", label: "تغيير الأدوار", filters: { action: "RoleChanged" } },
  { id: "achievements", label: "الإنجازات", filters: { action: "AchievementUnlocked" } },
  { id: "hadith-books", label: "كتب الأحاديث", filters: { entityType: "HadithBook" } },
  { id: "explanation-books", label: "كتب الشرح", filters: { entityType: "ExplanationBook" } },
  {
    id: "plans",
    label: "الباقات والأسعار",
    filters: { entityType: "SubscriptionPlan,SubscriptionPlanPrice" },
  },
];

/** Preset spans for the date filter, plus the custom option the UI fills in itself. */
export const DATE_RANGES = [
  { id: "7", label: "آخر 7 أيام", days: 7 },
  { id: "30", label: "آخر 30 يوماً", days: 30 },
  { id: "60", label: "آخر 60 يوماً", days: 60 },
  { id: "custom", label: "مدة مخصصة", days: null },
];

/** ISO string for midnight `days` ago. */
export function daysAgoIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export const auditService = {
  /**
   * One page of audit entries, newest first.
   * @param {{page?: number, pageSize?: number, action?: string, entityType?: string,
   *          from?: string, to?: string, succeeded?: boolean|null}} filters
   */
  async getAuditLogs(filters = {}) {
    const empty = { items: [], page: 1, pageSize: 0, totalCount: 0, totalPages: 0 };
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === "") continue;
      params.set(key, String(value));
    }

    const data = await apiFetch(`/api/Admin/audit-logs?${params.toString()}`);
    if (!data || !Array.isArray(data.items)) return empty;
    return data;
  },
};
