'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Define the user interface
interface User {
  telegram_id: number;
  username: string;
  display_name: string;
  photo_url?: string;
  auth_date?: number;
}

// Define the auth state interface
interface AuthState {
  isSignedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    user: null,
    isLoading: true,
    error: null,
  });

  const router = useRouter();

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`/api/auth/session`);
        if (response.data.user) {
          setAuthState({
            isSignedIn: true,
            user: response.data.user,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            isSignedIn: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Failed to check authentication status:', err);
        setAuthState({
          isSignedIn: false,
          user: null,
          isLoading: false,
          error: 'Failed to check authentication status',
        });
      }
    };

    checkSession();
  }, []);

  // Redirect to Telegram login
  const signIn = () => {
    // This will be handled by the Telegram widget in the login page
    router.push('/login');
  };

  // Sign out by clearing the session
  const signOut = async () => {
    try {
      await axios.post(`/api/auth/logout`);
      setAuthState({
        isSignedIn: false,
        user: null,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    } catch (err) {
      console.error('Failed to sign out:', err);
      setAuthState({
        ...authState,
        error: 'Failed to sign out',
      });
    }
  };

  // Function to get the telegram_id
  const getTelegramId = (): number | null => {
    return authState.user?.telegram_id || null;
  };

  return {
    isSignedIn: authState.isSignedIn,
    user: authState.user,
    getTelegramId,
    isLoading: authState.isLoading,
    signIn,
    signOut,
  };
};

export default useAuth;
