-- =====================================================================
--  Kutubxona boshqaruv tizimi — relatsion ma'lumotlar bazasi sxemasi
--  DBMS: SQLite 3 (standart SQL)
--
--  Bog'lanishlar:
--    mualliflar    1 ──< N  kitoblar      (kitoblar.muallif_id)
--    kategoriyalar 1 ──< N  kitoblar      (kitoblar.kategoriya_id)
--    kitoblar      1 ──< N  ijaralar      (ijaralar.kitob_id)
--    oquvchilar    1 ──< N  ijaralar      (ijaralar.oquvchi_id)
--  ijaralar jadvali kitoblar va oquvchilar orasidagi N:M bog'lanishni
--  amalga oshiradi.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- 1. Mualliflar
CREATE TABLE IF NOT EXISTS mualliflar (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ism           TEXT    NOT NULL,
    mamlakat      TEXT,
    tugilgan_yil  INTEGER CHECK (tugilgan_yil IS NULL OR tugilgan_yil BETWEEN 1000 AND 2100)
);

-- 2. Kategoriyalar
CREATE TABLE IF NOT EXISTS kategoriyalar (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nomi   TEXT    NOT NULL UNIQUE
);

-- 3. Kitoblar
CREATE TABLE IF NOT EXISTS kitoblar (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    nomi           TEXT    NOT NULL,
    muallif_id     INTEGER NOT NULL
                   REFERENCES mualliflar(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    kategoriya_id  INTEGER
                   REFERENCES kategoriyalar(id) ON UPDATE CASCADE ON DELETE SET NULL,
    nashr_yili     INTEGER CHECK (nashr_yili IS NULL OR nashr_yili BETWEEN 1000 AND 2100),
    jami_soni      INTEGER NOT NULL DEFAULT 1 CHECK (jami_soni >= 0)
);

-- 4. O'quvchilar (kutubxona a'zolari)
CREATE TABLE IF NOT EXISTS oquvchilar (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ism             TEXT    NOT NULL,
    telefon         TEXT    UNIQUE,
    guruh           TEXT,
    royxatdan_sana  TEXT    NOT NULL DEFAULT (date('now', 'localtime'))
);

-- 5. Ijaralar (kitob berish / qaytarish)
CREATE TABLE IF NOT EXISTS ijaralar (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    kitob_id          INTEGER NOT NULL
                      REFERENCES kitoblar(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    oquvchi_id        INTEGER NOT NULL
                      REFERENCES oquvchilar(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    berilgan_sana     TEXT    NOT NULL DEFAULT (date('now', 'localtime')),
    muddat            TEXT    NOT NULL,
    qaytarilgan_sana  TEXT,
    CHECK (muddat >= berilgan_sana),
    CHECK (qaytarilgan_sana IS NULL OR qaytarilgan_sana >= berilgan_sana)
);

-- Indekslar (JOIN va qidiruvni tezlashtirish uchun)
CREATE INDEX IF NOT EXISTS idx_kitoblar_muallif   ON kitoblar(muallif_id);
CREATE INDEX IF NOT EXISTS idx_kitoblar_kategoriya ON kitoblar(kategoriya_id);
CREATE INDEX IF NOT EXISTS idx_ijaralar_kitob     ON ijaralar(kitob_id);
CREATE INDEX IF NOT EXISTS idx_ijaralar_oquvchi   ON ijaralar(oquvchi_id);

-- ---------------------------------------------------------------------
-- Ko'rinishlar (VIEW)
-- ---------------------------------------------------------------------

-- Kitoblar: muallif, kategoriya va hozir mavjud nusxalar soni bilan
CREATE VIEW IF NOT EXISTS v_kitoblar AS
SELECT k.id,
       k.nomi,
       k.muallif_id,
       m.ism        AS muallif,
       k.kategoriya_id,
       c.nomi       AS kategoriya,
       k.nashr_yili,
       k.jami_soni,
       k.jami_soni - (SELECT COUNT(*)
                        FROM ijaralar i
                       WHERE i.kitob_id = k.id
                         AND i.qaytarilgan_sana IS NULL) AS mavjud
  FROM kitoblar k
  JOIN mualliflar m         ON m.id = k.muallif_id
  LEFT JOIN kategoriyalar c ON c.id = k.kategoriya_id;

-- Ijaralar: kitob, muallif, o'quvchi va hisoblangan holat bilan
CREATE VIEW IF NOT EXISTS v_ijaralar AS
SELECT i.id,
       i.kitob_id,
       k.nomi       AS kitob,
       m.ism        AS muallif,
       i.oquvchi_id,
       o.ism        AS oquvchi,
       o.guruh,
       o.telefon,
       i.berilgan_sana,
       i.muddat,
       i.qaytarilgan_sana,
       CASE
           WHEN i.qaytarilgan_sana IS NOT NULL         THEN 'qaytarilgan'
           WHEN i.muddat < date('now', 'localtime')    THEN 'muddati_otgan'
           ELSE 'faol'
       END AS holat,
       CAST(julianday(date('now', 'localtime')) - julianday(i.muddat) AS INTEGER) AS kechikish_kun
  FROM ijaralar i
  JOIN kitoblar k   ON k.id = i.kitob_id
  JOIN mualliflar m ON m.id = k.muallif_id
  JOIN oquvchilar o ON o.id = i.oquvchi_id;

-- ---------------------------------------------------------------------
-- Triggerlar (biznes qoidalari baza darajasida)
-- ---------------------------------------------------------------------

-- Bo'sh nusxa qolmagan kitobni berib bo'lmaydi
CREATE TRIGGER IF NOT EXISTS trg_ijara_nusxa_bor
BEFORE INSERT ON ijaralar
WHEN (SELECT jami_soni FROM kitoblar WHERE id = NEW.kitob_id)
     <= (SELECT COUNT(*) FROM ijaralar
          WHERE kitob_id = NEW.kitob_id AND qaytarilgan_sana IS NULL)
BEGIN
    SELECT RAISE(ABORT, 'Bu kitobning bo''sh nusxasi qolmagan');
END;

-- Bir o'quvchi bir vaqtda 3 tadan ortiq kitob ololmaydi
CREATE TRIGGER IF NOT EXISTS trg_ijara_limit
BEFORE INSERT ON ijaralar
WHEN (SELECT COUNT(*) FROM ijaralar
       WHERE oquvchi_id = NEW.oquvchi_id AND qaytarilgan_sana IS NULL) >= 3
BEGIN
    SELECT RAISE(ABORT, 'Bir o''quvchi bir vaqtda 3 tadan ortiq kitob ololmaydi');
END;

-- Nusxalar sonini qo'lda berilganlardan kam qilib bo'lmaydi
CREATE TRIGGER IF NOT EXISTS trg_kitob_soni
BEFORE UPDATE OF jami_soni ON kitoblar
WHEN NEW.jami_soni < (SELECT COUNT(*) FROM ijaralar
                       WHERE kitob_id = NEW.id AND qaytarilgan_sana IS NULL)
BEGIN
    SELECT RAISE(ABORT, 'Nusxalar soni hozir berilgan kitoblar sonidan kam bo''lishi mumkin emas');
END;
