// root server.mts
import { createServer as createHttpsServer } from 'https'; // For HTTPS
import { createServer as createHttpServer } from 'http'; // For HTTP
import { parse } from 'url';
import next from 'next';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'; // To read certificate files
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Check NEXT_PUBLIC_CADDY environment variable
const useCaddy = process.env.NEXT_PUBLIC_CADDY === 'true';
console.log('useCaddy in server.mts:', useCaddy); // Debug log
console.log('NEXT_PUBLIC_CADDY:', process.env.NEXT_PUBLIC_CADDY);

let httpServer;

// Conditionally create HTTP or HTTPS server
if (!useCaddy) {
// Use HTTPS with CA-signed certificate for local testing
  const certsPath = path.join(__dirname, 'certs'); // /project/certs
  const privateKey = fs.readFileSync(path.join(certsPath, 'server.key'), 'utf8'); 
  const certificate = fs.readFileSync(path.join(certsPath, 'server.crt'), 'utf8'); 
  const caCertificate = fs.readFileSync(path.join(certsPath, 'ca.crt'), 'utf8');
  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: caCertificate,
  };
  httpServer = createHttpsServer(credentials, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });
} else {
  // Use HTTP locally
  httpServer = createHttpServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });
}

// app.prepare().then(() => {
//   httpServer.listen(port, '0.0.0.0', () => {
//     console.log(`> Ready on ${useCaddy ? 'http' : 'https'}://0.0.0.0:${port}`);
//   });
// });

app.prepare().then(() => {
  httpServer.listen(port, 'localhost', () => {
    console.log(`> Ready on ${useCaddy ? 'http' : 'https'}://localhost:${port}`);
  });
});