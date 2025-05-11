import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/client";
import useAuth from "@/shared/hooks/useAuth";

// Types from the OpenAPI specification
export interface MatchMember {
  telegram_id: string;
  username: string;
  display_name: string;
}

export interface MatchCurrentResponse {
  status: 'PENDING' | 'MATCHED';
  group?: MatchMember[];
}

export interface Match {
  group_id: number;
  members: MatchMember[];
}

export interface AllMatchesResponse {
  matches: Match[];
}

/**
 * Hook to fetch current match
 */
export function useCurrentMatch() {
  const { isSignedIn, getTelegramId } = useAuth();
  const telegramId = getTelegramId();

  return useQuery({
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
}

/**
 * Hook to fetch match history
 */
export function useMatchHistory(page = 1, perPage = 50) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["matches", "history", page, perPage],
    queryFn: async (): Promise<AllMatchesResponse> => {
      return apiRequest<AllMatchesResponse>({
        url: "/v1/matches/history",
        method: "GET",
        params: { page, per_page: perPage },
      });
    },
    enabled: isSignedIn,
  });
}

/**
 * Hook to fetch all matches for a specific cycle
 */
export function useCycleMatches(cycleId: number | undefined) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["matches", "cycle", cycleId],
    queryFn: async (): Promise<AllMatchesResponse> => {
      return apiRequest<AllMatchesResponse>({
        url: `/v1/match/all`,
        method: "GET",
        params: { cycle_id: cycleId },
      });
    },
    enabled: isSignedIn && !!cycleId,
  });
}
