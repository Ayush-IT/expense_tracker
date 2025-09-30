function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function computeNextRun(date, recurrenceType, customIntervalDays) {
  const base = new Date(date);
  switch (recurrenceType) {
    case 'weekly':
      return addDays(base, 7);
    case 'monthly':
      return addMonths(base, 1);
    case 'custom':
      if (!customIntervalDays || customIntervalDays <= 0) return null;
      return addDays(base, customIntervalDays);
    default:
      return null;
  }
}

module.exports = { addDays, addMonths, computeNextRun };
