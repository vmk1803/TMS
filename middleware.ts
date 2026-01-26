import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/records',
  '/profile',
  '/techrouts',
  '/travelMielage',
  '/user-management',
  '/audits',
  '/calendar'
]

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const token = request.cookies.get('authToken')?.value
  const user = request.cookies.get('user')?.value

  // Check if accessing protected route without authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && (!token || !user)) {
    // Redirect to login
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check if accessing auth routes while already authenticated
  const isAuthRoute = authRoutes.includes(pathname)
  if (isAuthRoute && token && user) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
