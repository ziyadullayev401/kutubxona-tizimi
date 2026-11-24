import { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

import Bosh from './pages/Bosh.jsx';
import Ijaralar from './pages/Ijaralar.jsx';
import Kitoblar from './pages/Kitoblar.jsx';
import Mualliflar from './pages/Mualliflar.jsx';
import Kategoriyalar from './pages/Kategoriyalar.jsx';
import Oquvchilar from './pages/Oquvchilar.jsx';
import Sxema from './pages/Sxema.jsx';
import SqlKonsol from './pages/SqlKonsol.jsx';

const menyu = [
  { bolim: 'Asosiy' },
  { yol: '/', nom: 'Bosh sahifa', ikon: 'speedometer2' },
  { yol: '/ijaralar', nom: 'Ijaralar', ikon: 'arrow-left-right' },
  { bolim: 'Katalog' },
  { yol: '/kitoblar', nom: 'Kitoblar', ikon: 'book' },
  { yol: '/mualliflar', nom: 'Mualliflar', ikon: 'person-badge' },
  { yol: '/kategoriyalar', nom: 'Kategoriyalar', ikon: 'tags' },
  { yol: '/oquvchilar', nom: "O'quvchilar", ikon: 'people' },
  { bolim: "Ma'lumotlar bazasi" },
  { yol: '/sxema', nom: 'Baza sxemasi', ikon: 'diagram-3' },
  { yol: '/sql', nom: 'SQL konsol', ikon: 'terminal' },
];

export default function App() {
  const [ochiq, setOchiq] = useState(false);

  return (
    <div className="ilova">
      <aside className={`yon-panel ${ochiq ? 'ochiq' : ''}`} aria-label="Asosiy menyu">
        <div className="logo">
          <i className="bi bi-book-half" />
          <div>
            <span>Kutubxona</span>
            <small>boshqaruv tizimi</small>
          </div>
        </div>
        <nav>
          {menyu.map((m) =>
            m.bolim ? (
              <div key={m.bolim} className="menyu-bolim">{m.bolim}</div>
            ) : (
              <NavLink
                key={m.yol}
                to={m.yol}
                end={m.yol === '/'}
                className="menyu-link"
                onClick={() => setOchiq(false)}
              >
                <i className={`bi bi-${m.ikon}`} />
                {m.nom}
              </NavLink>
            ),
          )}
        </nav>
        <footer className="yon-footer">
          <i className="bi bi-database me-1" /> SQLite · React · Express
          <br />
          Veb tizimlari — laboratoriya ishi
        </footer>
      </aside>

      {ochiq && <div className="parda" onClick={() => setOchiq(false)} />}

      <div className="asosiy">
        <header className="yuqori-panel">
          <button className="btn btn-link text-body p-1" onClick={() => setOchiq(true)} aria-label="Menyuni ochish">
            <i className="bi bi-list fs-3" />
          </button>
          <strong>Kutubxona</strong>
        </header>

        <main className="kontent">
          <Routes>
            <Route path="/" element={<Bosh />} />
            <Route path="/ijaralar" element={<Ijaralar />} />
            <Route path="/kitoblar" element={<Kitoblar />} />
            <Route path="/mualliflar" element={<Mualliflar />} />
            <Route path="/kategoriyalar" element={<Kategoriyalar />} />
            <Route path="/oquvchilar" element={<Oquvchilar />} />
            <Route path="/sxema" element={<Sxema />} />
            <Route path="/sql" element={<SqlKonsol />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
