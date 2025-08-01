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

By this initial setting, the database is empty, thus, to login and use the functionalities, it requires to register user and send friend request to do the 1 on 1 chatting.


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
PLEASE NOTE: that you need to open the above url not the url in the terminal.



## TOOLS
To Check Schema use the following in terminal
```
npx prisma studio 
```


## Setting up Certitifcate

To generate certificates please run the code below on your terminal.

```
chmod +x generate_certs.sh
./generate_certs.sh 
```

## USING HTTPS with DEVCA (DEVELOPMENT MODE - LOCAL)
To switch to local Development HTTPS with CA DEV(with private key)

1. Open .env file set ```NEXT_PUBLIC_CADDY=false```
2. run commands in 2 different terminal windows
```
npm run socket
```
```
npm run dev
```


## USING HTTPS with CA USING CADDY (PRODUCTION MODE - PUBLIC ACCESS)
1. Open .env file set ```NEXT_PUBLIC_CADDY=true```
2. run 
```	
sudo caddy run --config ./Caddyfile --adapter caddyfile
```
3. run commands in 2 different terminal windows
```
npm run socket
```
```
npm run dev
```



## (OPTIONAL)Setting up HTTPS with CA USING CADDY 
Follow these steps to use your own domain and computer with automatic HTTPS.

If you’d like to serve your app over HTTPS using a custom domain (e.g., yourname.duckdns.org) and Let’s Encrypt certificates, follow the instructions below:

1. Find out your computer’s WAN IP 
```
curl http://ident.me
```

2. Go to:  https://www.duckdns.org/ 
	1. Register under new subdomain, choose type A for free domain
	2. Enter WAN IP 


3. In your own router make sure to enable port forwarding 
	Port 443 -> Port 443 of ur computer IP address 

4. Install Caddy 
	Mac (install home-brew if not already installed)
<br> </br>
	```
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	brew install caddy
	```


5.  Running Caddy 
	Open Our Project File and MODIFY the any (alien888.duckdns.org) CODE To your domain name (___.duckdns.org)

    realtime-server server.mts 
    dashboard page.tsx  
    register page.tsx 
    app/page.tsx  
    Caddyfile 


Running Caddy  
	```
	sudo caddy run --config ./Caddyfile --adapter caddyfile
	```

6. Run NPM RUN DEV & NPM RUN SOCKET

7. Go to https://yourdomainname.duckdns.org


