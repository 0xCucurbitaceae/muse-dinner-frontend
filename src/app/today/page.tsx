"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/shared/components/Avatar";
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

interface MatchCurrentResponse {
  status: 'PENDING' | 'MATCHED';
  group?: MatchMember[];
}

interface AllMatchesResponse {
  matches: {
    group_id: number;
    members: MatchMember[];
  }[];
}

export default function TodayPage() {
  const router = useRouter();
  const {
    isSignedIn,
    user,
    getTelegramId,
    isLoading: authLoading,
    signOut,
  } = useAuth();

  const [groupSize, setGroupSize] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<MatchCurrentResponse | null>(null);
  const [matchStatus, setMatchStatus] = useState<'waiting' | 'matched' | 'none'>('waiting');
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [allMatches, setAllMatches] = useState<AllMatchesResponse | null>(null);
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
      // Get the current cycle information
      const cycleResponse = await axios.get<Cycle>(`/api/v1/cycle/current`);
      setCurrentCycle(cycleResponse.data);

      // Get the user's current match
      const matchResponse = await axios.get<MatchCurrentResponse>(
        `/api/v1/match/current?telegram_id=${telegramId}`
      );

      setMatch(matchResponse.data);

      // If user is matched, get all matches for the current cycle
      if (matchResponse.data.status === 'MATCHED' && matchResponse.data.group) {
        try {
          const allMatchesResponse = await axios.get<AllMatchesResponse>(
            `/api/v1/match/all?cycle_id=${cycleResponse.data.cycle_id}`
          );
          setAllMatches(allMatchesResponse.data);
        } catch (err) {
          console.error('Error fetching all matches:', err);
          // Don't set an error, just log it - this is a non-critical feature
        }
      }

      // Set the match status based on the API response
      if (
        matchResponse.data.status === 'MATCHED' &&
        matchResponse.data.group
      ) {
        setMatchStatus('matched');
      } else {
        setMatchStatus('waiting');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(
        'There was an error loading your match information. Please try again.'
      );
      setMatchStatus('none');
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

    // Get group size preference from localStorage
    const storedGroupSize = localStorage.getItem('museDinnersGroupSize');

    if (isSignedIn && !storedGroupSize) {
      // User is logged in but missing group size preference, redirect to register
      router.push('/register');
      return;
    }

    if (storedGroupSize) { setGroupSize(storedGroupSize); }

    fetchData();
  }, [router, isSignedIn, user, authLoading]);

  // Helper function to format the scheduled time from the cycle data
  const formatScheduledTime = (dateString: string | undefined): string => {
    if (!dateString) { return 'Soon'; }

    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Soon';
    }
  };

  // Function to handle leaving the queue
  const handleLeaveQueue = async () => {
    if (window.confirm('Are you sure you want to leave the queue? You can rejoin later with the same or different preferences.')) {
      try {
        // Get the telegramId for API calls
        const telegramId = getTelegramId();

        await axios.post(`/api/v1/queues/leave`, {
          telegram_id: telegramId,
        });

        // Remove group size preference
        localStorage.removeItem('museDinnersGroupSize');
        localStorage.removeItem('museDinnersGroupSizeApi');

        // Redirect to register page to select a new preference
        router.push('/register');
      } catch (err) {
        console.error('Error leaving queue:', err);
        alert('There was an error leaving the queue. Please try again.');
      }
    }
  };

  // Show loading indicator while checking match status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin h-10 w-10 border-4 border-zinc-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Dinner Match</CardTitle>
          <CardDescription>
            {matchStatus === 'matched'
              ? "You've been matched with a group for dinner!"
              : currentCycle
              ? `Next matching will happen on ${formatScheduledTime(
                  currentCycle.scheduled_at
                )}`
              : 'Next matching will happen soon'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchStatus === 'waiting' && (
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Waiting for the next match
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
                You're all set for the next matching round!{' '}
                {currentCycle && (
                  <>
                    Check back on{' '}
                    {formatScheduledTime(currentCycle.scheduled_at)} to see
                    your dinner group.
                  </>
                )}
              </p>
              <div>
                <Badge className="mb-4">
                  {groupSize === 'one-on-one'
                    ? '1-on-1'
                    : groupSize === 'small-group'
                    ? 'Small Group (2-4)'
                    : 'Large Group (5+)'}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={handleLeaveQueue}
                >
                  Change preferences
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLeaveQueue}
                >
                  Leave queue
                </Button>
              </div>
            </div>
          )}

          {matchStatus === 'matched' && match && match.group && (
            <div>
              <div className="mb-6 text-center">
                <Badge variant="default">Matched!</Badge>
              </div>

              {/* User's own group - prominently displayed */}
              <Card className="mb-8 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/30 dark:to-zinc-800/30 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-lg">Your dinner group</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-zinc-200/50 dark:divide-zinc-700/50">
                    {match.group.map((member) => (
                      <li key={member.telegram_id} className="py-4 flex items-center">
                        <Avatar
                          displayName={member.display_name}
                          size="md"
                          title={member.display_name}
                        />
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

              {/* Action card for planning the dinner */}
              <Card className="mb-8 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900/20 dark:to-zinc-800/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-zinc-600 dark:text-zinc-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <CardTitle className="text-md">Time to plan your dinner!</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Connect with your group to decide when and where to meet.
                    Exchange contact info, pick a venue, and enjoy your meal
                    together!
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alert(
                          'This would open a contact sharing interface in a real app!'
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Share Contacts
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alert(
                          'This would open venue suggestions in a real app!'
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Find Venue
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alert(
                          'This would open a scheduling tool in a real app!'
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Other matches displayed as cards at the bottom */}
              {allMatches && allMatches.matches && allMatches.matches.length > 1 && (
                <div className="mt-10">
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    Other dinner groups in this cycle:
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allMatches.matches
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
          )}

          {matchStatus === 'none' && (
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
                {error ||
                  "We couldn't retrieve your match information. Please try again later."}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
