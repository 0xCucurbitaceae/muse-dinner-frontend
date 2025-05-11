// This file contains the configuration for iron-session
import { SessionOptions } from 'iron-session';

export interface SessionData {
  user?: {
    telegram_id: number;
    username: string;
    display_name: string;
    photo_url?: string;
    auth_date?: number;
  };
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'muse_dinners_session',
  cookieOptions: {
    // secure should be true in production
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
