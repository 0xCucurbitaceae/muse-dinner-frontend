'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

interface UserUpsertResponse {
  telegram_id: string;
}

interface UpsertUserParams {
  username: string;
  displayName?: string;
}

// Authentication hook that manages sign-in state using localStorage
export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate a random telegram ID between 1000 and 9999
  const generateRandomTelegramId = (): string => {
    return Math.floor(Math.random() * 9000 + 1000).toString();
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUsername = localStorage.getItem('museDinnersUsername');
      const storedTelegramId = localStorage.getItem('musedinnersTelegramId');

      setIsSignedIn(!!storedUsername);
      setUsername(storedUsername);

      if (storedTelegramId) {
        setTelegramId(storedTelegramId);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Upsert user to the API and sign in
  const upsertUser = async ({ username, displayName }: UpsertUserParams): Promise<void> => {
    try {
      // Generate a random telegram ID if one doesn't exist
      let telegramIdToUse = telegramId;
      if (!telegramIdToUse) {
        telegramIdToUse = generateRandomTelegramId();
        setTelegramId(telegramIdToUse);
      }

      // Create or update user in the API
      await axios.post<UserUpsertResponse>(`${API_BASE_URL}/users`, {
        telegram_id: telegramIdToUse,
        username: username,
        display_name: displayName || username,
      });

      // Store the user information
      localStorage.setItem('museDinnersUsername', username);
      localStorage.setItem('musedinnersTelegramId', telegramIdToUse);

      // Update state
      setIsSignedIn(true);
      setUsername(username);
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  };

  // Simple sign in without API call
  const signIn = (newUsername: string) => {
    // Generate a random telegram ID if one doesn't exist
    const telegramIdToUse = telegramId || generateRandomTelegramId();

    localStorage.setItem('museDinnersUsername', newUsername);
    localStorage.setItem('musedinnersTelegramId', telegramIdToUse);

    setIsSignedIn(true);
    setUsername(newUsername);
    setTelegramId(telegramIdToUse);
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('museDinnersUsername');
    localStorage.removeItem('musedinnersTelegramId');
    localStorage.removeItem('museDinnersGroupSize');
    localStorage.removeItem('museDinnersGroupSizeApi');

    setIsSignedIn(false);
    setUsername(null);
    setTelegramId(null);
  };

  // Get the current telegram ID (for API calls)
  const getTelegramId = (): string => {
    if (telegramId) return telegramId;

    const storedTelegramId = localStorage.getItem('musedinnersTelegramId');
    if (storedTelegramId) return storedTelegramId;

    // If no telegram ID exists, generate one, store it, and return it
    const newTelegramId = generateRandomTelegramId();
    localStorage.setItem('musedinnersTelegramId', newTelegramId);
    setTelegramId(newTelegramId);
    return newTelegramId;
  };

  return {
    isSignedIn,
    username,
    getTelegramId,
    isLoading,
    upsertUser,
    signIn,
    signOut
  };
};

export default useAuth;
