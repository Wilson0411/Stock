import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME, getAuthCookieValue, validateCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;

  if (!payload || !validateCredentials(payload.username?.trim() ?? '', payload.password?.trim() ?? '')) {
    return NextResponse.json({ message: '帳號或密碼錯誤。' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: getAuthCookieValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  });

  return response;
}