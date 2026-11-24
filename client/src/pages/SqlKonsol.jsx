// SQL konsol: bazaga to'g'ridan-to'g'ri SELECT so'rovlar yuborish
import { useState } from 'react';
import { api } from '../api.js';
import SahifaSarlavha from '../components/SahifaSarlavha.jsx';

const namunalar = [
  {
    nom: 'Mualliflar va kitoblari soni (LEFT JOIN + GROUP BY)',
    sql: `SELECT m.ism AS muallif, COUNT(k.id) AS kitoblar, COALESCE(SUM(k.jami_soni), 0) AS nusxalar
FROM mualliflar m
LEFT JOIN kitoblar k ON k.muallif_id = m.id
GROUP BY m.id
ORDER BY kitoblar DESC, m.ism;`,
  },
  {
    nom: "Muddati o'tgan ijaralar (3 ta JOIN)",
    sql: `SELECT o.ism AS oquvchi, o.telefon, k.nomi AS kitob, i.muddat,
       CAST(julianday('now','localtime') - julianday(i.muddat) AS INTEGER) AS kechikish_kun
FROM ijaralar i
JOIN oquvchilar o ON o.id = i.oquvchi_id
JOIN kitoblar k   ON k.id = i.kitob_id
WHERE i.qaytarilgan_sana IS NULL
  AND i.muddat < date('now','localtime')
ORDER BY kechikish_kun DESC;`,
  },
  {
    nom: "Eng faol o'quvchilar (HAVING)",
    sql: `SELECT o.ism, o.guruh, COUNT(*) AS olgan_kitoblar
FROM ijaralar i
JOIN oquvchilar o ON o.id = i.oquvchi_id
GROUP BY o.id
HAVING COUNT(*) >= 1
ORDER BY olgan_kitoblar DESC
LIMIT 5;`,
  },
  {
    nom: 'Hech kim olmagan kitoblar (NOT EXISTS)',
    sql: `SELECT k.nomi, m.ism AS muallif
FROM kitoblar k
JOIN mualliflar m ON m.id = k.muallif_id
WHERE NOT EXISTS (SELECT 1 FROM ijaralar i WHERE i.kitob_id = k.id);`,
  },
  {
    nom: 'Guruhlar statistikasi (CTE)',
    sql: `WITH guruh_ijaralari AS (
  SELECT o.guruh, i.id, i.qaytarilgan_sana
  FROM ijaralar i JOIN oquvchilar o ON o.id = i.oquvchi_id
)
SELECT guruh,
       COUNT(*) AS jami,
       SUM(qaytarilgan_sana IS NULL) AS qolida
FROM guruh_ijaralari
GROUP BY guruh;`,
  },
  {
    nom: "Tugagan kitoblar (VIEW'dan)",
    sql: `SELECT nomi, muallif, jami_soni, mavjud
FROM v_kitoblar
WHERE mavjud = 0;`,
  },
];

export default function SqlKonsol() {
  const [sorov, setSorov] = useState(namunalar[0].sql);
  const [natija, setNatija] = useState(null);
  const [xato, setXato] = useState('');
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  const bajarish = async (sql = sorov) => {
    setYuklanmoqda(true);
    setXato('');
    try {
      setNatija(await api.qoshish('/sql', { sorov: sql }));
    } catch (e) {
      setNatija(null);
      setXato(e.message);
    } finally {
      setYuklanmoqda(false);
    }
  };

  const namunaTanlash = (n) => {
    setSorov(n.sql);
    bajarish(n.sql);
  };

  return (
    <section>
      <SahifaSarlavha
        ikon="terminal"
        sarlavha="SQL konsol"
        tavsif="Bazaga SELECT so'rov yuboring. Konsol faqat o'qish rejimida ishlaydi, ma'lumotlarni o'zgartirib bo'lmaydi"
      />

      <div className="row g-4">
        <div className="col-xl-4">
          <article className="karta">
            <div className="karta-bosh">
              <h2 className="karta-sarlavha">Namuna so'rovlar</h2>
            </div>
            <div className="list-group list-group-flush rounded-bottom">
              {namunalar.map((n) => (
                <button
                  key={n.nom}
                  type="button"
                  className={`list-group-item list-group-item-action small ${sorov === n.sql ? 'active' : ''}`}
                  onClick={() => namunaTanlash(n)}
                >
                  {n.nom}
                </button>
              ))}
            </div>
          </article>
        </div>

        <div className="col-xl-8">
          <article className="karta">
            <form
              className="p-3"
              onSubmit={(e) => {
                e.preventDefault();
                bajarish();
              }}
            >
              <label htmlFor="sql" className="form-label fw-semibold">SQL so'rov</label>
              <textarea
                id="sql"
                className="form-control sql-maydon"
                rows={8}
                spellCheck={false}
                value={sorov}
                onChange={(e) => setSorov(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    bajarish();
                  }
                }}
              />
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-secondary">Ctrl + Enter — bajarish</small>
                <button type="submit" className="btn btn-primary" disabled={yuklanmoqda}>
                  {yuklanmoqda ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-play-fill me-1" />}
                  Bajarish
                </button>
              </div>
            </form>

            {xato && <div className="alert alert-danger mx-3">{xato}</div>}

            {natija && (
              <>
                <div className="px-3 pb-2 small text-secondary">
                  {natija.jami} ta qator · {natija.vaqt_ms} ms
                  {natija.jami > natija.qatorlar.length && ` (birinchi ${natija.qatorlar.length} tasi ko'rsatildi)`}
                </div>
                <div className="table-responsive natija-jadval">
                  <table className="table table-sm table-striped mb-0">
                    <thead>
                      <tr>
                        {natija.ustunlar.map((u) => (
                          <th key={u}>{u}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {natija.qatorlar.map((q, i) => (
                        <tr key={i}>
                          {natija.ustunlar.map((u) => (
                            <td key={u}>{q[u] === null ? <span className="text-secondary">NULL</span> : String(q[u])}</td>
                          ))}
                        </tr>
                      ))}
                      {natija.qatorlar.length === 0 && (
                        <tr>
                          <td colSpan={natija.ustunlar.length || 1} className="text-center text-secondary py-3">
                            Natija bo'sh
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
