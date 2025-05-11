import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/client";
import useAuth from "@/shared/hooks/useAuth";

// Types from the OpenAPI specification
export interface UserBrief {
  telegram_id: string;
  username: string;
  display_name: string;
  joined_at: string;
}

export interface QueuesResponse {
  ONE_ON_ONE: UserBrief[];
  SMALL: UserBrief[];
  LARGE: UserBrief[];
}

// Queue type
export type QueueType = "ONE_ON_ONE" | "SMALL" | "LARGE";

// React Query key for queues
const QUEUES_QUERY_KEY = ["queues"];

/**
 * Hook to fetch current queues
 */
export function useQueues() {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: QUEUES_QUERY_KEY,
    queryFn: async (): Promise<QueuesResponse> => {
      return apiRequest<QueuesResponse>({
        url: "/v1/queues",
        method: "GET",
      });
    },
    enabled: isSignedIn,
  });
}

/**
 * Hook to join a queue
 */
export function useJoinQueue() {
  const queryClient = useQueryClient();
  const { getTelegramId } = useAuth();

  return useMutation({
    mutationFn: async (queueType: QueueType) => {
      const telegramId = getTelegramId();
      return apiRequest({
        url: "/v1/queues/join",
        method: "POST",
        data: {
          telegram_id: telegramId,
          group_pref: queueType,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch queues after joining
      queryClient.invalidateQueries({ queryKey: QUEUES_QUERY_KEY });
    },
  });
}

/**
 * Hook to leave a queue
 */
export function useLeaveQueue() {
  const queryClient = useQueryClient();
  const { getTelegramId } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const telegramId = getTelegramId();
      return apiRequest({
        url: "/v1/queues/leave",
        method: "POST",
        data: {
          telegram_id: telegramId,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch queues after leaving
      queryClient.invalidateQueries({ queryKey: QUEUES_QUERY_KEY });
    },
  });
}

/**
 * Hook to determine which queue the user is currently in
 */
export function useCurrentQueue(queues: QueuesResponse | undefined) {
  const { isSignedIn, getTelegramId } = useAuth();

  if (!isSignedIn || !queues) {
    return null;
  }

  const telegramId = getTelegramId();
  if (!telegramId) {
    return null;
  }

  if (queues.ONE_ON_ONE.some(user => user.telegram_id === telegramId)) {
    return "ONE_ON_ONE";
  }
  if (queues.SMALL.some(user => user.telegram_id === telegramId)) {
    return "SMALL";
  }
  if (queues.LARGE.some(user => user.telegram_id === telegramId)) {
    return "LARGE";
  }

  return null;
}
