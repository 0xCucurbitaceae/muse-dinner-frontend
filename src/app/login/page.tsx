"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/shared/hooks/useAuth';
import { TELEGRAM_BOT_NAME } from '@/config';

// Component that uses useSearchParams must be wrapped in Suspense
const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, isLoading } = useAuth();

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'invalid_auth') {
      setError('Invalid authentication data from Telegram. Please try again.');
    } else if (errorParam === 'api_error') {
      setError('Error connecting to the server. Please try again later.');
    }
  }, [searchParams]);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn && !isLoading) {
      router.push('/dashboard');
    }
  }, [isSignedIn, isLoading, router]);

  // Initialize Telegram login widget
  useEffect(() => {
    if (isLoading) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute(
      'data-auth-url',
      `${window.location.origin}/api/auth/telegram-callback`
    );
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-radius', '8');

    const container = document.getElementById('telegram-login-container');
    if (container) {
      // Clear any existing content
      console.log('Adding script to container');
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      // Clean up on unmount
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isLoading]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              Muse Dinners
            </h2>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in with Telegram
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with other residents for dinner gatherings
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center space-y-6">
            <div id="telegram-login-container" className="flex justify-center">
              {/* Telegram login widget will be inserted here */}
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-48"></div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              By signing in, you agree to share your Telegram ID and username
              with Muse Dinners. Your information will only be used to match you
              with other residents for dinner gatherings.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <Link
              href="/terms"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

// Main page component with Suspense boundary
const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
