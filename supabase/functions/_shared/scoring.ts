/**
 * Calculate XP earned from a correctly solved problem.
 *
 * Each hint reduces the award by 20% of base XP.
 * Students always retain at least 40%.
 */
export function calculateXP(basePoints: number, hintsUsed: number, maximumHints: number): number {
  if (
    !Number.isSafeInteger(basePoints) ||
    basePoints < 0 ||
    !Number.isSafeInteger(hintsUsed) ||
    hintsUsed < 0 ||
    !Number.isSafeInteger(maximumHints) ||
    maximumHints < 0
  ) {
    throw new Error("Invalid scoring parameters");
  }

  const used = Math.min(hintsUsed, maximumHints);
  const penalty = Math.min(0.6, used * 0.2);

  return Math.round(basePoints * (1 - penalty));
}