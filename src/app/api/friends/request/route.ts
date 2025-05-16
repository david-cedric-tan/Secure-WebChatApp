import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { fromUsername, toUsername } = await req.json()

  if (!toUsername) return NextResponse.json({ error: 'Please enter username' }, { status: 400 })
  if (fromUsername === toUsername) return NextResponse.json({ error: "You can't add yourself" }, { status: 400 })

  const from = await prisma.user.findUnique({ where: { username: fromUsername } })
  // const to = await prisma.user.findUnique({ where: { username: toUsername } })

  //code for sql injection
  const query = `SELECT * FROM User WHERE username = '${toUsername}'`
  console.log('Running query:', query)
  const toArray = await prisma.$queryRawUnsafe(query)
  const to = toArray[0]  // since $queryRaw returns an array

  if (!to) return NextResponse.json({ error: 'Not existing user' }, { status: 404 })

  const isFriend = await prisma.friend.findFirst({
    where: { userId: from!.id, friendId: to.id }
  })
  if (isFriend) return NextResponse.json({ error: 'Already friend' }, { status: 409 })

  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      fromId: from!.id,
      toId: to.id,
      status: 'pending'
    }
  })
  if (existingRequest) return NextResponse.json({ error: 'Request already sent' }, { status: 409 })

    // Check if the other user already sent a pending request to you
    const reverseRequest = await prisma.friendRequest.findFirst({
        where: {
        fromId: to.id,
        toId: from!.id,
        status: 'pending'
        }
    })
    
    if (reverseRequest) {
        return NextResponse.json(
        { error: 'You already received a friend request from that user' },
        { status: 409 }
        )
    }
  

  await prisma.friendRequest.create({
    data: {
      fromId: from!.id,
      toId: to.id,
      status: 'pending'
    }
  })

  // return NextResponse.json({ success: true, message: 'Friend request sent' })

  //code for sql injection
  return NextResponse.json({ 
    success: true,
    message: `Friend request sent to ${to.username}`
  });
}


// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function POST(req: NextRequest) {
//   const { fromUsername, toUsername } = await req.json()

//   if (!toUsername) return NextResponse.json({ error: 'Please enter username' }, { status: 400 })
//   if (fromUsername === toUsername) return NextResponse.json({ error: "You can't add yourself" }, { status: 400 })

//   // ✅ 👇 VULNERABLE TO SQL INJECTION
//   const query = `SELECT * FROM User WHERE username = '${toUsername}'`
//   console.log('Running query:', query)
//   const toArray = await prisma.$queryRawUnsafe(query)
//   const to = toArray[0]  // since $queryRaw returns an array

//   if (!to) return NextResponse.json({ error: 'Not existing user' }, { status: 404 })

//   const from = await prisma.user.findUnique({ where: { username: fromUsername } })

//   const isFriend = await prisma.friend.findFirst({
//     where: { userId: from!.id, friendId: to.id }
//   })
//   if (isFriend) return NextResponse.json({ error: 'Already friend' }, { status: 409 })

//   const existingRequest = await prisma.friendRequest.findFirst({
//     where: {
//       fromId: from!.id,
//       toId: to.id,
//       status: 'pending'
//     }
//   })
//   if (existingRequest) return NextResponse.json({ error: 'Request already sent' }, { status: 409 })

//   const reverseRequest = await prisma.friendRequest.findFirst({
//     where: {
//       fromId: to.id,
//       toId: from!.id,
//       status: 'pending'
//     }
//   })
//   if (reverseRequest) {
//     return NextResponse.json(
//       { error: 'You already received a friend request from that user' },
//       { status: 409 }
//     )
//   }

//   await prisma.friendRequest.create({
//     data: {
//       fromId: from!.id,
//       toId: to.id,
//       status: 'pending'
//     }
//   })

//   return NextResponse.json({ 
//     success: true,
//     message: `Friend request sent to ${to.username}`
//   });
// }
