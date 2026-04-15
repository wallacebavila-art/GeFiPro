import { useState, useMemo } from 'react';
import { fmtR, getCatColor } from '../../utils/helpers.js';
import { MESES_S } from '../../constants.js';
import Button from '../ui/Button.jsx';
import Tag from '../ui/Tag.jsx';

export default function DebitosPage({
  debitos,
  pagamentos,
  catExtra,
  curMonth,
  curYear,
  onAddDebito,
  onEditDebito,
  onDeleteDebito,
  onTogglePagamento,
}) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [filtCat, setFiltCat] = useState('');
  const [sortCol, setSortCol] = useState('dia');
  const [sortAsc, setSortAsc] = useState(true);

  const hoje = new Date();
  const diaHoje = hoje.getDate();

  // Categorias disponíveis
  const allCats = useMemo(() => {
    const cats = new Set(['Moradia', 'Serviços', 'Assinaturas', 'Saúde', 'Educação', 'Pet', 'Outros']);
    catExtra.forEach(c => cats.add(c.nome));
    return [...cats];
  }, [catExtra]);

  // Status tabs
  const statusTabs = [
    { id: 'todos', label: 'Todos', icon: '📋' },
    { id: 'ativos', label: 'Ativos', icon: '✓' },
    { id: 'pausados', label: 'Pausados', icon: '⏸' },
    { id: 'bob', label: 'Bob', icon: '🐕' },
  ];

  // Filtra por status selecionado
  const items = useMemo(() => {
    if (filtroStatus === 'todos') return debitos;
    if (filtroStatus === 'bob') return debitos.filter(d => d.tipoPet === 'bob');
    return debitos.filter(d => {
      if (filtroStatus === 'ativos') return d.status === 'ativo' && d.tipoPet !== 'bob';
      if (filtroStatus === 'pausados') return d.status === 'pausado';
      return true;
    });
  }, [debitos, filtroStatus]);

  // Aplica busca e filtro de categoria
  const filtrados = useMemo(() => {
    let result = items.filter(d => {
      const matchBusca = !busca || (d.nome || '').toLowerCase().includes(busca.toLowerCase());
      const matchCat = !filtCat || d.categoria === filtCat;
      return matchBusca && matchCat;
    });

    result = [...result].sort((a, b) => {
      let va = a[sortCol] ?? '';
      let vb = b[sortCol] ?? '';
      if (sortCol === 'valor') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
      if (sortCol === 'dia') { va = parseInt(va) || 99; vb = parseInt(vb) || 99; }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, busca, filtCat, sortCol, sortAsc]);

  // Calcula métricas para os cards
  const todosAtivos = debitos.filter(d => d.status === 'ativo');
  const todosPausados = debitos.filter(d => d.status === 'pausado');
  const bobItems = debitos.filter(d => d.tipoPet === 'bob');
  const bobAtivos = bobItems.filter(d => d.status === 'ativo');

  const totalGeral = todosAtivos.reduce((s, d) => s + (d.valor || 0), 0);
  const totalAtivos = todosAtivos.filter(d => d.tipoPet !== 'bob').reduce((s, d) => s + (d.valor || 0), 0);
  const totalPausados = todosPausados.reduce((s, d) => s + (d.valor || 0), 0);
  const totalBob = bobAtivos.reduce((s, d) => s + (d.valor || 0), 0);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  // Próximos vencimentos (próximos 7 dias)
  const proximosDias = 7;
  const proximos = todosAtivos
    .filter(d => d.dia && d.dia >= diaHoje && d.dia <= diaHoje + proximosDias)
    .sort((a, b) => a.dia - b.dia);

  const renderDebitoItem = (d) => {
    const cor = getCatColor(d.categoria || 'Outros', catExtra);
    const encerrado = d.ateTipo === 'definido' && d.ateMes && d.ateAno &&
      new Date(d.ateAno, d.ateMes - 1) < hoje;
    const pago = pagamentos[d.id] === true;
    const handleEditClick = () => onEditDebito(d.id);

    return (
      <div key={d.id} className={`debito-item ${d.status === 'pausado' ? 'pausado' : ''} ${encerrado ? 'encerrado' : ''}`}>
        <span className="debito-dot" style={{ background: cor }}></span>
        <div className="debito-body">
          <span onClick={handleEditClick} style={{cursor: 'pointer', display: 'inline-block'}}>
            <div className="debito-name">{d.nome || '—'}</div>
          </span>
          <div className="debito-meta">
            <span onClick={handleEditClick} style={{cursor: 'pointer', display: 'inline-block'}}>
              <Tag variant={d.status === 'ativo' ? 'active' : d.status === 'encerrado' ? '' : 'paused'}>
                {d.status === 'ativo' ? 'Ativo' : d.status === 'encerrado' ? '✓ Encerrado' : 'Pausado'}
              </Tag>
            </span>
            {d.dia && <Tag variant="warn">Dia {d.dia}</Tag>}
            <span onClick={handleEditClick} style={{cursor: 'pointer', display: 'inline-block'}}>
              <Tag color={cor}>{d.categoria || '—'}</Tag>
            </span>
            {d.ateTipo === 'definido' && d.ateMes && d.ateAno && (
              <Tag variant="warn">Até {MESES_S[d.ateMes - 1]}/{d.ateAno}</Tag>
            )}
            <span 
              className={`badge-pago ${pago ? 'sim' : 'nao'}`}
              onClick={() => onTogglePagamento(d.id)}
            >
              {pago ? '✓ Pago' : 'Marcar pago'}
            </span>
          </div>
        </div>
        <div className="debito-val-wrap">
          <span className="debito-val">{fmtR(d.valor)}</span>
        </div>
        <div className="debito-actions">
          <button className="btn-icon" onClick={() => onEditDebito(d.id)} title="Editar">✎</button>
          <button className="btn-icon del" onClick={() => onDeleteDebito(d.id)} title="Deletar">✕</button>
        </div>
      </div>
    );
  };

  return (
    <div id="page-debitos" className="page">
      {/* Abas de status */}
      <div className="cartao-tabs" id="debito-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            className={`cartao-tab ${filtroStatus === tab.id ? 'active' : ''}`}
            onClick={() => setFiltroStatus(tab.id)}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mini-resumo visual */}
      <div className="cartao-resumo" id="debito-resumo">
        <div className="cr-card" style={{ borderColor: 'var(--accent)33' }}>
          <div className="cr-label">Total Ativos</div>
          <div className="cr-val" style={{ color: 'var(--accent)' }}>{fmtR(totalGeral)}</div>
        </div>
        <div className="cr-card">
          <div className="cr-label">Fixos</div>
          <div className="cr-val" style={{ color: 'var(--blue)' }}>{fmtR(totalAtivos)}</div>
        </div>
        <div className="cr-card">
          <div className="cr-label">Pausados</div>
          <div className="cr-val" style={{ color: 'var(--gold)' }}>{fmtR(totalPausados)}</div>
        </div>
        <div className="cr-card">
          <div className="cr-label">Bob</div>
          <div className="cr-val" style={{ color: 'var(--purple)' }}>{fmtR(totalBob)}</div>
        </div>
      </div>

      {/* Barra de info */}
      <div className="cartao-infobar" id="debito-infobar">
        <div>
          <div className="cartao-total-label">
            {filtroStatus === 'todos' ? 'Total Geral' : 
             filtroStatus === 'ativos' ? 'Total Ativos' :
             filtroStatus === 'pausados' ? 'Total Pausados' : 'Total do Bob'}
          </div>
          <div className="cartao-total-val" style={{ color: 'var(--accent)' }}>
            {fmtR(filtroStatus === 'ativos' ? totalAtivos : 
                  filtroStatus === 'pausados' ? totalPausados : 
                  filtroStatus === 'bob' ? totalBob : totalGeral)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filtroStatus === 'bob' ? (
            <Button size="sm" onClick={() => onAddDebito('bob')}>+ Adicionar Bob</Button>
          ) : (
            <Button size="sm" onClick={() => onAddDebito()}>+ Adicionar</Button>
          )}
        </div>
      </div>

      {/* Próximos vencimentos */}
      {proximos.length > 0 && filtroStatus !== 'pausados' && (
        <div className="proximos-wrap" id="proximos-wrap" style={{ marginBottom: 12 }}>
          <div className="proximos-title">⚠ Próximos Vencimentos</div>
          <div id="proximos-list">
            {proximos.slice(0, 3).map(d => (
              <div key={d.id} className="proximo-item">
                <div>
                  <div className="proximo-nome">{d.nome}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--mid)' }}>{d.categoria || '—'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="proximo-dia">Dia {d.dia}</span>
                  <span className="proximo-val">{fmtR(d.valor)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtro e busca */}
      <div className="filtro-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={filtCat} onChange={(e) => setFiltCat(e.target.value)}>
          <option value="">Todas categorias</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="filtro-count">
          {filtrados.length} {filtrados.length === 1 ? 'débito' : 'débitos'}
        </span>
      </div>

      {/* Lista de débitos */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtrados.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              {filtroStatus === 'bob' ? '🐕' : filtroStatus === 'pausados' ? '⏸' : '📋'}
            </div>
            <p>
              {filtroStatus === 'bob' ? 'Nenhum gasto do Bob.' :
               filtroStatus === 'pausados' ? 'Nenhum débito pausado.' :
               filtroStatus === 'ativos' ? 'Nenhum débito ativo.' :
               'Nenhum débito cadastrado.'}
            </p>
          </div>
        ) : (
          <div id="debitos-list" style={{ padding: '8px 0' }}>
            {filtrados.map(d => renderDebitoItem(d))}
          </div>
        )}
      </div>
    </div>
  );
}
