-- =====================================================================
--  Boshlang'ich (namuna) ma'lumotlar
-- =====================================================================

INSERT INTO kategoriyalar (id, nomi) VALUES
    (1, 'Badiiy adabiyot'),
    (2, 'She''riyat'),
    (3, 'Tarixiy roman'),
    (4, 'Dasturlash'),
    (5, 'Ilmiy-ommabop');

INSERT INTO mualliflar (id, ism, mamlakat, tugilgan_yil) VALUES
    (1,  'Abdulla Qodiriy',     'O''zbekiston', 1894),
    (2,  'Abdulhamid Cho''lpon', 'O''zbekiston', 1897),
    (3,  'O''tkir Hoshimov',     'O''zbekiston', 1941),
    (4,  'Alisher Navoiy',      'Xuroson',      1441),
    (5,  'Erkin Vohidov',       'O''zbekiston', 1936),
    (6,  'Tohir Malik',         'O''zbekiston', 1946),
    (7,  'Marijn Haverbeke',    'Niderlandiya', NULL),
    (8,  'Robert C. Martin',    'AQSh',         1952),
    (9,  'Douglas Crockford',   'AQSh',         1955),
    (10, 'Yuval Noah Harari',   'Isroil',       1976);

INSERT INTO kitoblar (id, nomi, muallif_id, kategoriya_id, nashr_yili, jami_soni) VALUES
    (1,  'O''tkan kunlar',              1,  3, 1926, 5),
    (2,  'Mehrobdan chayon',           1,  3, 1929, 3),
    (3,  'Kecha va kunduz',            2,  1, 1936, 2),
    (4,  'Dunyoning ishlari',          3,  1, 1982, 4),
    (5,  'Ikki eshik orasi',           3,  1, 1986, 3),
    (6,  'Xamsa',                      4,  2, 1485, 2),
    (7,  'Ruhlar isyoni',              5,  2, 1980, 3),
    (8,  'Shaytanat',                  6,  1, 1994, 4),
    (9,  'Eloquent JavaScript',        7,  4, 2018, 3),
    (10, 'Clean Code',                 8,  4, 2008, 2),
    (11, 'JavaScript: The Good Parts', 9,  4, 2008, 1),
    (12, 'Sapiens',                    10, 5, 2011, 3);

INSERT INTO oquvchilar (id, ism, telefon, guruh, royxatdan_sana) VALUES
    (1, 'Aziz Karimov',       '+998901234501', 'DI-21', date('now', 'localtime', '-120 days')),
    (2, 'Madina Rahimova',    '+998901234502', 'DI-21', date('now', 'localtime', '-110 days')),
    (3, 'Jasur Tursunov',     '+998901234503', 'KI-22', date('now', 'localtime', '-95 days')),
    (4, 'Nilufar Sobirova',   '+998901234504', 'KI-22', date('now', 'localtime', '-90 days')),
    (5, 'Bekzod Aliyev',      '+998901234505', 'AT-23', date('now', 'localtime', '-60 days')),
    (6, 'Shahnoza Yusupova',  '+998901234506', 'AT-23', date('now', 'localtime', '-45 days')),
    (7, 'Sardor Normatov',    '+998901234507', 'DI-21', date('now', 'localtime', '-30 days')),
    (8, 'Dilnoza Ergasheva',  '+998901234508', 'KI-22', date('now', 'localtime', '-12 days'));

-- Ijaralar: qaytarilganlar, faollar va muddati o'tganlar aralash
INSERT INTO ijaralar (kitob_id, oquvchi_id, berilgan_sana, muddat, qaytarilgan_sana) VALUES
    (1,  1, date('now','localtime','-60 days'), date('now','localtime','-46 days'), date('now','localtime','-48 days')),
    (9,  1, date('now','localtime','-40 days'), date('now','localtime','-26 days'), date('now','localtime','-27 days')),
    (12, 2, date('now','localtime','-35 days'), date('now','localtime','-21 days'), date('now','localtime','-22 days')),
    (1,  3, date('now','localtime','-30 days'), date('now','localtime','-16 days'), date('now','localtime','-15 days')),
    (4,  4, date('now','localtime','-28 days'), date('now','localtime','-14 days'), date('now','localtime','-20 days')),
    (10, 5, date('now','localtime','-25 days'), date('now','localtime','-11 days'), date('now','localtime','-12 days')),
    (1,  6, date('now','localtime','-20 days'), date('now','localtime','-6 days'),  date('now','localtime','-8 days')),
    (8,  7, date('now','localtime','-18 days'), date('now','localtime','-4 days'),  date('now','localtime','-5 days')),
    -- faol
    (9,  2, date('now','localtime','-6 days'),  date('now','localtime','+8 days'),  NULL),
    (1,  4, date('now','localtime','-3 days'),  date('now','localtime','+11 days'), NULL),
    (11, 5, date('now','localtime','-2 days'),  date('now','localtime','+12 days'), NULL),
    (12, 8, date('now','localtime','-1 days'),  date('now','localtime','+13 days'), NULL),
    (6,  1, date('now','localtime','-5 days'),  date('now','localtime','+9 days'),  NULL),
    -- muddati o'tgan
    (3,  3, date('now','localtime','-25 days'), date('now','localtime','-11 days'), NULL),
    (10, 6, date('now','localtime','-19 days'), date('now','localtime','-5 days'),  NULL),
    (8,  7, date('now','localtime','-16 days'), date('now','localtime','-2 days'),  NULL);
