import { useMemo, useState } from 'react';
import { fmtR, calcularHealthScore, getHealthInfo } from '../../utils/helpers.js';
import { Card, CardTitle } from '../ui/Card.jsx';
import PizzaMinimal from '../charts/PizzaMinimal.jsx';
import CartaoCard from '../dashboard/CartaoCard.jsx';

export default function DashboardPage({
  gastos,
  debitos,
  renda,
  limiteParcPct,
  curYear,
  curMonth,
  cartoesExtra,
  cartoesDefault,
}) {
  const debitosAtivos = debitos.filter(d => {
    if (d.status !== 'ativo') return false;
    if (d.ateTipo === 'definido' && d.ateMes && d.ateAno) {
      if (new Date(d.ateAno, d.ateMes - 1) < new Date(curYear, curMonth - 1)) return false;
    }
    return true;
  });
  
  const totalCartoes = gastos.reduce((s, g) => s + (g.valor || 0), 0);
  const totalDebitos = debitosAtivos.reduce((s, d) => s + (d.valor || 0), 0);
  const totalGeral = totalCartoes + totalDebitos;
  const pctRenda = renda > 0 ? (totalGeral / renda) * 100 : 0;
  const saldo = renda - totalGeral;

  const totalParc = gastos
    .filter(g => g.tipo === 'parcelado' || g.parcela)
    .reduce((s, g) => s + (g.valor || 0), 0);

  const score = calcularHealthScore(renda, totalGeral, totalParc, limiteParcPct);
  const healthInfo = getHealthInfo(score);

  const parcs = gastos.filter(g => g.parcela || g.tipo === 'parcelado');

  // Calculate gastos by categoria for pie chart
  const gastosByCategoria = gastos.reduce((acc, g) => {
    const cat = g.categoria || 'Outros';
    acc[cat] = (acc[cat] || 0) + (g.valor || 0);
    return acc;
  }, {});

  // Sort by value descending and get top categories
  const sortedCategories = Object.entries(gastosByCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Combinar cartões padrão e customizados
  const [cartoesOrdem, setCartoesOrdem] = useState(() => {
    const customIds = new Set((cartoesExtra || []).map(c => c.id));
    const defaultsFiltered = (cartoesDefault || []).filter(c => !customIds.has(c.id));
    return [...defaultsFiltered, ...(cartoesExtra || [])];
  });

  // Handler para mover cartão para frente
  const handleCardClick = (cartaoClicado) => {
    setCartoesOrdem(prev => {
      // Remove o cartão clicado da posição atual
      const semClicado = prev.filter(c => c.id !== cartaoClicado.id);
      // Coloca no início (frente da pilha)
      return [cartaoClicado, ...semClicado];
    });
  };

  return (
    <div id="page-dashboard" className="page">
      {/* Card de saúde financeira */}
      <div className="health-card">
        <div className="health-top">
          <div 
            className="health-score" 
            style={{ color: healthInfo.cor, borderColor: healthInfo.cor, background: healthInfo.cor + '18' }}
          >
            {score}
          </div>
          <div className="health-info">
            <h3>Saúde Financeira</h3>
            <p style={{ color: healthInfo.cor }}>{healthInfo.label}</p>
          </div>
        </div>
        <div className="health-bar-wrap">
          <div className="health-bar-fill" style={{ width: score + '%', background: healthInfo.cor }}></div>
        </div>
      </div>

      {/* Layout principal: Cards de métricas (esquerda) + Gráfico (direita) */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        {/* Coluna da Esquerda - Cards de métricas empilhados */}
        <div style={{ 
          minWidth: '280px',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="sum-card">
            <div className="sum-card-label">Total Cartões</div>
            <div className="sum-card-val neg">{fmtR(totalCartoes)}</div>
            <div className="sum-card-sub">
              <span style={{ color: 'var(--green)', fontSize: '0.7rem' }}>↗ {gastos.length} lançamentos</span>
            </div>
          </div>

          <div className="sum-card">
            <div className="sum-card-label">Débitos Fixos</div>
            <div className="sum-card-val neg">{fmtR(totalDebitos)}</div>
            <div className="sum-card-sub">
              <span style={{ color: 'var(--mid)', fontSize: '0.7rem' }}>{debitosAtivos.length} ativos</span>
            </div>
          </div>

          <div className="sum-card">
            <div className="sum-card-label">Total Geral</div>
            <div className="sum-card-val neg">{fmtR(totalGeral)}</div>
            {renda > 0 && (
              <div className="sum-card-sub">
                <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>{pctRenda.toFixed(0)}% da renda</span>
              </div>
            )}
          </div>

          <div className="sum-card">
            <div className="sum-card-label">{renda > 0 ? 'Saldo Estimado' : 'Renda'}</div>
            <div className={`sum-card-val ${renda > 0 ? (saldo >= 0 ? 'pos' : 'neg') : ''}`}>
              {renda > 0 ? (saldo < 0 ? '−' : '') + fmtR(Math.abs(saldo)) : 'Não definida'}
            </div>
          </div>

          {/* Cards de Cartões de Crédito - Empilhados */}
          {cartoesOrdem.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                My Cards
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}>
                {cartoesOrdem.map((cartao, index) => (
                  <div
                    key={cartao.id}
                    onClick={() => handleCardClick(cartao)}
                    style={{
                      marginTop: index > 0 ? '-140px' : '0',
                      zIndex: cartoesOrdem.length - index,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: `translateY(0) scale(1)`,
                      opacity: 1,
                      filter: 'none'
                    }}
                  >
                    <CartaoCard
                      cartao={cartao}
                      gastos={gastos}
                      curMonth={curMonth}
                      curYear={curYear}
                      isTop={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna da Direita - Gráfico de Pizza */}
        {sortedCategories.length > 0 && (
          <Card style={{ flex: 1, padding: '24px', minWidth: '400px' }}>
            <CardTitle style={{ 
              fontSize: '0.75rem', 
              color: 'var(--dim)', 
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Gastos por Categoria
            </CardTitle>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <div style={{ width: '200px', height: '200px' }}>
                <PizzaMinimal data={sortedCategories} total={totalCartoes} />
              </div>
              {/* Legenda minimalista */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedCategories.slice(0, 6).map(([label, value], i) => {
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#64748b', '#ef4444', '#8b5cf6'];
                  const percentage = ((value / totalCartoes) * 100).toFixed(1);
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: colors[i % colors.length] 
                      }} />
                      <span style={{ 
                        flex: 1, 
                        fontSize: '0.85rem', 
                        color: '#94a3b8' 
                      }}>{label}</span>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: '#f1f5f9', 
                        fontWeight: 600 
                      }}>{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
