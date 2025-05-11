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
  user_id: number;
  username: string;
  display_name: string;
}

interface MatchCurrentResponse {
  status: "PENDING" | "MATCHED";
  group?: MatchMember[];
}

interface ApiError {
  message: string;
  status: number;
}

const DashboardPage = () => {
  const router = useRouter();
  const { isSignedIn, username, getUserId, isLoading: authLoading, signOut } = useAuth();
  const [groupSize, setGroupSize] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [match, setMatch] = useState<MatchCurrentResponse | null>(null);
  const [matchStatus, setMatchStatus] = useState<"waiting" | "matched" | "none">("waiting");
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not signed in, redirect to login
    if (!authLoading && !isSignedIn) {
      router.push("/login");
      return;
    }
    
    // Get group size preference from localStorage
    const storedGroupSize = localStorage.getItem("museDinnersGroupSize");

    if (isSignedIn && !storedGroupSize) {
      // User is logged in but missing group size preference, redirect to register
      router.push("/register");
      return;
    }

    if (storedGroupSize) setGroupSize(storedGroupSize);

    // Fetch data from the API only if user is signed in and has username
    const fetchData = async () => {
      if (!isSignedIn || !username) return;
      
      // Get the userId for API calls
      const userId = getUserId();
      
      setIsLoading(true);
      setError(null);

      try {
        // Get the current cycle information
        const cycleResponse = await axios.get<Cycle>(`${API_BASE_URL}/cycle/current`);
        setCurrentCycle(cycleResponse.data);

        // Get the user's current match
        const matchResponse = await axios.get<MatchCurrentResponse>(
          `${API_BASE_URL}/match/current?user_id=${userId}`
        );

        setMatch(matchResponse.data);

        // Set the match status based on the API response
        if (matchResponse.data.status === "MATCHED" && matchResponse.data.group) {
          setMatchStatus("matched");
        } else {
          setMatchStatus("waiting");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("There was an error loading your match information. Please try again.");
        setMatchStatus("none");
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
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Muse Dinners
          </Link>
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300 mr-3">
              Hi, {username}
            </span>
            <button
              onClick={() => {
                signOut();
                router.push("/login");
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
              {matchStatus === "matched"
                ? "You've been matched with a group for dinner!"
                : currentCycle
                  ? `Next matching will happen on ${formatScheduledTime(currentCycle.scheduled_at)}`
                  : "Next matching will happen soon"}
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {matchStatus === "waiting" && (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Waiting for the next match</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  You're all set for the next matching round! {currentCycle && (
                    <>Check back on {formatScheduledTime(currentCycle.scheduled_at)} to see your dinner group.</>
                  )}
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {groupSize === "one-on-one" ? "1-on-1" :
                      groupSize === "small-group" ? "Small Group (2-4)" :
                      "Large Group (5+)"}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to leave the queue? You can rejoin later with the same or different preferences.")) {
                          const handleLeaveQueue = async () => {
                            try {
                              // Get the userId for API calls
                              const userId = getUserId();
                              
                              await axios.post(`${API_BASE_URL}/queues/leave`, {
                                user_id: userId
                              });
                              
                              // Remove group size preference
                              localStorage.removeItem("museDinnersGroupSize");
                              localStorage.removeItem("museDinnersGroupSizeApi");
                              
                              // Redirect to register page to select a new preference
                              router.push("/register");
                            } catch (err) {
                              console.error("Error leaving queue:", err);
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

            {matchStatus === "matched" && match && match.group && (
              <div>
                <div className="mb-6 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Matched!
                  </span>
                </div>

                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your dinner group:</h3>

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
                          {member.display_name} {member.username === username && "(You)"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{member.username}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Planning your dinner</h3>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Now that you've been matched, decide with your group:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                      <li>When and where to meet</li>
                      <li>Whether to go to a restaurant, cook at home, or order takeout</li>
                      <li>Exchange contact information to plan your dinner</li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-center">
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => alert("In a real app, this would open a group chat or planning interface!")}
                        >
                          Start Planning
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {matchStatus === "none" && (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Oops! Something went wrong</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {error || "We couldn't retrieve your match information. Please try again later."}
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
