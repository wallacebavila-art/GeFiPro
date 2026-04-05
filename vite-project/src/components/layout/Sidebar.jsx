import { MESES } from "../../constants.js";

export default function Sidebar({ curPage, curMonth, curYear, onNavigate, collapsed, onToggleCollapse }) {
  const navItems = [
    { section: 'Principal', items: [
      { page: 'cartoes', icon: '💳', label: 'Cartões' },
      { page: 'debitos', icon: '📋', label: 'Débitos Fixos' },
    ]},
    { section: 'Análise', items: [
      { page: 'dashboard', icon: '📊', label: 'Dashboard' },
    ]},
    { section: 'Sistema', items: [
      { page: 'config', icon: '⚙️', label: 'Configurações' },
    ]},
  ];

  return (
    <nav id="sidebar" className={collapsed ? 'collapsed' : ''}>
      {!collapsed && (
        <div className="sb-logo">
          <img src="/logo.png" alt="GeFiPro" style={{ maxWidth: '80px', height: 'auto', marginBottom: '8px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
          <p id="sb-month-label">{MESES[curMonth - 1]} {curYear}</p>
        </div>
      )}
      <div className="sb-nav">
        {navItems.map((section, idx) => (
          <div key={idx}>
            {!collapsed && <div className="sb-section">{section.section}</div>}
            {section.items.map(item => (
              <button
                key={item.page}
                className={`sb-item ${curPage === item.page ? 'active' : ''}`}
                data-page={item.page}
                onClick={() => onNavigate(item.page)}
                title={item.label}
              >
                <span className="sb-icon">{item.icon}</span>
                {!collapsed && item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-toggle-wrap">
        <button 
          className="sb-toggle" 
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </nav>
  );
}
