export default function SahifaSarlavha({ ikon, sarlavha, tavsif, children }) {
  return (
    <header className="sahifa-sarlavha">
      <div className="d-flex align-items-center gap-3">
        <div className="sarlavha-ikon">
          <i className={`bi bi-${ikon}`} />
        </div>
        <div>
          <h1>{sarlavha}</h1>
          {tavsif && <p>{tavsif}</p>}
        </div>
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
