// Kutubxona tizimi — REST API server (Express + SQLite)
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { dbFaqatOqish } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

class SorovXatosi extends Error {
  constructor(xabar, status = 400) {
    super(xabar);
    this.status = status;
  }
}

function idOl(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new SorovXatosi("Noto'g'ri ID");
  return id;
}

// Formadan kelgan qiymatlarni tekshirib, SQL parametrlariga aylantiradi
function tozala(maydonlar, body = {}) {
  const natija = {};
  for (const [kalit, m] of Object.entries(maydonlar)) {
    let q = body[kalit];
    if (typeof q === 'string') q = q.trim();
    if (q === '' || q === undefined) q = null;
    if (q !== null && m.turi === 'int') {
      const n = Number(q);
      if (!Number.isInteger(n)) throw new SorovXatosi(`"${m.nom}" butun son bo'lishi kerak`);
      q = n;
    }
    if (q !== null && m.turi === 'text' && typeof q !== 'string') q = String(q);
    if (q === null && m.majburiy) throw new SorovXatosi(`"${m.nom}" maydoni to'ldirilishi shart`);
    natija[kalit] = q;
  }
  return natija;
}

// ---------------------------------------------------------------------
// Oddiy CRUD jadvallar
// ---------------------------------------------------------------------
const jadvallar = {
  mualliflar: {
    maydonlar: {
      ism: { turi: 'text', nom: 'Ism', majburiy: true },
      mamlakat: { turi: 'text', nom: 'Mamlakat' },
      tugilgan_yil: { turi: 'int', nom: "Tug'ilgan yil" },
    },
    royxat: `
      SELECT m.*, COUNT(k.id) AS kitoblar_soni
        FROM mualliflar m
        LEFT JOIN kitoblar k ON k.muallif_id = m.id
       GROUP BY m.id
       ORDER BY m.ism`,
  },
  kategoriyalar: {
    maydonlar: {
      nomi: { turi: 'text', nom: 'Nomi', majburiy: true },
    },
    royxat: `
      SELECT c.*, COUNT(k.id) AS kitoblar_soni, COALESCE(SUM(k.jami_soni), 0) AS nusxalar
        FROM kategoriyalar c
        LEFT JOIN kitoblar k ON k.kategoriya_id = c.id
       GROUP BY c.id
       ORDER BY c.nomi`,
  },
  oquvchilar: {
    maydonlar: {
      ism: { turi: 'text', nom: 'F.I.Sh.', majburiy: true },
      telefon: { turi: 'text', nom: 'Telefon' },
      guruh: { turi: 'text', nom: 'Guruh' },
    },
    royxat: `
      SELECT o.*,
             COUNT(i.id) AS jami_olgan,
             SUM(CASE WHEN i.id IS NOT NULL AND i.qaytarilgan_sana IS NULL THEN 1 ELSE 0 END) AS qolida
        FROM oquvchilar o
        LEFT JOIN ijaralar i ON i.oquvchi_id = o.id
       GROUP BY o.id
       ORDER BY o.ism`,
  },
  kitoblar: {
    maydonlar: {
      nomi: { turi: 'text', nom: 'Kitob nomi', majburiy: true },
      muallif_id: { turi: 'int', nom: 'Muallif', majburiy: true },
      kategoriya_id: { turi: 'int', nom: 'Kategoriya' },
      nashr_yili: { turi: 'int', nom: 'Nashr yili' },
      jami_soni: { turi: 'int', nom: 'Nusxalar soni', majburiy: true },
    },
    royxat: 'SELECT * FROM v_kitoblar ORDER BY nomi',
  },
};

for (const [jadval, cfg] of Object.entries(jadvallar)) {
  const ustunlar = Object.keys(cfg.maydonlar);
  const insertSql = `INSERT INTO ${jadval} (${ustunlar.join(', ')}) VALUES (${ustunlar.map((u) => ':' + u).join(', ')})`;
  const updateSql = `UPDATE ${jadval} SET ${ustunlar.map((u) => `${u} = :${u}`).join(', ')} WHERE id = :id`;

  app.get(`/api/${jadval}`, (req, res) => {
    res.json(db.prepare(cfg.royxat).all());
  });

  app.post(`/api/${jadval}`, (req, res) => {
    const qiymatlar = tozala(cfg.maydonlar, req.body);
    const natija = db.prepare(insertSql).run(qiymatlar);
    res.status(201).json({ id: Number(natija.lastInsertRowid) });
  });

  app.put(`/api/${jadval}/:id`, (req, res) => {
    const qiymatlar = { ...tozala(cfg.maydonlar, req.body), id: idOl(req) };
    const natija = db.prepare(updateSql).run(qiymatlar);
    if (natija.changes === 0) throw new SorovXatosi('Yozuv topilmadi', 404);
    res.json({ ok: true });
  });

  app.delete(`/api/${jadval}/:id`, (req, res) => {
    const natija = db.prepare(`DELETE FROM ${jadval} WHERE id = ?`).run(idOl(req));
    if (natija.changes === 0) throw new SorovXatosi('Yozuv topilmadi', 404);
    res.status(204).end();
  });
}

// ---------------------------------------------------------------------
// Ijaralar (kitob berish va qaytarish)
// ---------------------------------------------------------------------
app.get('/api/ijaralar', (req, res) => {
  res.json(
    db.prepare(`
      SELECT * FROM v_ijaralar
       ORDER BY CASE holat WHEN 'muddati_otgan' THEN 0 WHEN 'faol' THEN 1 ELSE 2 END,
                berilgan_sana DESC, id DESC`).all(),
  );
});

app.post('/api/ijaralar', (req, res) => {
  const q = tozala(
    {
      kitob_id: { turi: 'int', nom: 'Kitob', majburiy: true },
      oquvchi_id: { turi: 'int', nom: "O'quvchi", majburiy: true },
      kun: { turi: 'int', nom: 'Muddat (kun)', majburiy: true },
    },
    req.body,
  );
  if (q.kun < 1 || q.kun > 60) throw new SorovXatosi("Muddat 1 kundan 60 kungacha bo'lishi kerak");

  const natija = db
    .prepare(`
      INSERT INTO ijaralar (kitob_id, oquvchi_id, berilgan_sana, muddat)
      VALUES (:kitob_id, :oquvchi_id, date('now', 'localtime'),
              date('now', 'localtime', '+' || :kun || ' days'))`)
    .run(q);
  res.status(201).json({ id: Number(natija.lastInsertRowid) });
});

app.put('/api/ijaralar/:id/qaytarish', (req, res) => {
  const natija = db
    .prepare(`
      UPDATE ijaralar SET qaytarilgan_sana = date('now', 'localtime')
       WHERE id = ? AND qaytarilgan_sana IS NULL`)
    .run(idOl(req));
  if (natija.changes === 0) throw new SorovXatosi('Faol ijara topilmadi', 404);
  res.json({ ok: true });
});

app.delete('/api/ijaralar/:id', (req, res) => {
  const natija = db.prepare('DELETE FROM ijaralar WHERE id = ?').run(idOl(req));
  if (natija.changes === 0) throw new SorovXatosi('Yozuv topilmadi', 404);
  res.status(204).end();
});

// ---------------------------------------------------------------------
// Statistika (bosh sahifa)
// ---------------------------------------------------------------------
app.get('/api/statistika', (req, res) => {
  const umumiy = db
    .prepare(`
      SELECT (SELECT COUNT(*) FROM kitoblar)                       AS kitob_nomlari,
             (SELECT COALESCE(SUM(jami_soni), 0) FROM kitoblar)    AS jami_nusxa,
             (SELECT COUNT(*) FROM mualliflar)                     AS mualliflar,
             (SELECT COUNT(*) FROM oquvchilar)                     AS oquvchilar,
             (SELECT COUNT(*) FROM v_ijaralar WHERE holat <> 'qaytarilgan')   AS qolda,
             (SELECT COUNT(*) FROM v_ijaralar WHERE holat = 'muddati_otgan')  AS muddati_otgan`)
    .get();

  const mashhur = db
    .prepare(`
      SELECT k.id, k.nomi, m.ism AS muallif, COUNT(i.id) AS soni
        FROM ijaralar i
        JOIN kitoblar k   ON k.id = i.kitob_id
        JOIN mualliflar m ON m.id = k.muallif_id
       GROUP BY k.id
       ORDER BY soni DESC, k.nomi
       LIMIT 5`)
    .all();

  const kategoriyalar = db
    .prepare(`
      SELECT c.nomi, COALESCE(SUM(k.jami_soni), 0) AS nusxalar
        FROM kategoriyalar c
        LEFT JOIN kitoblar k ON k.kategoriya_id = c.id
       GROUP BY c.id
       ORDER BY nusxalar DESC`)
    .all();

  const kechikkanlar = db
    .prepare(`
      SELECT id, oquvchi, guruh, telefon, kitob, muddat, kechikish_kun
        FROM v_ijaralar
       WHERE holat = 'muddati_otgan'
       ORDER BY kechikish_kun DESC`)
    .all();

  res.json({ ...umumiy, mashhur, kategoriyalar, kechikkanlar });
});

// ---------------------------------------------------------------------
// Baza sxemasi (jadvallar, ustunlar, bog'lanishlar)
// ---------------------------------------------------------------------
app.get('/api/sxema', (req, res) => {
  const obyektlar = db
    .prepare(`
      SELECT type, name, tbl_name, sql FROM sqlite_master
       WHERE name NOT LIKE 'sqlite_%' AND type IN ('table', 'view', 'trigger')
       ORDER BY rowid`)
    .all();

  const jadvallarRoyxati = obyektlar
    .filter((o) => o.type === 'table')
    .map((o) => ({
      nomi: o.name,
      qatorlar: db.prepare(`SELECT COUNT(*) AS n FROM "${o.name}"`).get().n,
      ustunlar: db.prepare(`PRAGMA table_info("${o.name}")`).all(),
      boglanishlar: db.prepare(`PRAGMA foreign_key_list("${o.name}")`).all(),
    }));

  res.json({
    jadvallar: jadvallarRoyxati,
    korinishlar: obyektlar.filter((o) => o.type === 'view').map((o) => ({ nomi: o.name, sql: o.sql })),
    triggerlar: obyektlar
      .filter((o) => o.type === 'trigger')
      .map((o) => ({ nomi: o.name, jadval: o.tbl_name, sql: o.sql })),
  });
});

// ---------------------------------------------------------------------
// SQL konsol — faqat SELECT so'rovlari, faqat o'qish ulanishi orqali
// ---------------------------------------------------------------------
app.post('/api/sql', (req, res) => {
  let sorov = String(req.body?.sorov ?? '').trim().replace(/;\s*$/, '');
  if (!sorov) throw new SorovXatosi("So'rov bo'sh");
  if (!/^(select|with)\b/i.test(sorov)) throw new SorovXatosi('Faqat SELECT (yoki WITH) so\'rovlariga ruxsat berilgan');
  if (sorov.includes(';')) throw new SorovXatosi("Bir vaqtda faqat bitta so'rov yuboring");

  try {
    const stmt = dbFaqatOqish.prepare(sorov);
    const boshlanish = performance.now();
    const qatorlar = stmt.all();
    const vaqt = performance.now() - boshlanish;
    const ustunlar = typeof stmt.columns === 'function'
      ? stmt.columns().map((c) => c.name)
      : Object.keys(qatorlar[0] ?? {});
    res.json({ ustunlar, qatorlar: qatorlar.slice(0, 500), jami: qatorlar.length, vaqt_ms: Number(vaqt.toFixed(2)) });
  } catch (err) {
    throw new SorovXatosi(`SQL xatosi: ${err.message}`);
  }
});

app.use('/api', (req, res) => res.status(404).json({ xato: 'Bunday API manzili yo\'q' }));

// ---------------------------------------------------------------------
// Frontend (build qilingan React ilova)
// ---------------------------------------------------------------------
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET') return res.sendFile(path.join(DIST, 'index.html'));
    next();
  });
}

// ---------------------------------------------------------------------
// Xatolarni qayta ishlash
// ---------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof SorovXatosi) return res.status(err.status).json({ xato: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ xato: "So'rov JSON formatida emas" });

  if (err.code === 'ERR_SQLITE_ERROR') {
    const m = String(err.message);
    if (m.includes('FOREIGN KEY')) {
      return res.status(400).json({
        xato: req.method === 'DELETE'
          ? "Bu yozuvni o'chirib bo'lmaydi: unga bog'langan yozuvlar bor (masalan, kitoblar yoki ijaralar)"
          : "Tanlangan bog'langan yozuv mavjud emas",
      });
    }
    if (m.includes('UNIQUE')) return res.status(400).json({ xato: 'Bunday qiymat allaqachon mavjud' });
    if (m.includes('NOT NULL')) return res.status(400).json({ xato: "Majburiy maydon to'ldirilmagan" });
    if (m.includes('CHECK')) return res.status(400).json({ xato: "Kiritilgan qiymat ruxsat etilgan chegaradan tashqarida" });
    if (err.errcode === 1811) return res.status(400).json({ xato: m }); // trigger: RAISE(ABORT, ...)
  }

  console.error(err);
  res.status(500).json({ xato: 'Serverda kutilmagan xato yuz berdi' });
});

app.listen(PORT, () => {
  console.log(`Kutubxona tizimi ishga tushdi: http://localhost:${PORT}`);
});
