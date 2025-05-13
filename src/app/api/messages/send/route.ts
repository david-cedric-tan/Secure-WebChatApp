import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptMessage } from '@/lib/encryption'

export async function POST(req: NextRequest) {
  const { senderUsername, receiverUsername, content } = await req.json()

  if (!senderUsername || !receiverUsername || !content) {
    return NextResponse.json({ error: 'Missing input' }, { status: 400 })
  }

  const sender = await prisma.user.findUnique({ where: { username: senderUsername } })
  const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } })

  if (!sender || !receiver) {
    return NextResponse.json({ error: 'Invalid sender or receiver' }, { status: 404 })
  }

  const encryptedContent = encryptMessage(content)

  
  const message = await prisma.message.create({
    data: {
      senderUsername: sender.username,
      receiverUsername: receiver.username,
      content: encryptedContent
    }
  })


  return NextResponse.json({ success: true, message })
}
