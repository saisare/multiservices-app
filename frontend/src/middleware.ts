import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes protégées par rôle
const protectedRoutes: Record<string, string[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/pdg': ['directeur', 'admin'],
  '/dashboard/secretaire': ['secretaire', 'admin'],
  '/dashboard': ['admin', 'directeur', 'secretaire', 'employee']
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes publiques (pas de protection)
  if (pathname === '/login' || pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Vérifier si c'est une route protégée
  const isProtected = Object.keys(protectedRoutes).some(path => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Récupérer le token du cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    console.log(`🔐 Middleware: No token for ${pathname}, redirecting to /login`);
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Décoder le token pour vérifier le rôle
  try {
    const [, payloadEncoded] = token.split('.');
    if (!payloadEncoded) {
      throw new Error('Invalid token format');
    }

    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64').toString());
    const userRole = payload.role;
    
    if (!userRole) {
      console.log(`🔐 Middleware: No role in token for ${pathname}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Vérifier le rôle pour cette route
    const allowedRoles = Object.entries(protectedRoutes)
      .filter(([path]) => pathname.startsWith(path))
      .map(([, roles]) => roles)
      .flat();

    // Si c'est une route avec rôle spécifique, vérifier le rôle
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log(`🔐 Middleware: Role ${userRole} not allowed for ${pathname}, redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error(`🔐 Middleware: Token decode error:`, error);
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|health).*)',
  ],
};
