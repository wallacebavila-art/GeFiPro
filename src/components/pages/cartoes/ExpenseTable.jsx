import { fmtR, getCatColor, fmtDate } from '../../../utils/helpers.js';
import Tag from '../../ui/Tag.jsx';

export default function ExpenseTable({
  expenses,
  sortCol,
  sortAsc,
  onSort,
  onEdit,
  onDuplicate,
  onDelete,
  catExtra,
  cartoes,
}) {
  const getSortIcon = (col) => {
    if (sortCol !== col) return '';
    return sortAsc ? '▲' : '▼';
  };

  const getCartaoName = (cartaoId) => {
    const c = cartoes?.find(x => x.id === cartaoId);
    return { name: c?.name || cartaoId, color: c?.color || '#94a3b8' };
  };

  const renderTipo = (g, onEditClick) => {
    const tipo = g.tipo || 'normal';
    if (tipo === 'parcelado') {
      return <Tag variant="parc" onClick={onEditClick} style={{cursor: 'pointer'}}>📅 {g.parcela || '—'}</Tag>;
    }
    if (tipo === 'recorrente') {
      return <Tag variant="recorr" onClick={onEditClick} style={{cursor: 'pointer'}}>🔄 Recorr.</Tag>;
    }
    return <Tag onClick={onEditClick} style={{cursor: 'pointer'}}>Normal</Tag>;
  };

  return (
    <table className="expense-table">
      <thead>
        <tr>
            <th className="sortable" onClick={() => onSort('cartao')}>
              Cartão <span className="sort-icon">{getSortIcon('cartao')}</span>
            </th>
          <th className="sortable" onClick={() => onSort('data')}>
            Data <span className="sort-icon">{getSortIcon('data')}</span>
          </th>
          <th className="sortable" onClick={() => onSort('descricao')}>
            Descrição <span className="sort-icon">{getSortIcon('descricao')}</span>
          </th>
          <th className="sortable" onClick={() => onSort('categoria')}>
            Categoria <span className="sort-icon">{getSortIcon('categoria')}</span>
          </th>
          <th className="sortable" onClick={() => onSort('tipo')}>
            Tipo <span className="sort-icon">{getSortIcon('tipo')}</span>
          </th>
          <th className="sortable" onClick={() => onSort('valor')}>
            Valor <span className="sort-icon">{getSortIcon('valor')}</span>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody id="expense-tbody">
        {expenses.map(g => {
          const catCor = getCatColor(g.categoria || 'Outros', catExtra);
          const handleEditClick = () => onEdit(g.id);
          return (
            <tr key={g.id}>
              <td className="td-cartao">
                {(() => {
                  const c = getCartaoName(g.cartao);
                  return (
                    <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                      <span className="cartao-dot" style={{ background: c.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}></span>
                      <span style={{fontSize: '.75rem', color: 'var(--mid)'}}>{c.name}</span>
                    </span>
                  );
                })()}
              </td>
              <td className="td-date">{fmtDate(g.data)}</td>
              <td>
                <span onClick={handleEditClick} style={{cursor: 'pointer', display: 'inline-block'}}>
                  <div style={{fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {g.descricao || '—'}
                  </div>
                </span>
                {g.notas && (
                  <div className="td-nota">📝 {g.notas}</div>
                )}
              </td>
              <td>
                <span onClick={handleEditClick} style={{cursor: 'pointer', display: 'inline-block'}}>
                  <Tag color={catCor}>{g.categoria || '—'}</Tag>
                </span>
              </td>
              <td>{renderTipo(g, handleEditClick)}</td>
              <td className="td-val">
                {fmtR(g.valor)}
              </td>
              <td>
                <div className="td-actions">
                  <button className="btn-icon dup" onClick={() => onDuplicate(g.id)} title="Duplicar">⧉</button>
                  <button className="btn-icon" onClick={() => onEdit(g.id)} title="Editar">✎</button>
                  <button className="btn-icon del" onClick={() => onDelete(g.id)} title="Deletar">✕</button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
