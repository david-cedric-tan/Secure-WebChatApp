// server.mts
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://alien888.duckdns.org'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  console.log('Prisma instance:', typeof prisma);

  socket.on('message', async (data) => {
    const { senderUsername, receiverUsername, content } = data;

    if (!senderUsername || !receiverUsername || !content) return;

    try {
      const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
      const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

      if (!sender || !receiver) return;

      const message = await prisma.message.create({
        data: {
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          content,
        },
      });

      io.emit('message', message);
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(3001, '0.0.0.0', () => {
  console.log('Socket.IO server running on http://0.0.0.0:3001');
});