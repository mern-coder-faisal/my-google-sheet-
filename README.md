# Spreadsheet Clone

This workspace includes:

- `client/` - React UI component (single-file demo)
- `frontend/` - Backend server (Express + Socket.IO) for persisting and broadcasting sheet updates

How to run:

1. Start backend: 
   - cd frontend
   - npm install
   - npm run dev

2. Start the frontend (Vite):
   - cd client
   - npm install
   - npm run dev

   The client will open on http://localhost:5173 (default Vite port) and expects the backend at `http://localhost:4000`.

Features implemented:
- Formula parser with functions: SUM, COUNT, COUNTA, AVERAGE, MIN, MAX
- Range support (e.g., `SUM(A1:B3)`)
- Dependency tracking and recalculation
- Circular reference detection (returns `#CIRC!`)
- Shift-based multi-cell selection (UI already present)
- Backend persistence and real-time updates via Socket.IO
# my-google-sheet-
