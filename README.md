# Kutubxona boshqaruv tizimi

**Fan:** Veb tizimlari · **Ish turi:** Laboratoriya ishi (1-qaydnoma)

**Topshiriq:** HTML5 asoslari, CSS, frontend frameworklar asosida JavaScript'da veb-tizim qurish. Tizimda relatsion SQL ma'lumotlar bazasi bo'lishi kerak.

Tizim kutubxona ishini yuritadi: kitoblar, mualliflar, kategoriyalar, o'quvchilar hisobi, kitob berish va qaytarib olish, muddati o'tgan kitoblarni nazorat qilish.

## Imkoniyatlar

- **Bosh sahifa:** umumiy statistika, muddati o'tgan ijaralar, eng ko'p o'qilgan kitoblar, kategoriyalar bo'yicha diagramma
- **Kitoblar, mualliflar, kategoriyalar, o'quvchilar:** to'liq CRUD (qo'shish, ko'rish, tahrirlash, o'chirish) va qidiruv
- **Ijaralar:** kitob berish, qaytarib olish, holat bo'yicha filtr (faol / muddati o'tgan / qaytarilgan)
- **Baza sxemasi:** jadvallar, birlamchi va tashqi kalitlar, bog'lanishlar, VIEW va TRIGGER'lar ko'rinishi
- **SQL konsol:** bazaga to'g'ridan-to'g'ri `SELECT` so'rov yuborish (faqat o'qish rejimida)
- Mobil qurilmalarga moslashuvchan dizayn

## Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Belgilash | HTML5 (semantik teglar: `header`, `nav`, `main`, `section`, `article`, `aside`; forma validatsiyasi) |
| Uslub | CSS3 (Flexbox, Grid, CSS o'zgaruvchilari, media so'rovlar) + Bootstrap 5 |
| Frontend framework | React 19 + React Router |
| Backend | Node.js + Express 5 (REST API) |
| Ma'lumotlar bazasi | SQLite (relatsion SQL), Node.js ichidagi `node:sqlite` moduli orqali |
| Yig'ish vositasi | Vite |

## Ma'lumotlar bazasi

5 ta jadval, 4 ta tashqi kalit (FOREIGN KEY), 2 ta VIEW, 3 ta TRIGGER.

```
mualliflar     1 ──< N  kitoblar   >── N 1  kategoriyalar
                          1
                          │
                          N
oquvchilar     1 ──< N  ijaralar
```

| Jadval | Vazifasi | Tashqi kalitlar |
|---|---|---|
| `mualliflar` | Kitob mualliflari | — |
| `kategoriyalar` | Janrlar | — |
| `kitoblar` | Kitoblar fondi | `muallif_id → mualliflar.id` (RESTRICT), `kategoriya_id → kategoriyalar.id` (SET NULL) |
| `oquvchilar` | Kutubxona a'zolari | — |
| `ijaralar` | Kitob berish yozuvlari (kitoblar va o'quvchilar orasidagi N:M bog'lanish) | `kitob_id → kitoblar.id`, `oquvchi_id → oquvchilar.id` (RESTRICT) |

**Baza darajasidagi qoidalar (TRIGGER):**
- bo'sh nusxasi qolmagan kitobni berib bo'lmaydi;
- bir o'quvchi bir vaqtda 3 tadan ortiq kitob ololmaydi;
- kitob nusxalari sonini hozir berilganlardan kam qilib bo'lmaydi.

**Ko'rinishlar (VIEW):**
- `v_kitoblar`: kitob, muallif, kategoriya va mavjud nusxalar soni;
- `v_ijaralar`: ijara, kitob, o'quvchi va hisoblangan holat (faol / muddati o'tgan / qaytarilgan).

To'liq SQL kod: [`server/sql/schema.sql`](server/sql/schema.sql) (sxema) va [`server/sql/seed.sql`](server/sql/seed.sql) (namuna ma'lumotlar).

## Ishga tushirish

Talab: **Node.js 22.13 yoki undan yangi** ([nodejs.org](https://nodejs.org)). Alohida baza serveri o'rnatish shart emas.

```bash
npm install
npm start
```

Brauzerda oching: **http://localhost:3000**

Birinchi ishga tushishda `data/kutubxona.db` fayli avtomatik yaratiladi va namuna ma'lumotlar bilan to'ldiriladi.

### Boshqa buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Ishlab chiqish rejimi: frontend (http://localhost:5173) va backend birga, o'zgarishlar avtomatik yangilanadi |
| `npm run build` | Frontendni `dist/` papkaga yig'ish |
| `npm run server` | Faqat serverni ishga tushirish (oldin `build` qilingan bo'lishi kerak) |
| `npm run db:reset` | Bazani boshlang'ich holatga qaytarish |

## Loyiha tuzilishi

```
├── client/                  # Frontend (React)
│   ├── index.html           # HTML5 sahifa
│   └── src/
│       ├── main.jsx         # Kirish nuqtasi
│       ├── App.jsx          # Menyu va sahifalar marshruti
│       ├── api.js           # Backend bilan ishlash (fetch)
│       ├── styles.css       # Uslublar
│       ├── components/      # Qayta ishlatiladigan komponentlar
│       └── pages/           # Sahifalar
├── server/                  # Backend (Express)
│   ├── index.js             # REST API
│   ├── db.js                # Bazaga ulanish
│   ├── reset.js             # Bazani tozalash
│   └── sql/
│       ├── schema.sql       # Jadvallar, VIEW, TRIGGER
│       └── seed.sql         # Namuna ma'lumotlar
├── data/                    # SQLite baza fayli (avtomatik yaratiladi)
├── package.json
└── vite.config.js
```

## REST API

| Metod | Manzil | Vazifasi |
|---|---|---|
| GET | `/api/statistika` | Bosh sahifa statistikasi |
| GET, POST | `/api/kitoblar` | Ro'yxat / qo'shish |
| PUT, DELETE | `/api/kitoblar/:id` | Tahrirlash / o'chirish |
| GET, POST | `/api/mualliflar` | Ro'yxat / qo'shish |
| PUT, DELETE | `/api/mualliflar/:id` | Tahrirlash / o'chirish |
| GET, POST | `/api/kategoriyalar` | Ro'yxat / qo'shish |
| PUT, DELETE | `/api/kategoriyalar/:id` | Tahrirlash / o'chirish |
| GET, POST | `/api/oquvchilar` | Ro'yxat / qo'shish |
| PUT, DELETE | `/api/oquvchilar/:id` | Tahrirlash / o'chirish |
| GET, POST | `/api/ijaralar` | Ro'yxat / kitob berish |
| PUT | `/api/ijaralar/:id/qaytarish` | Kitobni qaytarib olish |
| DELETE | `/api/ijaralar/:id` | Yozuvni o'chirish |
| GET | `/api/sxema` | Baza tuzilishi |
| POST | `/api/sql` | SELECT so'rov bajarish (faqat o'qish) |
