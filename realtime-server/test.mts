import {prisma} from '../src/lib/prisma.ts'

const run = async () => {
  try {
    const users = await prisma.user.findMany()
    console.log('Users:', users)
  } catch (err) {
    console.error('Prisma test failed:', err)
  }
}

run()
