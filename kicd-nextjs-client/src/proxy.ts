import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('kicd_token')?.value;
  const userStr = request.cookies.get('kicd_user')?.value;
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // Ignore
    }
  }

  const { pathname } = request.nextUrl;

  // Protect student dashboard
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/apply')) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/reviewer/dashboard', request.url));
    }
  }

  // Protect profile (Any logged in user)
  if (pathname.startsWith('/profile')) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect reviewer dashboard
  if (pathname.startsWith('/reviewer')) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'HR_OFFICER' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Prevent logged-in users from seeing login/register
  if (pathname === '/login' || pathname === '/register') {
    if (token && user) {
      if (user.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/reviewer/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*', 
    '/apply/:path*', 
    '/reviewer/:path*',
    '/login',
    '/register'
  ],
};
