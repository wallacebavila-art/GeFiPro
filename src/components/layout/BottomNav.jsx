const navItems = [
  { page: 'dashboard', label: 'Dash' },
  { page: 'cartoes', label: 'Cartoes' },
  { page: 'debitos', label: 'Fixos' },
  { page: 'config', label: 'Config' },
];

export default function BottomNav({ curPage, onNavigate, onFabClick }) {
  return (
    <>
      <nav id="bottom-nav">
        <div className="bn-items">
          {navItems.map(item => (
            <button
              key={item.page}
              className={`bn-item ${curPage === item.page ? 'active' : ''}`}
              data-page={item.page}
              onClick={() => onNavigate(item.page)}
              style={{ fontSize: '0.7rem' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <button id="fab" onClick={onFabClick}>+</button>
    </>
  );
}
