'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

interface UserUpsertResponse {
  user_id: number;
}

interface UpsertUserParams {
  username: string;
  displayName?: string;
}

// Authentication hook that manages sign-in state using localStorage
export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate a random userId between 1000 and 9999
  const generateRandomUserId = (): number => {
    return Math.floor(Math.random() * 9000) + 1000;
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUsername = localStorage.getItem('museDinnersUsername');
      const storedUserId = localStorage.getItem('museDinnersUserId');

      setIsSignedIn(!!storedUsername);
      setUsername(storedUsername);

      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Upsert user to the API and sign in
  const upsertUser = async ({ username, displayName }: UpsertUserParams): Promise<void> => {
    try {
      // Generate a random userId if one doesn't exist
      let userIdToUse = userId;
      if (!userIdToUse) {
        userIdToUse = generateRandomUserId();
        setUserId(userIdToUse);
      }

      // Create or update user in the API
      await axios.post<UserUpsertResponse>(`${API_BASE_URL}/users`, {
        telegram_id: userIdToUse.toString(), // Using username as the telegram_id as per existing pattern
        username: username,
        display_name: displayName || username,
      });

      // Store the user information
      localStorage.setItem('museDinnersUsername', username);
      localStorage.setItem('museDinnersUserId', userIdToUse.toString());

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
    // Generate a random userId if one doesn't exist
    const userIdToUse = userId || generateRandomUserId();

    localStorage.setItem('museDinnersUsername', newUsername);
    localStorage.setItem('museDinnersUserId', userIdToUse.toString());

    setIsSignedIn(true);
    setUsername(newUsername);
    setUserId(userIdToUse);
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('museDinnersUsername');
    localStorage.removeItem('museDinnersUserId');
    localStorage.removeItem('museDinnersGroupSize');
    localStorage.removeItem('museDinnersGroupSizeApi');

    setIsSignedIn(false);
    setUsername(null);
    setUserId(null);
  };

  // Get the current userId (for API calls)
  const getUserId = (): number => {
    if (userId) return userId;

    const storedUserId = localStorage.getItem('museDinnersUserId');
    if (storedUserId) return parseInt(storedUserId);

    // If no userId exists, generate one, store it, and return it
    const newUserId = generateRandomUserId();
    localStorage.setItem('museDinnersUserId', newUserId.toString());
    setUserId(newUserId);
    return newUserId;
  };

  return {
    isSignedIn,
    username,
    getUserId,
    isLoading,
    upsertUser,
    signIn,
    signOut
  };
};

export default useAuth;
