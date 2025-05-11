import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user1 = searchParams.get('user1')
  const user2 = searchParams.get('user2')

  if (!user1 || !user2) {
    return NextResponse.json({ error: 'Missing user parameters' }, { status: 400 })
  }

  const u1 = await prisma.user.findUnique({ where: { username: user1 } })
  const u2 = await prisma.user.findUnique({ where: { username: user2 } })

  if (!u1 || !u2) {
    return NextResponse.json({ error: 'Users not found' }, { status: 404 })
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderUsername: u1.username, receiverUsername: u2.username },
        { senderUsername: u2.username, receiverUsername: u1.username }
      ]
    },
    orderBy: { timestamp: 'asc' }
  })

  return NextResponse.json({ messages })
}
