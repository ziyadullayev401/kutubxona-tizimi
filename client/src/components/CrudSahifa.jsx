// Umumiy CRUD sahifa: ro'yxat, qidiruv, qo'shish, tahrirlash, o'chirish
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from './Modal.jsx';
import SahifaSarlavha from './SahifaSarlavha.jsx';
import { useXabar } from './Xabar.jsx';

export default function CrudSahifa({ ikon, sarlavha, tavsif, url, birlik, ustunlar, maydonlar }) {
  const [royxat, setRoyxat] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [qidiruv, setQidiruv] = useState('');
  const [variantlar, setVariantlar] = useState({});
  const [forma, setForma] = useState(null); // { id?, qiymatlar }
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const xabar = useXabar();

  const yuklash = useCallback(async () => {
    try {
      setRoyxat(await api.olish(url));
    } catch (e) {
      xabar(e.message, 'danger');
    } finally {
      setYuklanmoqda(false);
    }
  }, [url, xabar]);

  useEffect(() => {
    yuklash();
  }, [yuklash]);

  const korinadi = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    if (!q) return royxat;
    return royxat.filter((r) => ustunlar.some((u) => String(r[u.kalit] ?? '').toLowerCase().includes(q)));
  }, [royxat, qidiruv, ustunlar]);

  const ochish = async (yozuv) => {
    const qiymatlar = {};
    for (const m of maydonlar) {
      const q = yozuv ? yozuv[m.kalit] : m.standart;
      qiymatlar[m.kalit] = q === null || q === undefined ? '' : String(q);
    }
    setForma({ id: yozuv?.id, qiymatlar });

    // select maydonlar uchun bog'langan jadvallardan variantlarni olamiz
    try {
      const manbali = maydonlar.filter((m) => m.manba);
      const natijalar = await Promise.all(manbali.map((m) => api.olish(m.manba)));
      setVariantlar(Object.fromEntries(manbali.map((m, i) => [m.kalit, natijalar[i]])));
    } catch (e) {
      xabar(e.message, 'danger');
    }
  };

  const yopish = useCallback(() => setForma(null), []);

  const ozgartir = (kalit, qiymat) =>
    setForma((f) => ({ ...f, qiymatlar: { ...f.qiymatlar, [kalit]: qiymat } }));

  const saqlash = async (e) => {
    e.preventDefault();
    setSaqlanmoqda(true);
    try {
      if (forma.id) await api.yangilash(`${url}/${forma.id}`, forma.qiymatlar);
      else await api.qoshish(url, forma.qiymatlar);
      xabar(forma.id ? `${birlik} yangilandi` : `${birlik} qo'shildi`);
      setForma(null);
      yuklash();
    } catch (err) {
      xabar(err.message, 'danger');
    } finally {
      setSaqlanmoqda(false);
    }
  };

  const ochir = async (yozuv) => {
    const nom = yozuv[ustunlar[0].kalit];
    if (!window.confirm(`"${nom}" o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.`)) return;
    try {
      await api.ochirish(`${url}/${yozuv.id}`);
      xabar(`${birlik} o'chirildi`);
      yuklash();
    } catch (err) {
      xabar(err.message, 'danger');
    }
  };

  return (
    <section>
      <SahifaSarlavha ikon={ikon} sarlavha={sarlavha} tavsif={tavsif}>
        <button className="btn btn-primary" onClick={() => ochish(null)}>
          <i className="bi bi-plus-lg me-1" /> Yangi {birlik.toLowerCase()}
        </button>
      </SahifaSarlavha>

      <div className="karta">
        <div className="karta-bosh">
          <div className="qidiruv">
            <i className="bi bi-search" />
            <input
              type="search"
              className="form-control"
              placeholder="Qidirish..."
              aria-label="Qidirish"
              value={qidiruv}
              onChange={(e) => setQidiruv(e.target.value)}
            />
          </div>
          <span className="text-secondary small">
            {korinadi.length} ta yozuv{qidiruv && ` (jami ${royxat.length})`}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th className="text-secondary" style={{ width: 56 }}>#</th>
                {ustunlar.map((u) => (
                  <th key={u.kalit} className={u.sinf}>{u.nom}</th>
                ))}
                <th className="text-end">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {yuklanmoqda && (
                <tr>
                  <td colSpan={ustunlar.length + 2} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" aria-label="Yuklanmoqda" />
                  </td>
                </tr>
              )}
              {!yuklanmoqda && korinadi.length === 0 && (
                <tr>
                  <td colSpan={ustunlar.length + 2} className="bosh-holat">
                    <i className="bi bi-inbox" />
                    {qidiruv ? "Qidiruv bo'yicha hech narsa topilmadi" : "Hozircha yozuvlar yo'q"}
                  </td>
                </tr>
              )}
              {korinadi.map((r, i) => (
                <tr key={r.id}>
                  <td className="text-secondary">{i + 1}</td>
                  {ustunlar.map((u) => (
                    <td key={u.kalit} className={u.sinf}>
                      {u.render ? u.render(r) : (r[u.kalit] ?? <span className="text-secondary">—</span>)}
                    </td>
                  ))}
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-light me-1" onClick={() => ochish(r)} title="Tahrirlash" aria-label="Tahrirlash">
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => ochir(r)} title="O'chirish" aria-label="O'chirish">
                      <i className="bi bi-trash3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {forma && (
        <Modal sarlavha={forma.id ? `${birlik}ni tahrirlash` : `Yangi ${birlik.toLowerCase()}`} yopish={yopish}>
          <form onSubmit={saqlash}>
            <div className="modal-body">
              {maydonlar.map((m) => (
                <div className="mb-3" key={m.kalit}>
                  <label htmlFor={`f-${m.kalit}`} className="form-label">
                    {m.nom}
                    {m.majburiy && <span className="text-danger"> *</span>}
                  </label>
                  {m.turi === 'select' ? (
                    <select
                      id={`f-${m.kalit}`}
                      className="form-select"
                      required={m.majburiy}
                      value={forma.qiymatlar[m.kalit]}
                      onChange={(e) => ozgartir(m.kalit, e.target.value)}
                    >
                      <option value="">— tanlang —</option>
                      {(variantlar[m.kalit] ?? []).map((v) => (
                        <option key={v.id} value={String(v.id)}>{v[m.variantNom]}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`f-${m.kalit}`}
                      className="form-control"
                      type={m.turi ?? 'text'}
                      required={m.majburiy}
                      min={m.min}
                      max={m.max}
                      pattern={m.pattern}
                      title={m.izoh}
                      placeholder={m.placeholder}
                      autoFocus={m === maydonlar[0]}
                      value={forma.qiymatlar[m.kalit]}
                      onChange={(e) => ozgartir(m.kalit, e.target.value)}
                    />
                  )}
                  {m.izoh && <div className="form-text">{m.izoh}</div>}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={yopish}>Bekor qilish</button>
              <button type="submit" className="btn btn-primary" disabled={saqlanmoqda}>
                {saqlanmoqda && <span className="spinner-border spinner-border-sm me-2" />}
                Saqlash
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
