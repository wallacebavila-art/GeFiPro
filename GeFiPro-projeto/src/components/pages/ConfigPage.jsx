import { useState, useEffect } from 'react';
import { getAllCats, getCatColor } from "../../utils/helpers.js";
import { CAT_COLORS_DEFAULT, FONT_SIZES, LAYOUT_SCALES } from "../../constants.js";
import Button from "../ui/Button.jsx";
import Tag from "../ui/Tag.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { FormGroup, FormRow, Input, Select } from "../ui/Form.jsx";

// Paleta de cores predefinidas para categorias
const COLOR_PRESETS = [
  '#00d4aa', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#10b981', '#6366f1', '#f97316', '#14b8a6',
  '#a855f7', '#84cc16', '#06b6d4', '#f43f5e', '#64748b'
];

export default function ConfigPage({
  renda,
  limiteParcPct,
  temaEscuro,
  fontSize,
  layoutScale,
  catExtra,
  fbStats,
  gastos,
  debitos,
  curYear,
  curMonth,
  onSaveConfig,
  onToggleTheme,
  onChangeFontSize,
  onChangeLayoutScale,
  onAddCategoria,
  onRemoveCategoria,
  onForceSync,
}) {
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatCor, setNovaCatCor] = useState('#00d4aa');
  const [editandoCat, setEditandoCat] = useState(null); // { index, nome, cor }
  const [buscaCat, setBuscaCat] = useState('');
  const [showPerfilSection, setShowPerfilSection] = useState(false); // Collapsible Perfil Financeiro
  const [showAparSection, setShowAparSection] = useState(false); // Collapsible Aparência
  const [showCatSection, setShowCatSection] = useState(false); // Collapsible entire categories section
  const [showAddCat, setShowAddCat] = useState(false); // Collapsible add category section
  const [rendaInput, setRendaInput] = useState(renda ? String(renda) : '');
  const [limiteInput, setLimiteInput] = useState(Math.round((limiteParcPct || 0.30) * 100));
  const [selectedTheme, setSelectedTheme] = useState(() => {
    // Recuperar tema do localStorage ou usar o que já está no DOM, ou 'ocean' como padrão
    const savedTheme = localStorage.getItem('color-theme');
    const domTheme = document.documentElement.getAttribute('data-color-theme');
    return savedTheme || domTheme || 'ocean';
  }); // Tema de cores selecionado

  // Função para aplicar o tema de cor
  const applyTheme = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-color-theme', theme);
    localStorage.setItem('color-theme', theme);
  };

  // Aplicar tema de cor ao carregar a página
  useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-color-theme', savedTheme);
    }
  }, []);

  // Sync rendaInput when renda prop changes
  useEffect(() => {
    setRendaInput(renda ? String(renda) : '');
  }, [renda]);

  // Sync limiteInput when limiteParcPct prop changes
  useEffect(() => {
    setLimiteInput(Math.round((limiteParcPct || 0.30) * 100));
  }, [limiteParcPct]);

  const handleRendaChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRendaInput(value);
    }
  };

  const handleLimiteChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
        setLimiteInput(numValue);
        onSaveConfig('limiteParcPct', numValue / 100);
      } else if (value === '') {
        setLimiteInput('');
      }
    }
  };

  const handleRendaBlur = () => {
    const numValue = parseFloat(rendaInput) || 0;
    onSaveConfig('renda', numValue);
    setRendaInput(String(numValue));
  };

  const allCats = getAllCats(catExtra);
  const systemCats = Object.keys(CAT_COLORS_DEFAULT);

  const handleAddCat = () => {
    const nomeTrim = novaCatNome.trim();
    if (!nomeTrim) return;
    // Verificação case-insensitive
    if (allCats.some(cat => cat.toLowerCase() === nomeTrim.toLowerCase())) return;
    onAddCategoria(nomeTrim, novaCatCor);
    setNovaCatNome('');
    setNovaCatCor('#00d4aa');
  };

  const handleEditCat = (index, cat) => {
    setEditandoCat({ index, nome: cat.nome, cor: cat.cor });
  };

  const handleSaveEditCat = () => {
    if (!editandoCat || !editandoCat.nome.trim()) return;
    // Remove a antiga e adiciona a nova (para simplificar)
    onRemoveCategoria(editandoCat.index);
    onAddCategoria(editandoCat.nome.trim(), editandoCat.cor);
    setEditandoCat(null);
  };

  const handleCancelEditCat = () => {
    setEditandoCat(null);
  };

  // Filtrar categorias
  const filteredSystemCats = systemCats.filter(cat => 
    cat.toLowerCase().includes(buscaCat.toLowerCase())
  );
  const filteredExtraCats = catExtra.filter((cat, i) => 
    cat.nome.toLowerCase().includes(buscaCat.toLowerCase()) ||
    `cat-extra-${i}`.includes(buscaCat) // fallback
  );

  return (
    <div id="page-config" className="page">
      <SectionHeader title="⚙️" highlight="Configurações" />

      {/* Perfil financeiro */}
      <div className="config-section">
        <div 
          className="config-section-title" 
          onClick={() => setShowPerfilSection(!showPerfilSection)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>💰 Perfil Financeiro</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--mid)' }}>
            Expandir/Recolher
            <span style={{ 
              transform: showPerfilSection ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              fontSize: '1.2rem'
            }}>▼</span>
          </span>
        </div>
        
        {showPerfilSection && (
          <>
            <div className="config-row">
              <div>
                <div className="config-row-label">Renda Mensal</div>
                <div className="config-row-sub">Base de cálculo dos percentuais</div>
              </div>
              <div className="config-row-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem', color: 'var(--accent)' }}>💵</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={rendaInput}
                  onChange={handleRendaChange}
                  onBlur={handleRendaBlur}
                  style={{ 
                    width: 140, 
                    fontFamily: 'var(--mono)', 
                    fontSize: '.9rem',
                    fontWeight: 600,
                    padding: '10px 12px',
                    borderRadius: 'var(--r2)',
                    border: '2px solid var(--border)',
                    background: 'var(--s2)',
                    color: 'var(--text)',
                    textAlign: 'right'
                  }}
                />
              </div>
            </div>
            <div className="config-row">
              <div>
                <div className="config-row-label">Limite de Alerta de Parcelas</div>
                <div className="config-row-sub">% da renda (padrão 30%)</div>
              </div>
              <div className="config-row-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem', color: 'var(--accent)' }}>⚠️</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  placeholder="30"
                  value={limiteInput}
                  onChange={handleLimiteChange}
                  style={{ 
                    width: 80, 
                    fontSize: '.9rem',
                    fontWeight: 600,
                    padding: '10px 12px',
                    borderRadius: 'var(--r2)',
                    border: '2px solid var(--border)',
                    background: 'var(--s2)',
                    color: 'var(--text)',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent)' }}>%</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Aparência / Tema */}
      <div className="config-section">
        <div 
          className="config-section-title" 
          onClick={() => setShowAparSection(!showAparSection)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>🎨 Aparência</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--mid)' }}>
            Expandir/Recolher
            <span style={{ 
              transform: showAparSection ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              fontSize: '1.2rem'
            }}>▼</span>
          </span>
        </div>
        
        {showAparSection && (
          <>
            {/* Tema de Cores */}
            <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
                🎨 Tema de Cores
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Teal */}
                <button
                  onClick={() => applyTheme('teal')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedTheme === 'teal' ? '2px solid var(--accent)' : '2px solid var(--border)',
                    background: selectedTheme === 'teal' ? 'var(--s2)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '70px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#14b8a6' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Teal</span>
                  {selectedTheme === 'teal' && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</div>
                  )}
                </button>

                {/* Ocean */}
                <button
                  onClick={() => applyTheme('ocean')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedTheme === 'ocean' ? '2px solid var(--accent)' : '2px solid var(--border)',
                    background: selectedTheme === 'ocean' ? 'var(--s2)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '70px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0ea5e9' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#06b6d4' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Ocean</span>
                  {selectedTheme === 'ocean' && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>✓</div>
                  )}
                </button>

                {/* Sunset */}
                <button
                  onClick={() => applyTheme('sunset')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedTheme === 'sunset' ? '2px solid #f59e0b' : '2px solid var(--border)',
                    background: selectedTheme === 'sunset' ? 'rgba(245, 158, 11, 0.1)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '70px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f97316' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Sunset</span>
                  {selectedTheme === 'sunset' && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>✓</div>
                  )}
                </button>

                {/* Rose */}
                <button
                  onClick={() => applyTheme('rose')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedTheme === 'rose' ? '2px solid #ec4899' : '2px solid var(--border)',
                    background: selectedTheme === 'rose' ? 'rgba(236, 72, 153, 0.1)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '70px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f43f5e' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ec4899' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Rose</span>
                  {selectedTheme === 'rose' && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>✓</div>
                  )}
                </button>

                {/* Emerald */}
                <button
                  onClick={() => applyTheme('emerald')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: selectedTheme === 'emerald' ? '2px solid #10b981' : '2px solid var(--border)',
                    background: selectedTheme === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '70px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981' }}></div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#84cc16' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Emerald</span>
                  {selectedTheme === 'emerald' && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>✓</div>
                  )}
                </button>
              </div>
            </div>

            {/* Modo Escuro/Claro */}
            <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
                🌓 Modo
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => temaEscuro && onToggleTheme()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: !temaEscuro ? '2px solid var(--accent)' : '2px solid var(--border)',
                    background: !temaEscuro ? 'var(--s2)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>☀️</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: !temaEscuro ? 600 : 400 }}>Claro</span>
                </button>
                <button
                  onClick={() => !temaEscuro && onToggleTheme()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: temaEscuro ? '2px solid var(--accent)' : '2px solid var(--border)',
                    background: temaEscuro ? 'var(--s2)' : 'var(--s1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🌙</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: temaEscuro ? 600 : 400 }}>Escuro</span>
                </button>
              </div>
            </div>

            <div className="config-row">
              <div>
                <div className="config-row-label">Tema Escuro (Legacy)</div>
                <div className="config-row-sub">Alternar entre escuro e claro</div>
              </div>
              <div className="config-row-right">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={temaEscuro} 
                    onChange={onToggleTheme}
                  />
                  <span className="toggle-track"></span>
                  <span className="toggle-thumb"></span>
                </label>
              </div>
            </div>
            <div className="config-row">
              <div>
                <div className="config-row-label">Tamanho da Fonte</div>
                <div className="config-row-sub">Ajustar para melhor legibilidade</div>
              </div>
              <div className="config-row-right">
                <div style={{ position: 'relative' }}>
                  <Select 
                    value={fontSize} 
                    onChange={(e) => onChangeFontSize(e.target.value)}
                    style={{
                      padding: '12px 40px 12px 16px',
                      fontSize: '.9rem',
                      borderRadius: 'var(--r2)',
                      border: '2px solid var(--border)',
                      background: '#0d1117',
                      color: 'var(--text)',
                      minWidth: 160,
                      cursor: 'pointer',
                      fontWeight: 600,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    {Object.entries(FONT_SIZES).map(([key, size]) => (
                      <option key={key} value={key}>{size.label}</option>
                    ))}
                  </Select>
                  <span style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.7rem',
                    color: '#fff',
                    pointerEvents: 'none'
                  }}>▼</span>
                </div>
              </div>
            </div>
            <div className="config-row">
              <div>
                <div className="config-row-label">Escala do Layout</div>
                <div className="config-row-sub">Aumentar ou diminuir elementos</div>
              </div>
              <div className="config-row-right">
                <div style={{ position: 'relative' }}>
                  <Select 
                    value={layoutScale} 
                    onChange={(e) => onChangeLayoutScale(e.target.value)}
                    style={{
                      padding: '12px 40px 12px 16px',
                      fontSize: '.9rem',
                      borderRadius: 'var(--r2)',
                      border: '2px solid var(--border)',
                      background: '#0d1117',
                      color: 'var(--text)',
                      minWidth: 160,
                      cursor: 'pointer',
                      fontWeight: 600,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    {Object.entries(LAYOUT_SCALES).map(([key, scale]) => (
                      <option key={key} value={key}>{scale.label}</option>
                    ))}
                  </Select>
                  <span style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.7rem',
                    color: '#fff',
                    pointerEvents: 'none'
                  }}>▼</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Categorias personalizadas */}
      <div className="config-section">
        <div 
          className="config-section-title" 
          onClick={() => setShowCatSection(!showCatSection)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>🏷️ Categorias de Gastos</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--mid)' }}>
            Expandir/Recolher
            <span style={{ 
              transform: showCatSection ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              fontSize: '1.2rem'
            }}>▼</span>
          </span>
        </div>
        
        {showCatSection && (
          <>
            {/* Barra de busca */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <Input
                type="text"
                placeholder="🔍 Buscar categoria..."
                value={buscaCat}
                onChange={(e) => setBuscaCat(e.target.value)}
                style={{ width: '100%', fontSize: '.82rem' }}
              />
            </div>

            {/* Categorias do Sistema */}
            <div style={{ padding: '10px 14px', background: 'var(--s1)' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--mid)', marginBottom: 8, fontWeight: 500 }}>
                📦 CATEGORIAS DO SISTEMA
              </div>
              <div className="cat-list" id="cat-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {filteredSystemCats.map(cat => (
                  <div key={cat} className="cat-chip" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    padding: '4px 10px',
                    background: 'var(--s2)',
                    borderRadius: 'var(--r)',
                    fontSize: '.78rem',
                    border: '1px solid var(--border)',
                    opacity: 0.85
                  }}>
                    <div className="cat-color-dot" style={{ 
                      background: getCatColor(cat, catExtra),
                      width: 10,
                      height: 10,
                      borderRadius: '50%'
                    }}></div>
                    <span>{cat}</span>
                    <span style={{ fontSize: '.65rem', color: 'var(--dim)', marginLeft: 2 }}>🔒</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorias Personalizadas */}
            <div style={{ padding: '10px 14px' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--mid)', marginBottom: 8, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>✏️ CATEGORIAS PERSONALIZADAS</span>
                <span style={{ fontSize: '.65rem' }}>{catExtra.length} criadas</span>
              </div>
              
              {catExtra.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: 'var(--dim)', 
                  fontSize: '.78rem',
                  background: 'var(--s1)',
                  borderRadius: 'var(--r)',
                  border: '1px dashed var(--border)'
                }}>
                  Nenhuma categoria personalizada criada.<br/>
                  Use o formulário abaixo para adicionar.
                </div>
              ) : (
                <div className="cat-list" id="cat-list-custom" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {catExtra.map((cat, i) => (
                    <div key={cat.nome} className="cat-item-custom" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      background: editandoCat?.index === i ? 'var(--s2)' : 'var(--s1)',
                      borderRadius: 'var(--r)',
                      border: editandoCat?.index === i ? '1px solid var(--accent)' : '1px solid var(--border)',
                    }}>
                      <div className="cat-color-dot" style={{ 
                        background: cat.cor || '#94a3b8',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        flexShrink: 0
                      }}></div>
                      
                      {editandoCat?.index === i ? (
                        // Modo edição
                        <>
                          <Input
                            type="text"
                            value={editandoCat.nome}
                            onChange={(e) => setEditandoCat({ ...editandoCat, nome: e.target.value })}
                            style={{ flex: 1, fontSize: '.78rem', padding: '4px 8px' }}
                            autoFocus
                          />
                          <input
                            type="color"
                            value={editandoCat.cor}
                            onChange={(e) => setEditandoCat({ ...editandoCat, cor: e.target.value })}
                            style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 2, cursor: 'pointer' }}
                          />
                          <button className="btn-icon" onClick={handleSaveEditCat} title="Salvar">✓</button>
                          <button className="btn-icon" onClick={handleCancelEditCat} title="Cancelar">✕</button>
                        </>
                      ) : (
                        // Modo visualização
                        <>
                          <span className="cat-item-name" style={{ flex: 1, fontSize: '.82rem' }}>{cat.nome}</span>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEditCat(i, cat)} 
                            title="Editar"
                            style={{ fontSize: '.7rem' }}
                          >✎</button>
                          <button 
                            className="btn-icon del btn-xs" 
                            onClick={() => onRemoveCategoria(i)} 
                            title="Remover"
                            style={{ fontSize: '.7rem' }}
                          >🗑</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botão para expandir/colapsar adicionar categoria */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--s1)' }}>
              <button
                onClick={() => setShowAddCat(!showAddCat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  cursor: 'pointer',
                  fontSize: '.85rem',
                  color: 'var(--text)',
                  fontWeight: 500,
                }}
              >
                <span>➕ Adicionar Nova Categoria</span>
                <span style={{ 
                  transform: showAddCat ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>▼</span>
              </button>
            </div>

            {/* Adicionar nova categoria - Collapsible */}
            {showAddCat && (
              <div style={{ padding: '14px', borderTop: '1px solid var(--border)', background: 'var(--s1)' }}>
                <FormRow>
                  <FormGroup label="Nome da categoria" style={{ flex: 1 }}>
                    <Input
                      type="text"
                      placeholder="Ex: Viagem, Investimentos..."
                      value={novaCatNome}
                      onChange={(e) => setNovaCatNome(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '.82rem' }}
                    />
                  </FormGroup>
                </FormRow>
                
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginBottom: 6 }}>Escolha uma cor:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {COLOR_PRESETS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNovaCatCor(color)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: color,
                          border: novaCatCor === color ? '2px solid white' : '2px solid transparent',
                          boxShadow: novaCatCor === color ? '0 0 0 2px var(--accent)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title={color}
                      />
                    ))}
                    <input
                      type="color"
                      value={novaCatCor}
                      onChange={(e) => setNovaCatCor(e.target.value)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        border: '1px solid var(--border)', 
                        borderRadius: '50%', 
                        padding: 2, 
                        cursor: 'pointer',
                        marginLeft: 4
                      }}
                      title="Cor personalizada"
                    />
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={handleAddCat} 
                  disabled={!novaCatNome.trim() || allCats.some(cat => cat.toLowerCase() === novaCatNome.trim().toLowerCase())}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {allCats.some(cat => cat.toLowerCase() === novaCatNome.trim().toLowerCase()) ? 'Categoria já existe' : '+ Adicionar Categoria'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Firebase */}
      <div className="config-section">
        <div className="config-section-title">🔥 Firebase & Sincronização</div>
        <div className="stat-row">
          <span className="stat-label">Status da conexão</span>
          <span className="stat-val ok">🟢 Conectado</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Última sincronização</span>
          <span className="stat-val">{fbStats.lastSync ? fbStats.lastSync.toLocaleTimeString('pt-BR') : '—'}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Leituras (sessão)</span>
          <span className="stat-val ok">{fbStats.reads}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Escritas (sessão)</span>
          <span className="stat-val ok">{fbStats.writes}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Registros no banco</span>
          <span className="stat-val">{gastos.length + debitos.length}</span>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <Button variant="secondary" size="sm" onClick={onForceSync}>🔄 Forçar sincronização</Button>
        </div>
      </div>

      {/* Sobre */}
      <div className="config-section">
        <div className="config-section-title">ℹ️ Sobre</div>
        <div className="stat-row">
          <span className="stat-label">Versão</span>
          <span className="stat-val">2.1.0</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Firebase Project</span>
          <span className="stat-val" style={{ fontSize: '.7rem' }}>financeiro-pessoal-4a6f9</span>
        </div>
      </div>
    </div>
  );
}
