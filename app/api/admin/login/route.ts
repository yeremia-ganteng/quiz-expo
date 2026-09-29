import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Fungsi penolong untuk membuat token yang aman berdasarkan password & secret key
function generateAdminToken() {
  const secret = process.env.ADMIN_PASSWORD || 'default-secret-key';
  return crypto.createHmac('sha256', secret).update('admin_logged_in_session').digest('hex');
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    // Pastikan password di .env terkonfigurasi
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD belum diatur di .env');
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    // Perbandingan menggunakan timingSafeEqual untuk mencegah timing attack
    const inputBuffer = Buffer.from(password || '');
    const adminBuffer = Buffer.from(adminPassword);

    if (inputBuffer.length !== adminBuffer.length || !crypto.timingSafeEqual(inputBuffer, adminBuffer)) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // Buat token hashed aman untuk cookie, BUKAN password polos
    const sessionToken = generateAdminToken();

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true, // Tidak bisa dibaca via JS Client (mencegah XSS)
      secure: process.env.NODE_ENV === 'production', // Wajib HTTPS di production
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // Valid selama 8 jam
      path: '/',
    });

    return response;
  } catch{
    return NextResponse.json({ success: false }, { status: 400 });
  }
}