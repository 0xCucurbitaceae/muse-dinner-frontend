"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/shared/components/Avatar";
import useAuth from "@/shared/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useQueues, useJoinQueue, useLeaveQueue, useCurrentQueue } from "@/shared/hooks/api";

// We're now importing types from our API hooks

// No longer need to pass props as we'll use React Query hooks directly

export function CurrentCycle() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  
  // Use React Query hooks
  const { data: queues, isLoading: loading, error: queryError } = useQueues();
  const { mutate: leaveQueue, isPending: isLeavePending } = useLeaveQueue();
  const { mutate: joinQueue, isPending: isJoinPending } = useJoinQueue();
  
  // Determine which queue the user is currently in
  const currentQueue = useCurrentQueue(queues);
  
  // Handle queue operations
  const handleLeaveQueue = () => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    
    leaveQueue(undefined, {
      onError: (err) => {
        console.error("Error leaving queue:", err);
        alert("Failed to leave queue. Please try again.");
      }
    });
  };

  const handleJoinQueue = (queueType: "ONE_ON_ONE" | "SMALL" | "LARGE") => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    
    joinQueue(queueType, {
      onError: (err) => {
        console.error("Error joining queue:", err);
        alert("Failed to join queue. Please try again.");
      }
    });
  };
  
  // Track if any mutation is in progress
  const isProcessing = isLeavePending || isJoinPending ? 
    (isLeavePending ? 'leave' : currentQueue) : 
    null;

  return (
    <div className="px-3 py-2">
      <h3 className="mb-4 text-lg font-semibold">Current Cycle</h3>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-zinc-500 rounded-full border-t-transparent" />
        </div>
      ) : queryError ? (
        <div className="text-red-500 text-center py-4">
          Error loading queues. Please try again.
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-4 px-1">
          {/* 1-on-1 Queue Card */}
          <Card
            className={cn(
              currentQueue === "ONE_ON_ONE" && "border-2 border-blue-500 dark:border-blue-700"
            )}
          >
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
            )}
          >
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
            )}
          >
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
