import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/client";
import useAuth from "@/shared/hooks/useAuth";
import { Cycle } from "./useCycles";
import { MatchCurrentResponse, AllMatchesResponse } from "./useMatches";

/**
 * Custom hook for the Today page that fetches all required data
 */
export function useTodayData() {
  const { isSignedIn, getTelegramId } = useAuth();
  const telegramId = getTelegramId();

  // Fetch current cycle
  const cycleQuery = useQuery({
    queryKey: ["cycle", "current"],
    queryFn: async (): Promise<Cycle> => {
      return apiRequest<Cycle>({
        url: "/v1/cycle/current",
        method: "GET",
      });
    },
    enabled: isSignedIn,
  });

  // Fetch current match
  const matchQuery = useQuery({
    queryKey: ["match", "current", telegramId],
    queryFn: async (): Promise<MatchCurrentResponse> => {
      return apiRequest<MatchCurrentResponse>({
        url: `/v1/match/current`,
        method: "GET",
        params: { telegram_id: telegramId },
      });
    },
    enabled: isSignedIn && !!telegramId,
  });

  // Fetch all matches for the current cycle if the user is matched
  const allMatchesQuery = useQuery({
    queryKey: ["matches", "all", cycleQuery.data?.cycle_id],
    queryFn: async (): Promise<AllMatchesResponse> => {
      return apiRequest<AllMatchesResponse>({
        url: `/v1/match/all`,
        method: "GET",
        params: { cycle_id: cycleQuery.data?.cycle_id },
      });
    },
    enabled: isSignedIn && 
      !!cycleQuery.data?.cycle_id && 
      matchQuery.data?.status === 'MATCHED' &&
      !!matchQuery.data?.group,
  });

  // Determine match status
  const getMatchStatus = (): 'waiting' | 'matched' | 'none' => {
    if (!matchQuery.data) return 'none';
    
    if (matchQuery.data.status === 'MATCHED' && matchQuery.data.group) {
      return 'matched';
    }
    
    return 'waiting';
  };

  return {
    cycle: cycleQuery.data,
    match: matchQuery.data,
    allMatches: allMatchesQuery.data,
    matchStatus: getMatchStatus(),
    isLoading: cycleQuery.isLoading || matchQuery.isLoading,
    error: cycleQuery.error || matchQuery.error,
  };
}
