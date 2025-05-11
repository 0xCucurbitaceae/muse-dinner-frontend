"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/shared/hooks/useAuth";

// Types aligned with the OpenAPI specification
interface Cycle {
  cycle_id: number;
  cycle_date: string;
  scheduled_at: string;
  status: "SCHEDULED" | "RUNNING" | "COMPLETE";
}

interface MatchMember {
  telegram_id: string;
  username: string;
  display_name: string;
}

interface AllMatchesResponse {
  matches: {
    group_id: number;
    members: MatchMember[];
  }[];
}

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.id as string;

  const {
    isSignedIn,
    user,
    getTelegramId,
    isLoading: authLoading,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [matches, setMatches] = useState<AllMatchesResponse | null>(null);
  const [userGroup, setUserGroup] = useState<MatchMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data from the API
  const fetchData = async () => {
    if (!isSignedIn || !user) { return; }

    // Get the telegramId for API calls
    const telegramId = getTelegramId();

    // If telegramId is null, it means the user is not authenticated
    if (!telegramId && !isLoading) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the cycle information - using admin/cycles endpoint since there's no specific cycle endpoint
      const cycleResponse = await axios.get<Cycle[]>(`/api/v1/admin/cycles?limit=1`);
      // Find the specific cycle by ID
      const specificCycle = cycleResponse.data.find(c => c.cycle_id.toString() === cycleId);
      if (specificCycle) {
        setCycle(specificCycle);
      }

      // Get all matches for this cycle
      const matchesResponse = await axios.get<AllMatchesResponse>(
        `/api/v1/matches/history?page=1&per_page=50`
      );
      setMatches(matchesResponse.data);

      // Find the user's group in the matches
      const userMatch = matchesResponse.data.matches.find(match =>
        match.members.some(member => member.telegram_id === telegramId)
      );

      if (userMatch) {
        setUserGroup(userMatch.members);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(
        'There was an error loading the cycle information. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If not signed in, redirect to login
    if (!authLoading && !isSignedIn) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, isSignedIn, user, authLoading, cycleId]);

  // Helper function to format the date from the cycle data
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) { return 'Unknown date'; }

    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown date';
    }
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin h-10 w-10 border-4 border-zinc-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  // Show error state if there was an error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              We encountered a problem loading this cycle's information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Oops! Something went wrong
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                {error}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Dinner Cycle History</CardTitle>
              <CardDescription>
                {cycle ? formatDate(cycle.cycle_date) : 'Loading cycle information...'}
              </CardDescription>
            </div>
            <Badge variant={cycle?.status === 'COMPLETE' ? 'default' : 'outline'} className="mt-2 sm:mt-0">
              {cycle?.status === 'COMPLETE' ? 'Completed' : 'Scheduled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {userGroup ? (
            <div>
              {/* User's own group - prominently displayed */}
              <Card className="mb-8 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/30 dark:to-zinc-800/30 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Your dinner group</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-zinc-200/50 dark:divide-zinc-700/50">
                    {userGroup.map((member) => (
                      <li key={member.telegram_id} className="py-4 flex items-center">
                        <Avatar className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                            {member.display_name.charAt(0).toUpperCase()}
                          </span>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {member.display_name}{' '}
                            {member.telegram_id === getTelegramId() && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                You
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            @{member.username}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Other matches displayed as cards at the bottom */}
              {matches && matches.matches && matches.matches.length > 1 && (
                <div className="mt-10">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    Other dinner groups in this cycle:
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.matches
                      .filter(match => !match.members.some(member => member.telegram_id === getTelegramId()))
                      .map((match, index) => (
                        <Card key={match.group_id || index} className="bg-white dark:bg-zinc-800">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Group {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex -space-x-2 overflow-hidden mb-3">
                              {match.members.slice(0, 5).map((member) => (
                                <Avatar
                                  key={member.telegram_id}
                                  className="border-2 border-background"
                                >
                                  <span className="text-xs font-medium">
                                    {member.display_name.charAt(0).toUpperCase()}
                                  </span>
                                </Avatar>
                              ))}
                              {match.members.length > 5 && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-background">
                                  <span className="text-xs font-medium">
                                    +{match.members.length - 5}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {match.members.length} {match.members.length === 1 ? 'person' : 'people'} in this group
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <svg
                  className="h-8 w-8 text-zinc-600 dark:text-zinc-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                You weren't part of this cycle
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                You didn't participate in this dinner cycle. You can view other participants below.
              </p>

              {/* Show all matches for users who weren't part of this cycle */}
              {matches && matches.matches && matches.matches.length > 0 && (
                <div className="mt-10 text-left">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    Dinner groups in this cycle:
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.matches.map((match, index) => (
                      <Card key={match.group_id || index} className="bg-white dark:bg-zinc-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Group {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex -space-x-2 overflow-hidden mb-3">
                            {match.members.slice(0, 5).map((member) => (
                              <Avatar
                                key={member.telegram_id}
                                className="border-2 border-background"
                              >
                                <span className="text-xs font-medium">
                                  {member.display_name.charAt(0).toUpperCase()}
                                </span>
                              </Avatar>
                            ))}
                            {match.members.length > 5 && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-background">
                                <span className="text-xs font-medium">
                                  +{match.members.length - 5}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {match.members.length} {match.members.length === 1 ? 'person' : 'people'} in this group
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
