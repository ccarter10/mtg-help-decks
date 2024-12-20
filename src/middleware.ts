import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Add paths that should be protected here
const protectedPaths = [
  '/api/decks',
  '/api/decks/',
]

// Make sure to export as default
export default async function middleware(request: NextRequest) {
  // Check if the path should be protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token.value, secret)
    
    return NextResponse.next()
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: [
    '/api/decks/:path*',
  ]
}