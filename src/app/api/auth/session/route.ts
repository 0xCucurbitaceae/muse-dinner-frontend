import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (session.isLoggedIn && session.user) {
    // Return user data if logged in
    return NextResponse.json({ 
      user: session.user,
      isLoggedIn: true 
    });
  }

  // Return empty response if not logged in
  return NextResponse.json({ 
    user: null,
    isLoggedIn: false 
  });
}
