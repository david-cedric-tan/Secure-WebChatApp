import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { fromUsername, toUsername, action } = await req.json()

  if (!fromUsername || !toUsername || !['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const from = await prisma.user.findUnique({ where: { username: fromUsername } })
  const to = await prisma.user.findUnique({ where: { username: toUsername } })
  if (!from || !to) return NextResponse.json({ error: 'Invalid users' }, { status: 404 })

  const request = await prisma.friendRequest.findFirst({
    where: {
      fromId: from.id,
      toId: to.id,
      status: 'pending'
    }
  })

  if (!request) return NextResponse.json({ error: 'No pending request found' }, { status: 404 })

  if (action === 'decline') {
    await prisma.friendRequest.delete({ where: { id: request.id } })
    return NextResponse.json({ success: true, message: 'Request declined' })
  }

  // Accept: create reciprocal Friend entries and delete the request
  const alreadyFriends = await prisma.friend.findFirst({
    where: { userId: to.id, friendId: from.id }
  })

  if (alreadyFriends) {
    await prisma.friendRequest.delete({ where: { id: request.id } })
    return NextResponse.json({ error: 'Already friends' }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.friend.create({ data: { userId: to.id, friendId: from.id } }),
    prisma.friend.create({ data: { userId: from.id, friendId: to.id } }),
    prisma.friendRequest.delete({ where: { id: request.id } })
  ])

  return NextResponse.json({
    success: true,
    friend: { id: from.id, username: from.username }
  })
}
