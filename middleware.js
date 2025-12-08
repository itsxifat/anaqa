// anaqa/middleware.js
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth'; // IMPORT FROM AUTH.JS

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Protect Admin Routes
  if (path.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin_session');
    const token = adminCookie?.value;

    // Verify the cryptographic signature
    const isValid = await verifyAdminToken(token);

    if (!isValid) {
      const response = NextResponse.next();
      if (token) {
        response.cookies.delete('admin_session');
      }
      // You might want to redirect to login here if strict protection is needed
      // return NextResponse.redirect(new URL('/admin/login', request.url));
      return response;
    }
  }
  
  return NextResponse.next();
}