// Ekranning pastki burchagida chiqadigan qisqa xabarlar (toast)
import { createContext, useCallback, useContext, useState } from 'react';

const XabarKontekst = createContext(() => {});

const ikonlar = {
  success: 'check-circle-fill',
  danger: 'exclamation-triangle-fill',
  info: 'info-circle-fill',
};

export function XabarProvider({ children }) {
  const [royxat, setRoyxat] = useState([]);

  const xabar = useCallback((matn, turi = 'success') => {
    const id = Date.now() + Math.random();
    setRoyxat((r) => [...r, { id, matn, turi }]);
    setTimeout(() => setRoyxat((r) => r.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <XabarKontekst.Provider value={xabar}>
      {children}
      <div className="xabarlar" aria-live="polite">
        {royxat.map((x) => (
          <div key={x.id} className={`alert alert-${x.turi} d-flex gap-2 align-items-start shadow mb-2`} role="status">
            <i className={`bi bi-${ikonlar[x.turi] ?? 'info-circle-fill'}`} />
            <span>{x.matn}</span>
          </div>
        ))}
      </div>
    </XabarKontekst.Provider>
  );
}

export const useXabar = () => useContext(XabarKontekst);
