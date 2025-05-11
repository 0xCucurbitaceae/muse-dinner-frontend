// Local API proxy path that adds the X-API-KEY header
export const API_BASE_URL = process.env.API_BASE_URL || '/api/v1';

// Original external API URL (used by the proxy server-side)
export const EXTERNAL_API_URL =
  'https://muse-dinner-matcher-mo58.replit.app/api/v1';

// ZuitzerBot hash
export const TG_BOT_HASH =
  '37139706fd887b08a4655d1f966b473ccb493352bac13083a477ea21a883e5b2';

// Telegram bot name
export const TELEGRAM_BOT_NAME = 'ZuitzerBot';