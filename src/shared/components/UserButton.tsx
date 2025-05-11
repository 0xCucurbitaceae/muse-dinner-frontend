"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from "@/shared/hooks/useAuth";

export const UserButton: React.FC = () => {
  const router = useRouter();
  const { isSignedIn, user, signOut, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    );
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center">
      <span className="text-gray-700 dark:text-gray-300 mr-3">
        Hi, {user?.display_name}
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
  );
};
