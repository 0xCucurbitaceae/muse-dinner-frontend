import crypto from 'crypto';
import { TG_BOT_HASH } from '@/config';

interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verify Telegram authentication data
 * @param data - The authentication data received from Telegram
 * @returns boolean - Whether the data is valid
 */
export function verifyTelegramAuth(data: TelegramAuthData): boolean {
  // Use the pre-hashed bot token from config
  if (!TG_BOT_HASH) {
    console.error('TG_BOT_HASH is not defined in config');
    return false;
  }

  // Convert the hex hash to a Buffer for HMAC operations
  const secretKey = TG_BOT_HASH;

  // Extract the hash from the data
  const { hash, ...dataWithoutHash } = data;

  // Create a check string from the data
  const checkString = Object.entries(dataWithoutHash)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Calculate the expected hash
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  // Check if the hash matches
  return hash === expectedHash;
}

/**
 * Process Telegram auth data into a user object
 * @param data - The authentication data received from Telegram
 * @returns User object with Telegram data
 */
export function processTelegramAuthData(data: TelegramAuthData) {
  return {
    telegram_id: data.id,
    username: data.username || `user${data.id}`,
    display_name: [data.first_name, data.last_name].filter(Boolean).join(' ') || `User ${data.id}`,
    photo_url: data.photo_url,
    auth_date: data.auth_date
  };
}
