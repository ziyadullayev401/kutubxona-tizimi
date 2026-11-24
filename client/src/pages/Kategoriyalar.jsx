import CrudSahifa from '../components/CrudSahifa.jsx';

const ustunlar = [
  { kalit: 'nomi', nom: 'Kategoriya', render: (r) => <strong>{r.nomi}</strong> },
  { kalit: 'kitoblar_soni', nom: 'Kitob nomlari', sinf: 'text-center' },
  { kalit: 'nusxalar', nom: 'Jami nusxalar', sinf: 'text-center' },
];

const maydonlar = [{ kalit: 'nomi', nom: 'Kategoriya nomi', majburiy: true }];

export default function Kategoriyalar() {
  return (
    <CrudSahifa
      ikon="tags"
      sarlavha="Kategoriyalar"
      tavsif="Kitob janrlari. Kategoriya o'chirilsa, kitoblari kategoriyasiz qoladi (ON DELETE SET NULL)"
      url="/kategoriyalar"
      birlik="Kategoriya"
      ustunlar={ustunlar}
      maydonlar={maydonlar}
    />
  );
}
