import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

type JWTPayload = {
  id: string
  email: string
}

export function getUserFromToken(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get('auth_token')
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}