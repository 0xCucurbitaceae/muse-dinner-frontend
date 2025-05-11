"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the today page
    router.push("/today");
  }, [router]);
  
  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)]">
      <div className="animate-spin h-10 w-10 border-4 border-zinc-500 rounded-full border-t-transparent"></div>
    </div>
  );
}
