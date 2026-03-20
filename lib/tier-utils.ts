export type Tier = 'free' | 'pro' | 'business';

export const TIER_LIMITS = {
  free: {
    searchesPerMonth: 5,
    exports: ['pdf', 'json'] as const,
    history: false,
    apiAccess: false,
  },
  pro: {
    searchesPerMonth: 50,
    exports: ['pdf', 'xlsx', 'json', 'csv'] as const,
    history: true,
    apiAccess: false,
  },
  business: {
    searchesPerMonth: 200,
    exports: ['pdf', 'xlsx', 'json', 'csv'] as const,
    history: true,
    apiAccess: true,
  },
} as const;

export function canExport(tier: Tier, format: string): boolean {
  const limits = TIER_LIMITS[tier];
  return (limits.exports as readonly string[]).includes(format);
}

export function getSearchLimit(tier: Tier): number {
  return TIER_LIMITS[tier].searchesPerMonth;
}

export function hasHistory(tier: Tier): boolean {
  return TIER_LIMITS[tier].history;
}
