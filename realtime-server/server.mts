import { createServer } from 'https'
import { readFileSync } from 'fs';
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url';
import path from 'path';

// Calculate __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient()


// try {
//   const { prisma } = await import('./prisma')
//   console.log('Prisma loaded:', typeof prisma)
// } catch (err) {
//   console.error('Failed to load prisma:', err)
// }


const httpsServer = createServer({
  key: readFileSync(path.join(__dirname, '../certs/server.key')), //replace with own server key
  cert: readFileSync(path.join(__dirname, '../certs/server.crt'))}
)
const io = new Server(httpsServer, {
  cors: {
    origin: 'https://localhost:3000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  console.log('Prisma instance:', typeof prisma)

  socket.on('message', async (data) => {
    const { senderUsername, receiverUsername, content } = data

    if (!senderUsername || !receiverUsername || !content) return

    try {
      const sender = await prisma.user.findUnique({ where: { username: senderUsername } })
      const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } })

      if (!sender || !receiver) return

      const message = await prisma.message.create({
        data: {
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          content
        }
      })

      // Broadcast the saved message to all other clients
      io.emit('message', message)
    } catch (err) {
      console.error('Failed to save message:', err)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

httpsServer.listen(3001, () => {
  console.log('Socket.IO server running on https://localhost:3001')
})
