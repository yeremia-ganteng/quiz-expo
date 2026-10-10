import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateAdminToken() {
  const secret = process.env.ADMIN_PASSWORD || 'default-secret-key';
  return crypto.createHmac('sha256', secret).update('admin_logged_in_session').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const inputPassword = String(password || '').trim();
    const targetPassword = String(adminPassword).trim();

    const inputBuffer = Buffer.from(inputPassword, 'utf-8');
    const adminBuffer = Buffer.from(targetPassword, 'utf-8');

    if (inputBuffer.length !== adminBuffer.length || !crypto.timingSafeEqual(inputBuffer, adminBuffer)) {
      return NextResponse.json({ success: false, message: 'Password salah' }, { status: 401 });
    }

    const sessionToken = generateAdminToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 jam
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}