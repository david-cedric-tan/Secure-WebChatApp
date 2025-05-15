import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptMessage } from '@/lib/encryption'


type Message = {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: Date
  senderUsername?: string
  receiverUsername?: string
}

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

//====== THIS IS THE MESSAGE BUG THAT IS CAUSING PROBLEM=================
  /*const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderUsername: u1.username, receiverUsername: u2.username },
        { senderUsername: u2.username, receiverUsername: u1.username }
      ]
    },
    orderBy: { timestamp: 'asc' }
  }) as Message[]

  const decryptedMessages = messages.map(m => ({
    ...m,
    content: decryptMessage(m.content)
  }))

  return NextResponse.json({ messages: decryptedMessages })*/

  //================ original code of kevin =======================
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