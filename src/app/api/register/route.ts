import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      password: '' // placeholder for now
    }
  })

  const salt = crypto.randomBytes(16).toString('hex')
  const finalHash = sha256(password + salt)

  await prisma.user.update({
    where: { id: newUser.id },
    data: { password: finalHash }
  })

  await prisma.salt.create({
    data: {
      userId: newUser.id,
      value: salt
    }
  })

  return NextResponse.json({ success: true })
}
