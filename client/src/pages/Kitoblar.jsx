import CrudSahifa from '../components/CrudSahifa.jsx';

const ustunlar = [
  { kalit: 'nomi', nom: 'Kitob nomi', render: (r) => <strong>{r.nomi}</strong> },
  { kalit: 'muallif', nom: 'Muallif' },
  {
    kalit: 'kategoriya',
    nom: 'Kategoriya',
    render: (r) => (r.kategoriya ? <span className="yorliq">{r.kategoriya}</span> : <span className="text-secondary">—</span>),
  },
  { kalit: 'nashr_yili', nom: 'Yili', sinf: 'text-center' },
  {
    kalit: 'mavjud',
    nom: 'Mavjud / Jami',
    sinf: 'text-center',
    render: (r) => (
      <span className={`badge rounded-pill ${r.mavjud > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>
        {r.mavjud} / {r.jami_soni}
      </span>
    ),
  },
];

const maydonlar = [
  { kalit: 'nomi', nom: 'Kitob nomi', majburiy: true, placeholder: "Masalan: O'tkan kunlar" },
  { kalit: 'muallif_id', nom: 'Muallif', turi: 'select', manba: '/mualliflar', variantNom: 'ism', majburiy: true },
  { kalit: 'kategoriya_id', nom: 'Kategoriya', turi: 'select', manba: '/kategoriyalar', variantNom: 'nomi' },
  { kalit: 'nashr_yili', nom: 'Nashr yili', turi: 'number', min: 1000, max: 2100 },
  { kalit: 'jami_soni', nom: 'Nusxalar soni', turi: 'number', min: 0, max: 1000, majburiy: true, standart: 1 },
];

export default function Kitoblar() {
  return (
    <CrudSahifa
      ikon="book"
      sarlavha="Kitoblar"
      tavsif="Kutubxona fondidagi kitoblar va ularning mavjud nusxalari"
      url="/kitoblar"
      birlik="Kitob"
      ustunlar={ustunlar}
      maydonlar={maydonlar}
    />
  );
}
