import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Apply middleware to all routes except authentication routes, static files, and api routes
    "/((?!_next/|public/|static/|sign-in/|sign-up/|.*\\..*$).*)",
    "/"
  ],
}; 