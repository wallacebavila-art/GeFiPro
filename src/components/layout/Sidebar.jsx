import { MESES } from "../../constants.js";
import CartoesIcon from "../icons/CartoesIcon.jsx";
import ConfiguracaoIcon from "../icons/ConfiguracaoIcon.jsx";
import DashboardIcon from "../icons/DashboardIcon.jsx";
import DebitosIcon from "../icons/DebitosIcon.jsx";
import InvestimentosIcon from "../icons/InvestimentosIcon.jsx";

export default function Sidebar({ curPage, curMonth, curYear, onNavigate, collapsed, onToggleCollapse }) {
  const navItems = [
    { section: 'Análise', items: [
      { page: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    ]},
    { section: 'Principal', items: [
      { page: 'cartoes', label: 'Cartões', icon: CartoesIcon },
      { page: 'debitos', label: 'Débitos Fixos', icon: DebitosIcon },
      { page: 'investimentos', label: 'Investimentos', icon: InvestimentosIcon },
    ]},
    { section: 'Sistema', items: [
      { page: 'config', label: 'Configurações', icon: ConfiguracaoIcon },
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
                style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {!collapsed && item.icon && <item.icon size={16} color="var(--text)" />}
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
