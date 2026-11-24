// Bazani o'chirib tashlaydi; server keyingi ishga tushganda qaytadan yaratadi
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'kutubxona.db');

for (const fayl of [DB_PATH, `${DB_PATH}-journal`]) {
  if (fs.existsSync(fayl)) fs.rmSync(fayl);
}
console.log('Baza tozalandi. Serverni qayta ishga tushiring: npm start');
