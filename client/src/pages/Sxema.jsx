// Ma'lumotlar bazasi sxemasi: jadvallar, kalitlar, bog'lanishlar, VIEW va TRIGGER'lar
import { useEffect, useState } from 'react';
import { api } from '../api.js';
import SahifaSarlavha from '../components/SahifaSarlavha.jsx';
import { useXabar } from '../components/Xabar.jsx';

export default function Sxema() {
  const [sx, setSx] = useState(null);
  const xabar = useXabar();

  useEffect(() => {
    api.olish('/sxema').then(setSx).catch((e) => xabar(e.message, 'danger'));
  }, [xabar]);

  if (!sx) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" aria-label="Yuklanmoqda" />
      </div>
    );
  }

  const boglanishlar = sx.jadvallar.flatMap((j) =>
    j.boglanishlar.map((b) => ({ ...b, jadval: j.nomi })),
  );

  return (
    <section>
      <SahifaSarlavha
        ikon="diagram-3"
        sarlavha="Baza sxemasi"
        tavsif={`Relatsion baza: ${sx.jadvallar.length} ta jadval, ${boglanishlar.length} ta tashqi kalit, ${sx.korinishlar.length} ta VIEW, ${sx.triggerlar.length} ta TRIGGER`}
      />

      <div className="sxema-panjara mb-4">
        {sx.jadvallar.map((j) => (
          <article key={j.nomi} className="karta sxema-jadval">
            <header className="sxema-bosh">
              <span><i className="bi bi-table me-2" />{j.nomi}</span>
              <small>{j.qatorlar} qator</small>
            </header>
            <ul className="list-unstyled mb-0">
              {j.ustunlar.map((u) => {
                const fk = j.boglanishlar.find((b) => b.from === u.name);
                return (
                  <li key={u.name} className="sxema-ustun">
                    <span>
                      {u.pk ? <i className="bi bi-key-fill text-warning me-1" title="Birlamchi kalit (PRIMARY KEY)" /> : null}
                      {fk ? <i className="bi bi-link-45deg text-primary me-1" title="Tashqi kalit (FOREIGN KEY)" /> : null}
                      <span className={u.pk ? 'fw-semibold' : ''}>{u.name}</span>
                      {fk && <small className="text-primary ms-1">→ {fk.table}.{fk.to}</small>}
                    </span>
                    <span className="text-secondary small">
                      {u.type}
                      {u.notnull ? ' · NOT NULL' : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      <article className="karta mb-4">
        <div className="karta-bosh">
          <h2 className="karta-sarlavha"><i className="bi bi-link-45deg me-2" />Jadvallar orasidagi bog'lanishlar</h2>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Asosiy jadval (1)</th>
                <th>Bog'langan jadval (N)</th>
                <th>Tashqi kalit</th>
                <th>O'chirilganda</th>
              </tr>
            </thead>
            <tbody>
              {boglanishlar.map((b) => (
                <tr key={`${b.jadval}.${b.from}`}>
                  <td><code>{b.table}.{b.to}</code></td>
                  <td><code>{b.jadval}</code></td>
                  <td><code>{b.from}</code></td>
                  <td><span className="badge text-bg-light border">{b.on_delete}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <div className="row g-4">
        <div className="col-lg-6">
          <article className="karta h-100">
            <div className="karta-bosh">
              <h2 className="karta-sarlavha"><i className="bi bi-eye me-2" />Ko'rinishlar (VIEW)</h2>
            </div>
            <div className="p-3 pt-0">
              {sx.korinishlar.map((v) => (
                <details key={v.nomi} className="sql-details">
                  <summary>{v.nomi}</summary>
                  <pre>{v.sql}</pre>
                </details>
              ))}
            </div>
          </article>
        </div>
        <div className="col-lg-6">
          <article className="karta h-100">
            <div className="karta-bosh">
              <h2 className="karta-sarlavha"><i className="bi bi-lightning-charge me-2" />Triggerlar</h2>
            </div>
            <div className="p-3 pt-0">
              {sx.triggerlar.map((t) => (
                <details key={t.nomi} className="sql-details">
                  <summary>{t.nomi} <small className="text-secondary">({t.jadval})</small></summary>
                  <pre>{t.sql}</pre>
                </details>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
