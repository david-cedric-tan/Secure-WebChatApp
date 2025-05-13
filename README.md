This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This is must read document to run the program

## How to initialize

This process is written assuming that you have pulled this repository from github.

If you never installed next js or node js then first you should download node js file from below url
```
nodejs.org
```

First, cd to root of the project. Root directory name is "info2222-p2"

Then run the following commands one by one 

```bash
npm install
npx prisma generate
npx prisma migrate dev --name initial
```

After this your .env should only have
```
DATABASE_URL="file:./dev.db"
```
If it is not like this just force make file named ".env" under project root and just put above line into the file and save it


## Getting Started

To run the program functionaly, 2 programs commands should be ran in 2 different terminal

First, run the development server:

```bash
npm run dev
```

then to run the real time server run the following command on another terminal

```bash
npm run socket
```

npm run dev terminal should be opened in localhost:3000
and socket should be in localhost:3001 this MUST be matching for functional running.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Setting up Certitifcate

Locate and enter the Certs Directory
```cd Certs```

Generate Certificate Authority
```
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.crt
-subj "/C=AU/ST=NSW/L=Sydney/O=USYD/OU=Student/CN=DevCA"
```

Generate Server Certificate Signing Request
```
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
-subj "/C=AU/ST=NSW/L=Sydney/O=USYD/OU=Student/CN=localhost"
```

Sign Server Certificate with CA
```openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
-out server.crt -days 365 -sha256```