const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'sheets.json');
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jsdevfaisal_db_user:PLRNY5oPV5qprLU0@cluster0.kpywelm.mongodb.net/';

// Mongoose setup
let Sheet;
const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'spreadsheet' });
    const sheetSchema = new mongoose.Schema({
      id: { type: String, unique: true },
      name: String,
      data: Object,
      columnWidths: Object,
      rowHeights: Object
    }, { timestamps: true });
    Sheet = mongoose.models.Sheet || mongoose.model('Sheet', sheetSchema);
    console.log('Hurrah Connected to MongoDB');
  } catch (e) {
    console.warn('MongoDB connect failed, falling back to file storage:', e.message);
  }
};
connectMongo();

// File-based fallback functions
const readSheetsFile = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([{
        id: '1', name: 'Sheet1', data: {}, columnWidths: {}, rowHeights: {}
      }], null, 2));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading sheets.json', e);
    return [];
  }
};

const writeSheetsFile = (sheets) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(sheets, null, 2));
};

// DB-backed functions (if Mongo connected)
const readSheetsDB = async () => {
  if (!Sheet) return null;
  const docs = await Sheet.find().lean();
  if (!docs || docs.length === 0) {
    const defaultSheet = await Sheet.create({ id: '1', name: 'Sheet1', data: {}, columnWidths: {}, rowHeights: {} });
    return [defaultSheet.toObject()];
  }
  return docs;
};

const writeSheetsDB = async (sheets) => {
  if (!Sheet) throw new Error('DB not available');
  // upsert each sheet based on id
  await Promise.all(sheets.map(s => Sheet.updateOne({ id: s.id }, { $set: s }, { upsert: true })));
};

app.get('/api/sheets', async (req, res) => {
  try {
    const dbSheets = await readSheetsDB();
    if (dbSheets) return res.json(dbSheets);
    const sheets = readSheetsFile();
    return res.json(sheets);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/api/sheets', async (req, res) => {
  const sheets = req.body;
  try {
    if (Sheet) {
      await writeSheetsDB(sheets);
    } else {
      writeSheetsFile(sheets);
    }
    io.emit('sheets:updated', sheets);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

app.post('/api/sheets/:id', async (req, res) => {
  const sheetId = req.params.id;
  const update = req.body;
  try {
    if (Sheet) {
      await Sheet.updateOne({ id: sheetId }, { $set: update }, { upsert: true });
      const all = await readSheetsDB();
      io.emit('sheets:updated', all);
      return res.json({ success: true });
    }

    const sheets = readSheetsFile();
    const updated = sheets.map(s => s.id === sheetId ? { ...s, ...update } : s);
    writeSheetsFile(updated);
    io.emit('sheets:updated', updated);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

const PORT = process.env.PORT || 4000;
http.listen(PORT, () => console.log(`Server listening on ${PORT}`));