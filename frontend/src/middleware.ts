import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes protégées par rôle: { path: ['roles autorisés'] }
const protectedRoutes: Record<string, string[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/pdg': ['directeur', 'admin'],
  '/dashboard/secretaire': ['secretaire', 'admin'],
  '/dashboard': ['admin', 'directeur', 'secretaire']
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes publiques (pas de protection)
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // Vérifier si c'est une route protégée
  const isProtected = Object.keys(protectedRoutes).some(path => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Récupérer le token du localStorage (côté client)
  // Note: On ne peut pas accéder directement à localStorage côté middleware
  // On va passer par un cookie ou un header
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Pas de token, rediriger vers login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Décoder le token pour vérifier le rôle
  try {
    // Décoder le JWT sans vérification (on fait une vérification basique côté client)
    const [, payloadEncoded] = token.split('.');
    if (!payloadEncoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64').toString());
    const userRole = payload.role;

    // Vérifier le rôle pour cette route
    const allowedRoles = Object.entries(protectedRoutes)
      .filter(([path]) => pathname.startsWith(path))
      .map(([, roles]) => roles)
      .flat();

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Rôle non autorisé, rediriger vers dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('Token decode error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
