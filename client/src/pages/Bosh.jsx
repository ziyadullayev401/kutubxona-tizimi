// Bosh sahifa: umumiy statistika va tezkor ma'lumotlar
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, sana } from '../api.js';
import SahifaSarlavha from '../components/SahifaSarlavha.jsx';
import { useXabar } from '../components/Xabar.jsx';

function StatKarta({ ikon, rang, qiymat, nom, izoh }) {
  return (
    <div className="karta stat-karta">
      <div className={`stat-ikon rang-${rang}`}>
        <i className={`bi bi-${ikon}`} />
      </div>
      <div>
        <div className="stat-qiymat">{qiymat}</div>
        <div className="stat-nom">{nom}</div>
        {izoh && <div className="stat-izoh">{izoh}</div>}
      </div>
    </div>
  );
}

export default function Bosh() {
  const [s, setS] = useState(null);
  const xabar = useXabar();

  useEffect(() => {
    api.olish('/statistika').then(setS).catch((e) => xabar(e.message, 'danger'));
  }, [xabar]);

  if (!s) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" aria-label="Yuklanmoqda" />
      </div>
    );
  }

  const maxNusxa = Math.max(1, ...s.kategoriyalar.map((k) => k.nusxalar));

  return (
    <section>
      <SahifaSarlavha
        ikon="speedometer2"
        sarlavha="Bosh sahifa"
        tavsif={`Kutubxona holati: ${new Date().toLocaleDateString('ru-RU')}`}
      />

      <div className="stat-panjara mb-4">
        <StatKarta ikon="book" rang="kok" qiymat={s.kitob_nomlari} nom="Kitob nomlari" izoh={`${s.jami_nusxa} ta nusxa`} />
        <StatKarta ikon="person-badge" rang="binafsha" qiymat={s.mualliflar} nom="Mualliflar" />
        <StatKarta ikon="people" rang="yashil" qiymat={s.oquvchilar} nom="O'quvchilar" />
        <StatKarta ikon="arrow-left-right" rang="sariq" qiymat={s.qolda} nom="Hozir berilgan" />
        <StatKarta ikon="exclamation-octagon" rang="qizil" qiymat={s.muddati_otgan} nom="Muddati o'tgan" />
      </div>

      <div className="row g-4">
        <div className="col-xl-7">
          <article className="karta h-100">
            <div className="karta-bosh">
              <h2 className="karta-sarlavha">
                <i className="bi bi-alarm text-danger me-2" />
                Muddati o'tgan ijaralar
              </h2>
              <Link to="/ijaralar" className="small">Barchasi →</Link>
            </div>
            {s.kechikkanlar.length === 0 ? (
              <p className="bosh-holat">
                <i className="bi bi-emoji-smile" /> Muddati o'tgan kitoblar yo'q
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>O'quvchi</th>
                      <th>Kitob</th>
                      <th>Muddat</th>
                      <th className="text-center">Kechikish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.kechikkanlar.map((k) => (
                      <tr key={k.id}>
                        <td>
                          <span className="d-block">{k.oquvchi}</span>
                          <small className="text-secondary">{k.telefon}</small>
                        </td>
                        <td>{k.kitob}</td>
                        <td className="text-nowrap">{sana(k.muddat)}</td>
                        <td className="text-center">
                          <span className="badge rounded-pill text-bg-danger">{k.kechikish_kun} kun</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>

        <div className="col-xl-5 d-flex flex-column gap-4">
          <article className="karta">
            <div className="karta-bosh">
              <h2 className="karta-sarlavha">
                <i className="bi bi-fire text-warning me-2" />
                Eng ko'p o'qilgan kitoblar
              </h2>
            </div>
            <ol className="mashhur-royxat">
              {s.mashhur.map((k) => (
                <li key={k.id}>
                  <div>
                    <strong>{k.nomi}</strong>
                    <small className="d-block text-secondary">{k.muallif}</small>
                  </div>
                  <span className="badge rounded-pill text-bg-light border">{k.soni} marta</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="karta">
            <div className="karta-bosh">
              <h2 className="karta-sarlavha">
                <i className="bi bi-bar-chart text-primary me-2" />
                Kategoriyalar bo'yicha nusxalar
              </h2>
            </div>
            <div className="p-3 pt-0">
              {s.kategoriyalar.map((k) => (
                <div key={k.nomi} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{k.nomi}</span>
                    <strong>{k.nusxalar}</strong>
                  </div>
                  <div className="progress" role="progressbar" aria-label={k.nomi} aria-valuenow={k.nusxalar} aria-valuemin={0} aria-valuemax={maxNusxa}>
                    <div className="progress-bar" style={{ width: `${(k.nusxalar / maxNusxa) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
