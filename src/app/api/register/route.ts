// src/app/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

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

    const hash = await bcrypt.hash(password, 10) // 10 = salt rounds (adjustable)

    await prisma.user.create({
      data: {
        username,
        password: hash
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
