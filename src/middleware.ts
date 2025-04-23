import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Check auth condition
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/signup')

  if (isAuthRoute && session) {
    // If user is signed in and the current path is /login or /signup, redirect to /
    return NextResponse.redirect(new URL('/', request.url))
  }

  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') ||
                        request.nextUrl.pathname.startsWith('/signup') ||
                        request.nextUrl.pathname.startsWith('/home') ||
                        request.nextUrl.pathname === '/_next/static' ||
                        request.nextUrl.pathname.startsWith('/api/auth') ||
                        request.nextUrl.pathname.startsWith('/_next/image') ||
                        request.nextUrl.pathname === '/favicon.ico' ||
                        /\.(svg|png|jpg|jpeg|gif|webp)$/.test(request.nextUrl.pathname)

  const isRootPath = request.nextUrl.pathname === '/'

  if (!isPublicRoute && !session) {
    // If user is not signed in and the current path is protected, redirect to home page
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Redirect root path to dashboard for authenticated users and home for unauthenticated users
  if (isRootPath) {
    if (session) {
      // Authenticated users see the dashboard
      return NextResponse.next()
    } else {
      // Unauthenticated users see the home page
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
