import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Harus identik dengan generateAdminToken() di app/api/admin/login/route.ts
async function generateAdminToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD || 'default-secret-key';
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode('admin_logged_in_session'));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function proxy(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/admin/login';
  const isLoginApi = req.nextUrl.pathname === '/api/admin/login';
  const isAdminApi = req.nextUrl.pathname.startsWith('/api/admin');
  const isProtectedPage =
    req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/dashboard');

  const session = req.cookies.get('admin_session')?.value;
  const expectedToken = await generateAdminToken();
  const isAuthenticated = !!session && session === expectedToken;

  if (isLoginPage || isLoginApi || isAuthenticated) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isProtectedPage) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/dashboard/:path*'],
};