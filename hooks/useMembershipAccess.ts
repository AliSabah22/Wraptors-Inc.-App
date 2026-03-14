import { useAuthStore } from '@/store/authStore';
import { MembershipTier } from '@/types';

const TIER_RANK: Record<MembershipTier, number> = {
  guest: 0,
  standard: 1,
  gold: 2,
  platinum: 3,
};

export interface MembershipAccessResult {
  tier: MembershipTier;
  isGuest: boolean;
  isAuthenticated: boolean;
  hasAccess: (required: MembershipTier) => boolean;
  tierRank: (t: MembershipTier) => number;
}

export function useMembershipAccess(): MembershipAccessResult {
  const { user, isGuest, isAuthenticated } = useAuthStore();

  const tier: MembershipTier =
    isGuest || !isAuthenticated ? 'guest' : (user?.membershipTier ?? 'standard');

  function hasAccess(required: MembershipTier): boolean {
    return TIER_RANK[tier] >= TIER_RANK[required];
  }

  function tierRank(t: MembershipTier): number {
    return TIER_RANK[t];
  }

  return { tier, hasAccess, tierRank, isGuest, isAuthenticated };
}
