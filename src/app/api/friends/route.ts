// src/app/api/friends/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const friends = await prisma.friend.findMany({
    where: { userId: user.id },
    include: { user: true },
  })

  const friendDetails = await Promise.all(
    friends.map(async (entry) => {
      const friendUser = await prisma.user.findUnique({ where: { id: entry.friendId } })
      return friendUser ? { id: friendUser.id, username: friendUser.username } : null
    })
  )

  return NextResponse.json({
    friends: friendDetails.filter(Boolean),
  })
}
