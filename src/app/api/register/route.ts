// src/app/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const finalHash = sha256(password + salt)

    const newUser = await prisma.user.create({
      data: {
        username,
        password: finalHash,
        salt: {
          create: { value: salt },
        },
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}