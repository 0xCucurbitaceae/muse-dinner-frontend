"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useAuth from "@/shared/hooks/useAuth";
import { CurrentCycle } from "@/components/current-cycle";

// Types from the OpenAPI specification
interface Cycle {
  cycle_id: number;
  cycle_date: string;
  scheduled_at: string;
  status: "SCHEDULED" | "RUNNING" | "COMPLETE";
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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading, getTelegramId } = useAuth();

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [queues, setQueues] = useState<QueuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Only fetch data if authentication check is complete and user is signed in
    if (!authLoading && isSignedIn) {
      refreshData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isSignedIn, authLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to refresh sidebar data
  const refreshData = async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch current queues
      const queuesResponse = await axios.get<QueuesResponse>("/api/v1/queues");
      setQueues(queuesResponse.data);

      // Fetch past cycles
      const cyclesResponse = await axios.get<Cycle[]>("/api/v1/admin/cycles?limit=10");
      setCycles(cyclesResponse.data);
    } catch (err) {
      console.error("Error fetching sidebar data:", err);
      setError("Failed to load sidebar data");
    } finally {
      setLoading(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 overflow-y-auto">
      {authLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-zinc-500 rounded-full border-t-transparent" />
        </div>
      ) : !isSignedIn ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Please sign in to view your dinner matches</p>
          <Button onClick={() => router.push('/login')}>Sign In</Button>
        </div>
      ) : (
        <>
          <CurrentCycle 
            queues={queues} 
            loading={loading} 
            error={error} 
            onRefresh={refreshData} 
          />

          <div className="px-3 py-2 mt-6">
            <h2 className="mb-2 px-4 text-lg font-semibold">History</h2>
            <div className="space-y-1">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-zinc-500 rounded-full border-t-transparent" />
                </div>
              ) : error ? (
                <div className="px-4 py-2 text-red-500">{error}</div>
              ) : cycles.length === 0 ? (
                <p className="px-4 py-2 text-sm text-zinc-500">No past cycles found</p>
              ) : (
                cycles.map((cycle) => (
                  <Link
                    key={cycle.cycle_id}
                    href={`/${cycle.cycle_id}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      pathname === `/${cycle.cycle_id}` ? "bg-zinc-100 dark:bg-zinc-800" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{formatDate(cycle.cycle_date)}</span>
                      <span className="text-xs text-zinc-500">
                        {cycle.status === "COMPLETE" ? "Completed" : "Scheduled"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 overflow-hidden">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
