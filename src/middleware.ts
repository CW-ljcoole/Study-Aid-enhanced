import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === "/auth/signin" || 
                       path === "/auth/signup" || 
                       path === "/auth/error";
                       
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic
  if (isPublicPath && token) {
    // If user is signed in and tries to access a public path, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  if (!isPublicPath && !token) {
    // If user is not signed in and tries to access a protected path, redirect to signin
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths should be checked by this middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/notes/:path*",
    "/auth/:path*",
    "/profile/:path*"
  ],
};
