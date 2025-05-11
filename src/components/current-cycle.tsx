"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/shared/components/Avatar";
import useAuth from "@/shared/hooks/useAuth";
import { cn } from "@/lib/utils";

// Types from the OpenAPI specification
interface UserBrief {
  telegram_id: string;
  username: string;
  display_name: string;
  joined_at: string;
}

interface QueuesResponse {
  ONE_ON_ONE: UserBrief[];
  SMALL: UserBrief[];
  LARGE: UserBrief[];
}

interface CurrentCycleProps {
  queues: QueuesResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export function CurrentCycle({ queues, loading, error, onRefresh }: CurrentCycleProps) {
  const router = useRouter();
  const { isSignedIn, getTelegramId } = useAuth();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Determine which queue the user is currently in
  const getCurrentQueue = (): "ONE_ON_ONE" | "SMALL" | "LARGE" | null => {
    if (!isSignedIn || !queues) { return null; }

    const telegramId = getTelegramId();
    if (!telegramId) { return null; }

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
  };

  const currentQueue = getCurrentQueue();

  const handleLeaveQueue = async () => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    try {
      setIsProcessing('leave');
      const telegramId = getTelegramId();
      await axios.post("/api/v1/queues/leave", {
        telegram_id: telegramId,
      });

      // Refresh queues data
      await onRefresh();
    } catch (err) {
      console.error("Error leaving queue:", err);
      alert("Failed to leave queue. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleJoinQueue = async (queueType: "ONE_ON_ONE" | "SMALL" | "LARGE") => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    try {
      setIsProcessing(queueType);
      const telegramId = getTelegramId();

      // If user is already in a queue, leave it first
      if (currentQueue) {
        await axios.post("/api/v1/queues/leave", {
          telegram_id: telegramId,
        });
      }

      // Then join the new queue
      await axios.post("/api/v1/queues/join", {
        telegram_id: telegramId,
        group_pref: queueType,
      });

      // Refresh queues data
      await onRefresh();
    } catch (err) {
      console.error("Error joining queue:", err);
      alert("Failed to join queue. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold">Current Cycle</h2>
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-zinc-500 rounded-full border-t-transparent" />
        </div>
      ) : error ? (
        <div className="px-4 py-2 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4 px-1">
          {/* 1-on-1 Queue Card */}
          <Card
className={cn(
            currentQueue === "ONE_ON_ONE" && "border-2 border-blue-500 dark:border-blue-700"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">1-on-1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {queues?.ONE_ON_ONE.slice(0, 5).map((user) => (
                    <Avatar
                      key={user.telegram_id}
                      displayName={user.display_name}
                      size="sm"
                      className="border-2 border-white dark:border-zinc-800"
                      title={user.display_name}
                    />
                  ))}
                  {(queues?.ONE_ON_ONE.length || 0) > 5 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-background">
                      <span className="text-xs font-medium">
                        +{(queues?.ONE_ON_ONE.length || 0) - 5}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {queues?.ONE_ON_ONE.length || 0} waiting
                  </Badge>
                  {currentQueue === "ONE_ON_ONE" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeaveQueue}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === 'leave' ? 'Leaving...' : 'Leave'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinQueue("ONE_ON_ONE")}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === "ONE_ON_ONE" ? 'Joining...' : 'Join'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Small Group Queue Card */}
          <Card
className={cn(
            currentQueue === "SMALL" && "border-2 border-blue-500 dark:border-blue-700"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Small Group (2-4)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {queues?.SMALL.slice(0, 5).map((user) => (
                    <Avatar
                      key={user.telegram_id}
                      displayName={user.display_name}
                      size="sm"
                      className="border-2 border-white dark:border-zinc-800"
                      title={user.display_name}
                    />
                  ))}
                  {(queues?.SMALL.length || 0) > 5 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-background">
                      <span className="text-xs font-medium">
                        +{(queues?.SMALL.length || 0) - 5}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {queues?.SMALL.length || 0} waiting
                  </Badge>
                  {currentQueue === "SMALL" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeaveQueue}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === 'leave' ? 'Leaving...' : 'Leave'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinQueue("SMALL")}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === "SMALL" ? 'Joining...' : 'Join'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Large Group Queue Card */}
          <Card
className={cn(
            currentQueue === "LARGE" && "border-2 border-blue-500 dark:border-blue-700"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Large Group (5+)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {queues?.LARGE.slice(0, 5).map((user) => (
                    <Avatar
                      key={user.telegram_id}
                      displayName={user.display_name}
                      size="sm"
                      className="border-2 border-white dark:border-zinc-800"
                      title={user.display_name}
                    />
                  ))}
                  {(queues?.LARGE.length || 0) > 5 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-background">
                      <span className="text-xs font-medium">
                        +{(queues?.LARGE.length || 0) - 5}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {queues?.LARGE.length || 0} waiting
                  </Badge>
                  {currentQueue === "LARGE" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeaveQueue}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === 'leave' ? 'Leaving...' : 'Leave'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinQueue("LARGE")}
                      disabled={isProcessing !== null}
                    >
                      {isProcessing === "LARGE" ? 'Joining...' : 'Join'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
