# Demo OAuth Login via GitHub

## Setup
1. Rename `example.env` to `.env`
2. Create a client secret and save it along with the client ID in the `.env` file.
3. Setup `HOST` and `PORT` in the `.env` file.
4. `npm install`
5. `npm start`

## Docker Setup (Alternative)
```bash
docker build . -t krishna/demo-ghoauth-node 
docker run --name oauth-node-demo -d -t -p 12345:80 krishna/demo-ghoauth-node
```