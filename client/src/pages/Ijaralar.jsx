// Kitob berish, qaytarib olish va ijaralar tarixi
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, sana } from '../api.js';
import Modal from '../components/Modal.jsx';
import SahifaSarlavha from '../components/SahifaSarlavha.jsx';
import { useXabar } from '../components/Xabar.jsx';

const filtrlar = [
  { kalit: 'hammasi', nom: 'Hammasi' },
  { kalit: 'faol', nom: 'Faol' },
  { kalit: 'muddati_otgan', nom: "Muddati o'tgan" },
  { kalit: 'qaytarilgan', nom: 'Qaytarilgan' },
];

const holatlar = {
  faol: { sinf: 'text-bg-primary', nom: 'Faol' },
  muddati_otgan: { sinf: 'text-bg-danger', nom: "Muddati o'tgan" },
  qaytarilgan: { sinf: 'text-bg-light border', nom: 'Qaytarilgan' },
};

function kunQoshish(kun) {
  const d = new Date();
  d.setDate(d.getDate() + Number(kun || 0));
  return d.toLocaleDateString('ru-RU');
}

export default function Ijaralar() {
  const [ijaralar, setIjaralar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [filtr, setFiltr] = useState('hammasi');
  const [qidiruv, setQidiruv] = useState('');
  const [forma, setForma] = useState(null);
  const [kitoblar, setKitoblar] = useState([]);
  const [oquvchilar, setOquvchilar] = useState([]);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const xabar = useXabar();

  const yuklash = useCallback(async () => {
    try {
      setIjaralar(await api.olish('/ijaralar'));
    } catch (e) {
      xabar(e.message, 'danger');
    } finally {
      setYuklanmoqda(false);
    }
  }, [xabar]);

  useEffect(() => {
    yuklash();
  }, [yuklash]);

  const sanoq = useMemo(() => {
    const s = { hammasi: ijaralar.length, faol: 0, muddati_otgan: 0, qaytarilgan: 0 };
    ijaralar.forEach((i) => s[i.holat]++);
    return s;
  }, [ijaralar]);

  const korinadi = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    return ijaralar.filter(
      (i) =>
        (filtr === 'hammasi' || i.holat === filtr) &&
        (!q || [i.kitob, i.oquvchi, i.guruh, i.muallif].some((x) => String(x ?? '').toLowerCase().includes(q))),
    );
  }, [ijaralar, filtr, qidiruv]);

  const ochish = async () => {
    try {
      const [k, o] = await Promise.all([api.olish('/kitoblar'), api.olish('/oquvchilar')]);
      setKitoblar(k);
      setOquvchilar(o);
      setForma({ kitob_id: '', oquvchi_id: '', kun: '14' });
    } catch (e) {
      xabar(e.message, 'danger');
    }
  };

  const yopish = useCallback(() => setForma(null), []);

  const berish = async (e) => {
    e.preventDefault();
    setSaqlanmoqda(true);
    try {
      await api.qoshish('/ijaralar', forma);
      xabar('Kitob muvaffaqiyatli berildi');
      setForma(null);
      yuklash();
    } catch (err) {
      xabar(err.message, 'danger');
    } finally {
      setSaqlanmoqda(false);
    }
  };

  const qaytarish = async (ijara) => {
    try {
      await api.yangilash(`/ijaralar/${ijara.id}/qaytarish`);
      xabar(`"${ijara.kitob}" qaytarib olindi`);
      yuklash();
    } catch (err) {
      xabar(err.message, 'danger');
    }
  };

  const ochir = async (ijara) => {
    if (!window.confirm(`"${ijara.kitob}" — ${ijara.oquvchi} yozuvi o'chirilsinmi?`)) return;
    try {
      await api.ochirish(`/ijaralar/${ijara.id}`);
      xabar("Yozuv o'chirildi");
      yuklash();
    } catch (err) {
      xabar(err.message, 'danger');
    }
  };

  const tanlanganOquvchi = oquvchilar.find((o) => String(o.id) === forma?.oquvchi_id);

  return (
    <section>
      <SahifaSarlavha ikon="arrow-left-right" sarlavha="Ijaralar" tavsif="Kitob berish, qaytarib olish va to'liq tarix">
        <button className="btn btn-primary" onClick={ochish}>
          <i className="bi bi-box-arrow-up-right me-1" /> Kitob berish
        </button>
      </SahifaSarlavha>

      <div className="karta">
        <div className="karta-bosh">
          <nav className="filtrlar" aria-label="Holat bo'yicha filtr">
            {filtrlar.map((f) => (
              <button
                key={f.kalit}
                className={`filtr ${filtr === f.kalit ? 'faol' : ''}`}
                onClick={() => setFiltr(f.kalit)}
                aria-pressed={filtr === f.kalit}
              >
                {f.nom} <span className="filtr-son">{sanoq[f.kalit]}</span>
              </button>
            ))}
          </nav>
          <div className="qidiruv">
            <i className="bi bi-search" />
            <input
              type="search"
              className="form-control"
              placeholder="Kitob yoki o'quvchi..."
              aria-label="Qidirish"
              value={qidiruv}
              onChange={(e) => setQidiruv(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Kitob</th>
                <th>O'quvchi</th>
                <th>Berilgan</th>
                <th>Muddat</th>
                <th>Qaytarilgan</th>
                <th className="text-center">Holat</th>
                <th className="text-end">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {yuklanmoqda && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" aria-label="Yuklanmoqda" />
                  </td>
                </tr>
              )}
              {!yuklanmoqda && korinadi.length === 0 && (
                <tr>
                  <td colSpan={7} className="bosh-holat">
                    <i className="bi bi-inbox" /> Bu bo'limda yozuvlar yo'q
                  </td>
                </tr>
              )}
              {korinadi.map((i) => (
                <tr key={i.id} className={i.holat === 'muddati_otgan' ? 'qator-kechikkan' : ''}>
                  <td>
                    <strong className="d-block">{i.kitob}</strong>
                    <small className="text-secondary">{i.muallif}</small>
                  </td>
                  <td>
                    <span className="d-block">{i.oquvchi}</span>
                    <small className="text-secondary">{i.guruh}</small>
                  </td>
                  <td className="text-nowrap">{sana(i.berilgan_sana)}</td>
                  <td className="text-nowrap">
                    {sana(i.muddat)}
                    {i.holat === 'muddati_otgan' && (
                      <small className="d-block text-danger fw-semibold">{i.kechikish_kun} kun kechikdi</small>
                    )}
                  </td>
                  <td className="text-nowrap">{sana(i.qaytarilgan_sana)}</td>
                  <td className="text-center">
                    <span className={`badge rounded-pill ${holatlar[i.holat].sinf}`}>{holatlar[i.holat].nom}</span>
                  </td>
                  <td className="text-end text-nowrap">
                    {i.holat !== 'qaytarilgan' && (
                      <button className="btn btn-sm btn-success me-1" onClick={() => qaytarish(i)}>
                        <i className="bi bi-box-arrow-in-down-left me-1" />
                        Qaytarish
                      </button>
                    )}
                    <button className="btn btn-sm btn-light text-danger" onClick={() => ochir(i)} title="O'chirish" aria-label="O'chirish">
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
        <Modal sarlavha="Kitob berish" yopish={yopish}>
          <form onSubmit={berish}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="i-oquvchi" className="form-label">O'quvchi <span className="text-danger">*</span></label>
                <select
                  id="i-oquvchi"
                  className="form-select"
                  required
                  value={forma.oquvchi_id}
                  onChange={(e) => setForma({ ...forma, oquvchi_id: e.target.value })}
                >
                  <option value="">— tanlang —</option>
                  {oquvchilar.map((o) => (
                    <option key={o.id} value={String(o.id)} disabled={o.qolida >= 3}>
                      {o.ism} {o.guruh ? `(${o.guruh})` : ''} — qo'lida {o.qolida} ta
                    </option>
                  ))}
                </select>
                {tanlanganOquvchi && tanlanganOquvchi.qolida > 0 && (
                  <div className="form-text">Bu o'quvchida hozir {tanlanganOquvchi.qolida} ta kitob bor (limit: 3).</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="i-kitob" className="form-label">Kitob <span className="text-danger">*</span></label>
                <select
                  id="i-kitob"
                  className="form-select"
                  required
                  value={forma.kitob_id}
                  onChange={(e) => setForma({ ...forma, kitob_id: e.target.value })}
                >
                  <option value="">— tanlang —</option>
                  {kitoblar.map((k) => (
                    <option key={k.id} value={String(k.id)} disabled={k.mavjud <= 0}>
                      {k.nomi} — {k.muallif} ({k.mavjud > 0 ? `${k.mavjud} ta bor` : 'qolmagan'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-1">
                <label htmlFor="i-kun" className="form-label">Muddat (kun) <span className="text-danger">*</span></label>
                <input
                  id="i-kun"
                  type="number"
                  className="form-control"
                  min={1}
                  max={60}
                  required
                  value={forma.kun}
                  onChange={(e) => setForma({ ...forma, kun: e.target.value })}
                />
                <div className="form-text">Qaytarish sanasi: <strong>{kunQoshish(forma.kun)}</strong></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={yopish}>Bekor qilish</button>
              <button type="submit" className="btn btn-primary" disabled={saqlanmoqda}>
                {saqlanmoqda && <span className="spinner-border spinner-border-sm me-2" />}
                Berish
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
