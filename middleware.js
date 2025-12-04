import { NextResponse } from 'next/server'
 
export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Only run on admin pages
  if (path.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session');

    // If we have a session, allow access
    if (adminSession?.value === 'true') {
      return NextResponse.next();
    }
    
    // If not, simply let the page load (the Page component handles showing the Login Form)
    // Or strictly redirect to a login page if you separate them.
    // For this example, our page handles both states, so we actually don't strictly need to redirect,
    // but the logic is here if you want to enforce it.
    return NextResponse.next(); 
  }
}