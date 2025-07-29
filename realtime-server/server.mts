// server.mts
import { createServer as createHttpsServer } from 'https'; // For HTTPS
import { createServer as createHttpServer } from 'http'; // For HTTP
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'; // To read certificate files

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Check NEXT_PUBLIC_CADDY environment variable
const useCaddy = process.env.NEXT_PUBLIC_CADDY === 'true';
console.log('useCaddy in server.mts:', useCaddy); // Debug log
console.log('NEXT_PUBLIC_CADDY:', process.env.NEXT_PUBLIC_CADDY);

let httpServer;

// Conditionally create HTTP or HTTPS server
if (!useCaddy) {
  // Use HTTPS with CA-signed certificate for local testing
  const certsPath = path.join(__dirname, '..', 'certs');
  const privateKey = fs.readFileSync(path.join(certsPath, 'server.key'), 'utf8'); 
  const certificate = fs.readFileSync(path.join(certsPath, 'server.crt'), 'utf8'); 
  const caCertificate = fs.readFileSync(path.join(certsPath, 'ca.crt'), 'utf8');
  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: caCertificate,
  };
  httpServer = createHttpsServer(credentials);
} else {
  // Use HTTP locally
  httpServer = createHttpServer();
}

//=============== FOR DEVELOPMENT/TESTING LOCALHOST  =====================
const io = new Server(httpServer, {
  cors: {
    origin: ['https://0.0.0.0:3000','http://localhost:3000', 'https://localhost:3000', 'https://alien888.duckdns.org'],
    methods: ['GET', 'POST']
  }
})
//======================================================================

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

//============== FOR localhost ============================
httpServer.listen(3001, () => {
  console.log(`Socket.IO server running on ${useCaddy ? 'http' : 'https'}://localhost:3001`);
});