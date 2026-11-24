// Ma'lumotlar bazasiga ulanish (Node.js ichidagi SQLite moduli)
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
export const DB_PATH = path.join(DATA_DIR, 'kutubxona.db');

const sqlFayl = (nom) => fs.readFileSync(path.join(__dirname, 'sql', nom), 'utf8');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec(sqlFayl('schema.sql'));

// Baza bo'sh bo'lsa, namuna ma'lumotlarni yuklaymiz
const { soni } = db.prepare('SELECT COUNT(*) AS soni FROM mualliflar').get();
if (soni === 0) {
  db.exec(sqlFayl('seed.sql'));
  console.log('Baza yaratildi va namuna ma\'lumotlar yuklandi.');
}

// SQL konsol uchun faqat o'qish rejimidagi alohida ulanish
export const dbFaqatOqish = new DatabaseSync(DB_PATH, { readOnly: true });

export default db;
