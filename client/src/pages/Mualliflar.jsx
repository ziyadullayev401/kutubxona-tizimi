import CrudSahifa from '../components/CrudSahifa.jsx';

const ustunlar = [
  { kalit: 'ism', nom: 'Ism', render: (r) => <strong>{r.ism}</strong> },
  { kalit: 'mamlakat', nom: 'Mamlakat' },
  { kalit: 'tugilgan_yil', nom: "Tug'ilgan yil", sinf: 'text-center' },
  {
    kalit: 'kitoblar_soni',
    nom: 'Kitoblari',
    sinf: 'text-center',
    render: (r) => <span className="badge rounded-pill text-bg-light border">{r.kitoblar_soni}</span>,
  },
];

const maydonlar = [
  { kalit: 'ism', nom: 'Ism, familiya', majburiy: true },
  { kalit: 'mamlakat', nom: 'Mamlakat' },
  { kalit: 'tugilgan_yil', nom: "Tug'ilgan yil", turi: 'number', min: 1000, max: 2100 },
];

export default function Mualliflar() {
  return (
    <CrudSahifa
      ikon="person-badge"
      sarlavha="Mualliflar"
      tavsif="Kitoblar mualliflari. Kitobi bor muallifni o'chirib bo'lmaydi (FOREIGN KEY)"
      url="/mualliflar"
      birlik="Muallif"
      ustunlar={ustunlar}
      maydonlar={maydonlar}
    />
  );
}
