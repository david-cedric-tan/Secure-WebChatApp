import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const requests = await prisma.friendRequest.findMany({
    where: {
      toId: user.id,
      status: 'pending'
    },
    include: {
      from: true
    }
  })

  return NextResponse.json({ requests: requests.map(r => r.from.username) })
}
