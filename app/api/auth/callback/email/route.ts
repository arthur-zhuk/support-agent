import { NextRequest } from 'next/server'
import { handlers } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  return handlers.GET(request)
}

