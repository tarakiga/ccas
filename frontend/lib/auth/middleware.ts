import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth', '/error', '/callback']
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for auth cookie (simplified - Auth0 handles this)
  const hasAuthCookie = request.cookies.has('appSession')

  // Redirect to login if not authenticated
  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
