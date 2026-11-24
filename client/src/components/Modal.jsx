import { useEffect } from 'react';

export default function Modal({ sarlavha, yopish, children }) {
  useEffect(() => {
    const tugma = (e) => e.key === 'Escape' && yopish();
    window.addEventListener('keydown', tugma);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tugma);
      document.body.style.overflow = '';
    };
  }, [yopish]);

  return (
    <div
      className="modal d-block modal-fon"
      role="dialog"
      aria-modal="true"
      aria-label={sarlavha}
      onMouseDown={(e) => e.target === e.currentTarget && yopish()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h2 className="modal-title fs-5">{sarlavha}</h2>
            <button type="button" className="btn-close" onClick={yopish} aria-label="Yopish" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
