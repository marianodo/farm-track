// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. Definimos las rutas según el nivel de acceso
const rutasPublicas = ['/','/login', '/register', '/forgot-password', '/privacy-policy'] // Rutas que cualquiera puede acceder
const rutasUsuario = ['/dashboard', '/profile'] // Rutas que requieren ser usuario
const rutasAdmin = ['/admin', '/admin/users'] // Rutas que requieren ser administrador

// 2. Definimos la jerarquía de roles
const jerarquiaRoles = {
  ADMIN: ['ADMIN'],
  USER: ['USER', 'ADMIN'],
  GUEST: ['GUEST']
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value
 
  // Si no hay token, permitir acceso solo a rutas públicas
if (!authToken && rutasPublicas.some(ruta => pathname.toLowerCase() === ruta.toLowerCase())) {
  return NextResponse.next();
}

// Si hay token y el usuario intenta acceder a rutas públicas, redirigir al dashboard
if (authToken && rutasPublicas.some(ruta => pathname.toLowerCase() === ruta.toLowerCase())) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

  // // Si no hay token o rol, redirigir al login
  if (!authToken) {
    console.log('redirigir al login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar acceso a rutas de administrador
  if (rutasAdmin.some(ruta => pathname.toLowerCase() === ruta.toLowerCase())) {
    console.log('verificar acceso a rutas de administrador')
    if (!jerarquiaRoles.ADMIN.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Verificar acceso a rutas de usuario
  if (rutasUsuario.some(ruta => pathname.toLowerCase() === ruta.toLowerCase())) {
    console.log('verificar acceso a rutas de usuario')
    if (!jerarquiaRoles.USER.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
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
  ]
}