// ==========================================
// GET LOCAL DATE
// ==========================================

export const getLocalDate = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

// ==========================================
// GET MONTH KEY
// Example: 2026-08
// ==========================================

export const getMonthKey = (dateValue) => {
  const date = getLocalDate(dateValue);

  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

// ==========================================
// GET CURRENT MONTH
// ==========================================

export const getCurrentMonth = () => {
  return getMonthKey(new Date());
};

// ==========================================
// FORMAT DATE
// Example: 09 Aug 2026
// ==========================================

export const formatDate = (dateValue) => {
  const date = getLocalDate(dateValue);

  if (!date) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ==========================================
// FORMAT MONTH
// Example: August 2026
// ==========================================

export const formatMonth = (monthKey) => {
  if (!monthKey) return "";

  const date = new Date(`${monthKey}-01T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};
