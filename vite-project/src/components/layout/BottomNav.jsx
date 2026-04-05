const navItems = [
  { page: 'cartoes', icon: '💳', label: 'Cartões' },
  { page: 'debitos', icon: '📋', label: 'Fixos' },
  { page: 'dashboard', icon: '📊', label: 'Dashboard' },
  { page: 'config', icon: '⚙️', label: 'Config' },
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
            >
              <span className="bn-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <button id="fab" onClick={onFabClick}>+</button>
    </>
  );
}
