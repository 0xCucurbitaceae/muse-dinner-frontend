"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { API_BASE_URL } from "@/config";
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

interface ApiError {
  message: string;
  status: number;
}

const DashboardPage = () => {
  const router = useRouter();
  const { isSignedIn, username, getTelegramId, isLoading: authLoading, signOut } = useAuth();
  const [groupSize, setGroupSize] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<MatchCurrentResponse | null>(null);
  const [matchStatus, setMatchStatus] = useState<"waiting" | "matched" | "none">("waiting");
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [queues, setQueues] = useState<QueuesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    if (storedGroupSize) setGroupSize(storedGroupSize);

    // Fetch data from the API only if user is signed in and has username
    const fetchData = async () => {
      if (!isSignedIn || !username) return;

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
        const cycleResponse = await axios.get<Cycle>(
          `${API_BASE_URL}/cycle/current`
        );
        setCurrentCycle(cycleResponse.data);

        // Get the user's current match
        const matchResponse = await axios.get<MatchCurrentResponse>(
          `${API_BASE_URL}/match/current?telegram_id=${telegramId}`
        );

        setMatch(matchResponse.data);

        // Get the current queues information
        const queuesResponse = await axios.get<QueuesResponse>(
          `${API_BASE_URL}/queues`
        );
        setQueues(queuesResponse.data);

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

    fetchData();
  }, [router, isSignedIn, username, authLoading]);

  // Helper function to format the scheduled time from the cycle data
  const formatScheduledTime = (dateString: string | undefined): string => {
    if (!dateString) return "Soon";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Soon";
    }
  };

  // Show loading indicator while checking match status
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Checking your match status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            Muse Dinners
          </Link>
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300 mr-3">
              Hi, {username}
            </span>
            <button
              onClick={() => {
                signOut();
                router.push('/login');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Your Dinner Match
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {matchStatus === 'matched'
                ? "You've been matched with a group for dinner!"
                : currentCycle
                ? `Next matching will happen on ${formatScheduledTime(
                    currentCycle.scheduled_at
                  )}`
                : 'Next matching will happen soon'}
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {matchStatus === 'waiting' && (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <svg
                    className="h-8 w-8 text-blue-600 dark:text-blue-300"
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Waiting for the next match
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  You're all set for the next matching round!{' '}
                  {currentCycle && (
                    <>
                      Check back on{' '}
                      {formatScheduledTime(currentCycle.scheduled_at)} to see
                      your dinner group.
                    </>
                  )}
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {groupSize === 'one-on-one'
                        ? '1-on-1'
                        : groupSize === 'small-group'
                        ? 'Small Group (2-4)'
                        : 'Large Group (5+)'}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Are you sure you want to leave the queue? You can rejoin later with the same or different preferences.'
                          )
                        ) {
                          const handleLeaveQueue = async () => {
                            try {
                              // Get the telegramId for API calls
                              const telegramId = getTelegramId();

                              await axios.post(`${API_BASE_URL}/queues/leave`, {
                                telegram_id: telegramId,
                              });

                              // Remove group size preference
                              localStorage.removeItem('museDinnersGroupSize');
                              localStorage.removeItem(
                                'museDinnersGroupSizeApi'
                              );

                              // Redirect to register page to select a new preference
                              router.push('/register');
                            } catch (err) {
                              console.error('Error leaving queue:', err);
                              // Show error message
                            }
                          };
                          handleLeaveQueue();
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Change preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {matchStatus === 'matched' && match && match.group && (
              <div>
                <div className="mb-6 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Matched!
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Your dinner group:
                </h3>

                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {match.group.map((member) => (
                    <li key={member.user_id} className="py-4 flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {member.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.display_name}{' '}
                          {member.telegram_id === getTelegramId() && '(You)'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{member.username}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">Time to plan your dinner!</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Connect with your group to decide when and where to meet. Exchange contact info, pick a venue, and enjoy your meal together!
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        onClick={() => alert('This would open a contact sharing interface in a real app!')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Share Contacts
                      </button>
                      
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                        onClick={() => alert('This would open venue suggestions in a real app!')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Find Venue
                      </button>
                      
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                        onClick={() => alert('This would open a scheduling tool in a real app!')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Queue Information Section */}
            {queues && (
              <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Current Queues
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* One-on-One Queue */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-blue-50 dark:bg-blue-900/20">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        1-on-1
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        {
                          queues.ONE_ON_ONE.filter(
                            (user) => user.telegram_id !== getTelegramId()
                          ).length
                        }{' '}
                        people waiting
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                      {queues.ONE_ON_ONE.filter(
                        (user) => user.telegram_id !== getTelegramId()
                      ).map((user) => (
                        <li
                          key={user.telegram_id}
                          className="px-4 py-3 flex items-center"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                              {user.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.display_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </li>
                      ))}
                      {queues.ONE_ON_ONE.filter(
                        (user) => user.telegram_id !== getTelegramId()
                      ).length === 0 && (
                        <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                          No one waiting in this queue
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Small Group Queue */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-green-50 dark:bg-green-900/20">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Small Group (2-4)
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        {
                          queues.SMALL.filter(
                            (user) => user.telegram_id !== getTelegramId()
                          ).length
                        }{' '}
                        people waiting
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                      {queues.SMALL.filter(
                        (user) => user.telegram_id !== getTelegramId()
                      ).map((user) => (
                        <li
                          key={user.telegram_id}
                          className="px-4 py-3 flex items-center"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                              {user.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.display_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </li>
                      ))}
                      {queues.SMALL.filter(
                        (user) => user.telegram_id !== getTelegramId()
                      ).length === 0 && (
                        <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                          No one waiting in this queue
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Large Group Queue */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-purple-50 dark:bg-purple-900/20">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Large Group (5+)
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        {
                          queues.LARGE.filter(
                            (user) => user.telegram_id !== getTelegramId()
                          ).length
                        }{' '}
                        people waiting
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                      {queues.LARGE.filter(
                        (user) => user.telegram_id !== getTelegramId()
                      ).map((user) => (
                        <li
                          key={user.telegram_id}
                          className="px-4 py-3 flex items-center"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                              {user.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.display_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </li>
                      ))}
                      {queues.LARGE.filter(
                        (user) => user.telegram_id !== getTelegramId()
                      ).length === 0 && (
                        <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                          No one waiting in this queue
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {matchStatus === 'none' && (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Oops! Something went wrong
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {error ||
                    "We couldn't retrieve your match information. Please try again later."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
