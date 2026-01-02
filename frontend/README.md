# Spreadsheet Engine (Backend)

This folder contains a simple Express + Socket.IO backend that stores sheets in `sheets.json` and exposes endpoints:

- GET /api/sheets
- POST /api/sheets
- POST /api/sheets/:id

It also emits `sheets:updated` socket events when sheets are saved.

Quick start:

1. cd frontend
2. npm install
3. npm run dev   # or npm start

Server will be available at http://localhost:4000

MongoDB support

- By default the server will try to connect to MongoDB at `mongodb://127.0.0.1:27017/spreadsheet`.
- To use a different Mongo connection string, set the `MONGO_URI` environment variable before starting, e.g.:

  MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/mydb" npm run dev

- If MongoDB is unavailable, the server falls back to file-based persistence (`sheets.json`).

Optional: run a local Mongo instance with Docker:

  docker run -d -p 27017:27017 --name local-mongo mongo:7

After starting Mongo, restart the server and it will persist data in the database.
