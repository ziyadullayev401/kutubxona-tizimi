import CrudSahifa from '../components/CrudSahifa.jsx';
import { sana } from '../api.js';

const ustunlar = [
  { kalit: 'ism', nom: 'F.I.Sh.', render: (r) => <strong>{r.ism}</strong> },
  { kalit: 'guruh', nom: 'Guruh', render: (r) => (r.guruh ? <span className="yorliq">{r.guruh}</span> : '—') },
  { kalit: 'telefon', nom: 'Telefon', render: (r) => (r.telefon ? <a href={`tel:${r.telefon}`}>{r.telefon}</a> : '—') },
  { kalit: 'royxatdan_sana', nom: "Ro'yxatdan o'tgan", render: (r) => sana(r.royxatdan_sana) },
  {
    kalit: 'qolida',
    nom: "Qo'lida / Jami",
    sinf: 'text-center',
    render: (r) => (
      <span className={`badge rounded-pill ${r.qolida > 0 ? 'text-bg-primary' : 'text-bg-light border'}`}>
        {r.qolida} / {r.jami_olgan}
      </span>
    ),
  },
];

const maydonlar = [
  { kalit: 'ism', nom: 'Familiya, ism', majburiy: true },
  {
    kalit: 'telefon',
    nom: 'Telefon',
    turi: 'tel',
    placeholder: '+998901234567',
    pattern: '\\+998\\d{9}',
    izoh: 'Format: +998 va 9 ta raqam',
  },
  { kalit: 'guruh', nom: 'Guruh', placeholder: 'Masalan: DI-21' },
];

export default function Oquvchilar() {
  return (
    <CrudSahifa
      ikon="people"
      sarlavha="O'quvchilar"
      tavsif="Kutubxona a'zolari. Bir o'quvchi bir vaqtda ko'pi bilan 3 ta kitob oladi"
      url="/oquvchilar"
      birlik="O'quvchi"
      ustunlar={ustunlar}
      maydonlar={maydonlar}
    />
  );
}
