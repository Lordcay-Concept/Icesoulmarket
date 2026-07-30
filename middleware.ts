// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
 const { data: { user } } = await supabase.auth.getUser()

const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
const isProtectedRoute = ['/checkout', '/account'].some(route => 
  request.nextUrl.pathname.startsWith(route)
)

if (!user) {
  if (isAdminRoute || isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  return response
}

if (isAdminRoute) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
    
  if (!profile?.is_admin) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}