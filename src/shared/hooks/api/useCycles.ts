import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/client";
import useAuth from "@/shared/hooks/useAuth";

// Types from the OpenAPI specification
export interface Cycle {
  cycle_id: number;
  cycle_date: string;
  scheduled_at: string;
  status: "SCHEDULED" | "RUNNING" | "COMPLETE";
}

/**
 * Hook to fetch the current cycle
 */
export function useCurrentCycle() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["cycle", "current"],
    queryFn: async (): Promise<Cycle> => {
      return apiRequest<Cycle>({
        url: "/v1/cycle/current",
        method: "GET",
      });
    },
    enabled: isSignedIn,
  });
}

/**
 * Hook to fetch a specific cycle by ID
 */
export function useCycleById(cycleId: string | number | undefined) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["cycle", cycleId],
    queryFn: async (): Promise<Cycle> => {
      // First get all cycles (limited to most recent ones)
      const cycles = await apiRequest<Cycle[]>({
        url: "/v1/admin/cycles",
        method: "GET",
        params: { limit: 10 },
      });
      
      // Find the specific cycle by ID
      const cycle = cycles.find(c => c.cycle_id.toString() === cycleId?.toString());
      
      if (!cycle) {
        throw new Error(`Cycle with ID ${cycleId} not found`);
      }
      
      return cycle;
    },
    enabled: isSignedIn && !!cycleId,
  });
}

/**
 * Hook to fetch recent cycles
 */
export function useRecentCycles(limit = 5) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["cycles", "recent", limit],
    queryFn: async (): Promise<Cycle[]> => {
      return apiRequest<Cycle[]>({
        url: "/v1/admin/cycles",
        method: "GET",
        params: { limit },
      });
    },
    enabled: isSignedIn,
  });
}
