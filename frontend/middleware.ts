import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest, NextResponse } from 'next/server';

const auth0 = new Auth0Client();

export async function middleware(request: NextRequest) {
    // Auth0 middleware handles authentication routes automatically
    // Routes: /auth/login, /auth/logout, /auth/callback, /auth/profile, /auth/access-token
    const authResponse = await auth0.middleware(request);

    // If Auth0 handled the request (auth routes), return the response
    if (authResponse) {
        return authResponse;
    }

    // For all other routes, continue normally
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Auth0 routes
        '/auth/:path*',
        // Protected routes that need auth check
        '/dashboard/:path*',
        '/api/:path*',
    ],
};
