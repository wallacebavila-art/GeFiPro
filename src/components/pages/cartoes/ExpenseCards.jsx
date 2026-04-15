import { fmtR, getCatColor, fmtDate } from "../../../utils/helpers.js";
import Tag from "../../ui/Tag.jsx";

export default function ExpenseCards({ expenses, onEdit, catExtra, showCartao, cartoes }) {
  const getCartaoInfo = (cartaoId) => {
    const c = cartoes?.find(x => x.id === cartaoId);
    return { name: c?.name || cartaoId, color: c?.color || '#94a3b8' };
  };

  return (
    <div className="expense-cards" id="expense-cards">
      {expenses.map(g => {
        const catCor = getCatColor(g.categoria || 'Outros', catExtra);
        const tipo = g.tipo || 'normal';
        return (
          <div key={g.id} className="exp-card" onClick={() => onEdit(g.id)}>
            <span className="exp-card-dot" style={{ background: catCor }}></span>
            <div className="exp-card-body">
              <div className="exp-card-desc">{g.descricao || '—'}</div>
              {g.notas && (
                <div className="exp-card-nota">📝 {g.notas}</div>
              )}
              <div className="exp-card-sub">
                {showCartao && (() => {
                  const c = getCartaoInfo(g.cartao);
                  return (
                    <span style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem'}}>
                      <span className="exp-card-dot" style={{ background: c.color }}></span>
                      <span style={{color: 'var(--mid)'}}>{c.name}</span>
                    </span>
                  );
                })()}
                <Tag color={catCor}>{g.categoria || '—'}</Tag>
                {tipo === 'parcelado' && (
                  <Tag variant="parc">{g.parcela || ''}</Tag>
                )}
                {tipo === 'recorrente' && (
                  <Tag variant="recorr">🔄</Tag>
                )}
              </div>
            </div>
            <div className="exp-card-right">
              <div className="exp-card-val">{fmtR(g.valor)}</div>
              <div className="exp-card-date">{fmtDate(g.data)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
