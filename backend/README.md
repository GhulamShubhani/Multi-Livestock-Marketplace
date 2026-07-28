# Backend (Phase 1)

## Run

```bash
cp .env.example .env   # or copy on Windows
npm install
npm run dev --workspace=@cat-marketplace/backend
```

Health: `GET http://localhost:5000/api/v1/health`

## Local MongoDB (Docker)

```bash
docker run -d --name cat-mongo -p 27017:27017 mongo:7
```

Set `MONGODB_URI=mongodb://127.0.0.1:27017/cat_marketplace` in `.env`.
