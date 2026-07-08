// CVC Fantasy Golf 2026 - Weekly high-earner bonus schedule
// Season runs weeks 1-21, ending at The Open Championship. Weeks outside
// this range (if any tournaments exist beyond week 21) are not part of
// the weekly bonus pot.
const WEEKLY_BONUS_SCHEDULE = {
  1: { type: 'Full Field', amount: 20 },
  2: { type: 'Signature No Cut', amount: 40 },
  3: { type: 'Signature With Cut', amount: 40 },
  4: { type: 'Signature With Cut', amount: 40 },
  5: { type: 'Full Field - Players Championship', amount: 40 },
  6: { type: 'Full Field', amount: 20 },
  7: { type: 'Full Field', amount: 20 },
  8: { type: 'Full Field', amount: 20 },
  9: { type: 'Major', amount: 50 },
  10: { type: 'Signature No Cut', amount: 40 },
  11: { type: 'Signature No Cut', amount: 40 },
  12: { type: 'Signature No Cut', amount: 40 },
  13: { type: 'Major', amount: 50 },
  14: { type: 'Full Field', amount: 20 },
  15: { type: 'Full Field', amount: 20 },
  16: { type: 'Signature With Cut', amount: 40 },
  17: { type: 'Full Field', amount: 20 },
  18: { type: 'Major', amount: 50 },
  19: { type: 'Signature No Cut', amount: 40 },
  20: { type: 'Full Field', amount: 20 },
  21: { type: 'Major', amount: 50 }
};

const WEEKLY_BONUS_TOTAL_POT = Object.values(WEEKLY_BONUS_SCHEDULE).reduce((sum, w) => sum + w.amount, 0);

// Returns { type, amount } for a given week number, or null if that week
// isn't part of the weekly bonus pot (e.g. outside weeks 1-21).
function getWeeklyBonusInfo(weekNumber) {
  return WEEKLY_BONUS_SCHEDULE[weekNumber] || null;
}
