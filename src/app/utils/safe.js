// C:\github_test\bmta-cms-portal\src\app\utils\safe.js

export const safeText = (v, fallback = "-") => {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
};

export const safeNormalize = (v) => {
  if (!v) return null;
  return String(v).trim().toLowerCase();
};

export const safeDate = (v) => {
  if (!v) return "-";

  // ป้องกัน 0001-01-01
  if (String(v).startsWith("0001-01-01")) return "-";

  const d = new Date(v);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("th-TH");
};

// sanitize case สำหรับ ticket list
export const sanitizeCase = (c) => ({
  // if (!c) return c;

  // return {
    ...c, // เก็บ field จาก backend ทั้งหมดไว้ก่อน

    // sanitize เฉพาะค่าที่ต้องแสดง
    caseId: safeText(c.caseId),
    statusId: safeText(c.statusId),

    // คงชื่อ field เดิม ไม่เปลี่ยนชื่อ
    // caseTypeId: c.caseTypeId ?? null,
    // caseSTypeId: c.caseSTypeId ?? null,

    startedDate: c.startedDate ?? null,
    createdAt: c.createdAt ?? null,

    countryId: c.countryId ?? null,
    provId: c.provId ?? null,
    distId: c.distId ?? null,
  });
