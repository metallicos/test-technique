import { NextResponse } from 'next/server'

const protectedRoutes = ['/profile', '/manage-posts']
const authRoutes = ['/login', '/register']

export function middleware(request) {
  const token = request.cookies.get('jwt')
  const { pathname } = request.nextUrl

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}