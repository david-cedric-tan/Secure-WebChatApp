// src/app/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { username },
      include: { salt: true },
    })

    if (!user || !user.salt) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const finalHash = sha256(password + user.salt.value)

    if (finalHash !== user.password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}