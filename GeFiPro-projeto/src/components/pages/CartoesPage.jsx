import { useState, useMemo } from 'react';
import { CARTOES, CARTOES_DEFAULT } from '../../constants.js';
import { fmtR, getCatColor } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';
import Tag from '../ui/Tag.jsx';
import ExpenseTable from './cartoes/ExpenseTable.jsx';
import ExpenseCards from './cartoes/ExpenseCards.jsx';
import CartoesIcon from '../icons/CartoesIcon.jsx';

// Ordem fixa dos cartões: Itaú LATAM PASS -> Porto Seguro -> Nubank
const ORDEM_FIXA = ['itau', 'porto', 'nubank'];

export default function CartoesPage({
  gastos,
  catExtra,
  cartoesExtra,
  cartoesDefault,
  renda,
  limiteParcPct,
  curCartao,
  setCurCartao,
  curMonth,
  curYear,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  loadGastosPeriodo,
  onOpenCartaoModal,
  onRemoveCartao,
}) {
  console.log('[CartoesPage] Render - gastos:', gastos.length, 'curCartao:', curCartao, 'curMonth:', curMonth, 'curYear:', curYear);
  console.log('[CartoesPage] Gastos recebidos:', gastos.map(g => ({ desc: g.descricao, valor: g.valor, cartao: g.cartao })));
  const [busca, setBusca] = useState('');
  const [filtCat, setFiltCat] = useState('');
  const [filtTipo, setFiltTipo] = useState('');
  const [sortCol, setSortCol] = useState('data');
  const [sortAsc, setSortAsc] = useState(true);
  const [gerenciarCollapsed, setGerenciarCollapsed] = useState(true);

  const allCats = useMemo(() => {
    const cats = new Set(['Alimentação', 'Mercado', 'Saúde', 'Lazer', 'Viagem', 'Pet',
      'Assinaturas', 'Educação', 'Vestuário', 'Casa', 'Carro', 'Pensão', 'Moradia', 'Outros']);
    catExtra.forEach(c => cats.add(c.nome));
    return [...cats];
  }, [catExtra]);

  const todosCartoes = useMemo(() => {
    // IDs dos cartões padrão
    const idsPadrao = new Set(CARTOES_DEFAULT.map(c => c.id));
    
    // Separar cartões extras em: padrão (com propriedades customizadas) e realmente novos
    const extrasPadrao = cartoesExtra.filter(c => idsPadrao.has(c.id));
    const extrasNovos = cartoesExtra.filter(c => !idsPadrao.has(c.id));
    
    // Para cada cartão padrão, usar a versão do CARTOES_DEFAULT mas com propriedades customizadas se existir
    const defaultsComExtras = CARTOES_DEFAULT.map(c => {
      const extra = extrasPadrao.find(e => e.id === c.id);
      return extra ? { ...c, ...extra } : c;
    });
    
    // Montar array na ordem correta: Itau -> Porto -> Nubank -> Novos
    return [...defaultsComExtras, ...extrasNovos];
  }, [cartoesExtra]);

  const items = useMemo(() => {
    if (curCartao === 'todos') return gastos;
    return gastos.filter(g => g.cartao === curCartao);
  }, [gastos, curCartao]);

  const filtrados = useMemo(() => {
    let result = items.filter(g => {
      const matchBusca = !busca || (g.descricao || '').toLowerCase().includes(busca.toLowerCase());
      const matchCat = !filtCat || g.categoria === filtCat;
      const matchTipo = !filtTipo || (g.tipo || 'normal') === filtTipo;
      return matchBusca && matchCat && matchTipo;
    });

    // Cache de nomes de cartões para ordenação mais rápida
    const cartaoNameCache = new Map();
    const getCartaoName = (cartaoId) => {
      if (cartaoNameCache.has(cartaoId)) return cartaoNameCache.get(cartaoId);
      const c = todosCartoes.find(c => c.id === cartaoId);
      const name = c?.name || cartaoId || '';
      cartaoNameCache.set(cartaoId, name);
      return name;
    };

    result = [...result].sort((a, b) => {
      let va = a[sortCol] ?? '';
      let vb = b[sortCol] ?? '';
      if (sortCol === 'valor') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
      if (sortCol === 'cartao') { 
        va = getCartaoName(a.cartao);
        vb = getCartaoName(b.cartao);
      }
      if (sortCol === 'tipo') { va = a.tipo || 'normal'; vb = b.tipo || 'normal'; }
      if (sortCol === 'dia') { va = parseInt(va) || 0; vb = parseInt(vb) || 0; }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, busca, filtCat, filtTipo, sortCol, sortAsc, todosCartoes]);

  const total = items.reduce((s, g) => s + (g.valor || 0), 0);
  const parcelado = items.filter(g => (g.tipo || 'normal') === 'parcelado').reduce((s, g) => s + (g.valor || 0), 0);
  const recorrente = items.filter(g => (g.tipo || 'normal') === 'recorrente').reduce((s, g) => s + (g.valor || 0), 0);
  
  const cartao = curCartao === 'todos' 
    ? { id: 'todos', name: 'Todos', color: '#10b981', icone: '💳' }
    : (todosCartoes.find(c => c.id === curCartao) || todosCartoes[0] || CARTOES_DEFAULT[0]);
  const cor = cartao?.color || '#ff4d6d';

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const showParcelaWarn = renda > 0 && parcelado > renda * limiteParcPct;

  return (
    <div id="page-cartoes" className="page active">
      {/* Abas de seleção de cartão */}
      <div className="cartao-tabs" id="cartao-tabs">
        {/* Aba Todos */}
        <button
          className={`cartao-tab ${curCartao === 'todos' ? 'active' : ''}`}
          onClick={() => setCurCartao('todos')}
          title="Ver todos os cartões"
        >
          <span style={{ fontSize: '1rem', marginRight: 6 }}>💳</span>
          <span className="cartao-dot" style={{ background: '#10b981' }}></span>
          Todos
        </button>
        {todosCartoes.map(c => (
          <button
            key={c.id}
            className={`cartao-tab ${c.id === curCartao ? 'active' : ''}`}
            onClick={() => setCurCartao(c.id)}
            title={`${c.name}${c.vencimento ? ` (Venc: dia ${c.vencimento})` : ''}`}
          >
            {c.iconeImagem ? (
              <img 
                src={c.iconeImagem} 
                alt="" 
                style={{ 
                  width: 20, 
                  height: 20, 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginRight: 6
                }} 
              />
            ) : (
              <span style={{ fontSize: '1rem', marginRight: 6 }}>{c.icone || '💳'}</span>
            )}
            <span className="cartao-dot" style={{ background: c.color }}></span>
            {c.name}
          </button>
        ))}
        {/* Botão para adicionar cartão */}
        <button
          className="cartao-tab add-cartao"
          onClick={() => onOpenCartaoModal()}
          title="Adicionar cartão"
        >
          <span style={{ fontSize: '1rem' }}>+</span>
          <span style={{ fontSize: '.75rem' }}>Novo</span>
        </button>
      </div>

      {/* Barra de gerenciamento de cartões - Collapsible */}
      <div className="config-section" style={{ 
        background: 'var(--s1)', 
        borderBottom: '1px solid var(--border)',
        margin: '0 0 16px 0',
        borderRadius: 'var(--r)'
      }}>
        {/* Header com toggle - estilo igual ConfigPage */}
        <div 
          className="config-section-title"
          onClick={() => setGerenciarCollapsed(!gerenciarCollapsed)}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px 16px'
          }}
        >
          <span style={{ fontSize: '.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CartoesIcon size={18} color="var(--text)" />
            Gerenciar Cartões
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--mid)' }}>
            Expandir/Recolher
            <span style={{ 
              transform: gerenciarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s',
              fontSize: '1.4rem'
            }}>
              ▼
            </span>
          </span>
        </div>
        
        {/* Conteúdo colapsável */}
        {!gerenciarCollapsed && (
          <div style={{ 
            padding: '0 16px 8px 16px', 
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {todosCartoes.map((c) => (
              <div 
                key={c.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  padding: '4px 8px',
                  background: curCartao === c.id ? 'var(--accent2)' : 'var(--s2)',
                  borderRadius: 'var(--r)',
                  fontSize: '.75rem',
                  border: curCartao === c.id ? '1px solid var(--accent)' : '1px solid transparent'
                }}
              >
                {c.iconeImagem ? (
                  <img 
                    src={c.iconeImagem} 
                    alt="" 
                    style={{ 
                      width: 20, 
                      height: 20, 
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }} 
                  />
                ) : (
                  <span style={{ fontSize: '1rem' }}>{c.icone || '💳'}</span>
                )}
                <span className="cartao-dot" style={{ background: c.color, width: 8, height: 8 }}></span>
                <span>{c.name}</span>
                {(c.vencimento || c.fechamento) && (
                  <span style={{ color: 'var(--mid)', fontSize: '.7rem' }}>
                    {c.vencimento && `Venc: ${c.vencimento}`}
                    {c.vencimento && c.fechamento && ' | '}
                    {c.fechamento && `Fech: ${c.fechamento}`}
                  </span>
                )}
                <button
                  onClick={() => onOpenCartaoModal(c)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '.8rem',
                    padding: '0 2px',
                    marginLeft: 4
                  }}
                  title="Editar cartão"
                >
                  ✎
                </button>
                {/* Só mostra remover se for cartão custom */}
                {cartoesExtra.some(ce => ce.id === c.id) && (
                  <button
                    onClick={() => {
                      const idx = cartoesExtra.findIndex(ce => ce.id === c.id);
                      if (idx >= 0 && confirm(`Remover o cartão "${c.name}"?`)) {
                        onRemoveCartao(idx);
                        if (curCartao === c.id) {
                          setCurCartao(todosCartoes[0]?.id || 'itau');
                        }
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      fontSize: '.8rem',
                      padding: 0
                    }}
                    title="Remover cartão"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini-resumo visual */}
      <div className="cartao-resumo" id="cartao-resumo">
        <div className="cr-card" style={{ borderColor: cor + '33' }}>
          <div className="cr-label">Total do Mês</div>
          <div className="cr-val" style={{ color: cor }}>{fmtR(total)}</div>
        </div>
        <div className="cr-card">
          <div className="cr-label">Parcelado</div>
          <div className="cr-val" style={{ color: 'var(--gold)' }}>{fmtR(parcelado)}</div>
        </div>
        <div className="cr-card">
          <div className="cr-label">Recorrente</div>
          <div className="cr-val" style={{ color: 'var(--blue)' }}>{fmtR(recorrente)}</div>
        </div>
        <div className="cr-card">
          <div className="cr-label">Lançamentos</div>
          <div className="cr-val" style={{ color: 'var(--mid)' }}>{items.length}</div>
        </div>
      </div>

      {false && (
        <div style={{ 
          padding: '8px 16px', 
          background: 'var(--accent2)', 
          color: 'var(--accent)', 
          fontSize: '0.85rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📅 Visualizando dados de <strong>todos os meses</strong> de {curYear}
        </div>
      )}

      {/* Barra de info */}
      <div className="cartao-infobar" id="cartao-infobar">
        <div>
          <div className="cartao-total-label">Total do Cartão</div>
          <div className="cartao-total-val" id="cartao-total-val" style={{ color: cor }}>
            {fmtR(total)}
          </div>
        </div>
        {showParcelaWarn && (
          <div id="parc-warn" className="parc-warn">
            ⚠ Parcelas: {fmtR(parcelado)} ({((parcelado / renda) * 100).toFixed(0)}% da renda)
          </div>
        )}
        <Button size="sm" onClick={onAddExpense} disabled={curCartao === 'todos'} title={curCartao === 'todos' ? 'Selecione um cartão específico' : ''}>
          + Adicionar
        </Button>
      </div>

      {/* Filtro e busca */}
      <div className="filtro-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={filtCat} onChange={(e) => setFiltCat(e.target.value)}>
          <option value="">Todas categorias</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtTipo} onChange={(e) => setFiltTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="normal">Normal</option>
          <option value="parcelado">Parcelado</option>
          <option value="recorrente">Recorrente</option>
        </select>
        <span className="filtro-count">
          {filtrados.length < items.length 
            ? `${filtrados.length} de ${items.length}` 
            : `${items.length} lançamentos`}
        </span>
      </div>

      {/* Tabela + Cards */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtrados.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💳</div>
            <p>Nenhum gasto encontrado.</p>
          </div>
        ) : (
          <>
            <ExpenseTable
              expenses={filtrados}
              sortCol={sortCol}
              sortAsc={sortAsc}
              onSort={handleSort}
              onEdit={onEditExpense}
              onDuplicate={(id) => onEditExpense(id, true)}
              onDelete={onDeleteExpense}
              catExtra={catExtra}
              cartoes={todosCartoes}
            />
            <ExpenseCards
              expenses={filtrados}
              onEdit={onEditExpense}
              catExtra={catExtra}
              showCartao={curCartao === 'todos'}
              cartoes={todosCartoes}
            />
            <div className="table-footer">
              <span>{filtrados.length} lançamento{filtrados.length !== 1 ? 's' : ''}</span>
              <strong>{fmtR(filtrados.reduce((s, g) => s + (g.valor || 0), 0))}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
