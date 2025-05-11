"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function TelegramCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get all search parameters from the URL
        const params = Object.fromEntries(searchParams.entries());
        
        if (!params.id || !params.hash) {
          setError('Missing authentication data');
          setIsProcessing(false);
          return;
        }

        // Forward the Telegram auth data to our API
        await axios.get(`/api/auth/telegram-callback`, { 
          params 
        });
        
        // Redirect to dashboard on success
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err?.response?.data?.message || 'Authentication failed. Please try again.');
        setIsProcessing(false);
      }
    };

    if (searchParams.size > 0) {
      processAuth();
    } else {
      setError('No authentication data received');
      setIsProcessing(false);
    }
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Processing your login</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we authenticate your Telegram account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <svg className="h-8 w-8 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
