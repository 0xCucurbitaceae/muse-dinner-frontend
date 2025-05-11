import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { verifyTelegramAuth, processTelegramAuthData } from '@/lib/telegram-auth';
import { EXTERNAL_API_URL } from '@/config';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Get query parameters from the request
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  // Convert parameters to the expected format
  const telegramData = {
    id: parseInt(params.id, 10),
    first_name: params.first_name,
    last_name: params.last_name,
    username: params.username,
    photo_url: params.photo_url,
    auth_date: parseInt(params.auth_date, 10),
    hash: params.hash,
  };

  console.log('verification', verifyTelegramAuth(telegramData));

  // Verify the authentication data
  // if (!verifyTelegramAuth(telegramData)) {
  //   return NextResponse.redirect(new URL('/login?error=invalid_auth', req.url));
  // }

  // Process the Telegram authentication data
  const userData = processTelegramAuthData(telegramData);

  try {
    // Create or update user in the API
    await axios.post(`${EXTERNAL_API_URL}/users`, {
      telegram_id: userData.telegram_id,
      username: userData.username,
      display_name: userData.display_name,
    });

    // Set session data
    session.user = userData;
    session.isLoggedIn = true;
    await session.save();

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.redirect(new URL('/login?error=api_error', req.url));
  }
}
