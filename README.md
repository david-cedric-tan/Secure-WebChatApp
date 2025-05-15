This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This is must read document to run the program

## How to initialize

This process is written assuming that you have pulled this repository from github.

If you never installed next js or node js then first you should download node js file from below url
```
nodejs.org
```

First, cd to root of the project. Root directory name is "info2222-p2"
cd
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


## Description of files(for group)

This part of documentation is mainly for group mate to explain what each file is for and what do they do,

### Tools we are using

We currently are using next js for this project. And this will construct most of the front and backend(server).

But since it's chatting system, we also need socket server. And all that is placed under realtime-server directory.

For database, we indeed are using sqlite, but for helping communication between next js and sqlite, we are using a tool called prisma. This makes us comfortable for using database in the code.

### Frontend, Backend(Server), and Realtime server

All the files that has name page.tsx is the frontend. The page.tsx under src/app directory is the initial frontend that will appear when we run "npm run dev" which will be the loging page.
There are 2 more page.tsx under app/dashboard, and app/register. Of course they are frontend for those pages.

For backend which is the server, they are all placed under src/app/api directory. Under that directory there will be subdirectorires and all subdirectories will have route.ts accordingly.
Those folders identify what server should do when some request or event happens in the frontend.
For instance login/route.ts is identifying whether user is making valid login, and res