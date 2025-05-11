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
npx prisma db push      # or migrate dev
```

After this your .env should only have
```
DATABASE_URL="file:./dev.db"
```


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
