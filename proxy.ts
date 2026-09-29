import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/admin/login';
  const isLoginApi = req.nextUrl.pathname === '/api/admin/login';
  const isAdminApi = req.nextUrl.pathname.startsWith('/api/admin');
  const isProtectedPage =
    req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/dashboard');

  const session = req.cookies.get('admin_session')?.value;
  const isAuthenticated = session === process.env.ADMIN_PASSWORD;

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