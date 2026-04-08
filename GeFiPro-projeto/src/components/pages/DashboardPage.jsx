import { useMemo, useState, useEffect } from 'react';
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

  // Combinar cartões padrão e customizados (mesma lógica da CartoesPage)
  const cartoesCalculados = useMemo(() => {
    const CARTOES_DEFAULT = cartoesDefault || [];
    const idsPadrao = new Set(CARTOES_DEFAULT.map(c => c.id));
    
    // Separar cartões extras em: padrão (com propriedades customizadas) e realmente novos
    const extrasPadrao = (cartoesExtra || []).filter(c => idsPadrao.has(c.id));
    const extrasNovos = (cartoesExtra || []).filter(c => !idsPadrao.has(c.id));
    
    // Para cada cartão padrão, usar a versão do CARTOES_DEFAULT mas com propriedades customizadas se existir
    const defaultsComExtras = CARTOES_DEFAULT.map(c => {
      const extra = extrasPadrao.find(e => e.id === c.id);
      return extra ? { ...c, ...extra } : c;
    });
    
    // Montar array na ordem correta: Itau -> Porto -> Nubank -> Novos
    const resultado = [...defaultsComExtras, ...extrasNovos];
    
    // DEBUG: Verificar cores
    console.log('[DashboardPage] Cartões calculados:', resultado.map(c => ({ 
      id: c.id, 
      name: c.name, 
      color: c.color,
      source: extrasPadrao.some(e => e.id === c.id) ? 'firebase' : 'default'
    })));
    
    return resultado;
  }, [cartoesExtra, cartoesDefault]);

  // Estado para ordenação visual (quando clica move para frente)
  const [cartoesOrdem, setCartoesOrdem] = useState(cartoesCalculados);

  // Sincronizar quando dados externos mudarem
  useEffect(() => {
    setCartoesOrdem(cartoesCalculados);
  }, [cartoesCalculados]);

  // Handler para mover cartão para frente
  const handleCardClick = (cartaoClicado) => {
    setCartoesOrdem(prev => {
      const semClicado = prev.filter(c => c.id !== cartaoClicado.id);
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

      {/* Layout principal: 3 colunas - Métricas | Gráfico | Cartões */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        
        {/* Coluna da Esquerda - Cards de métricas compactos */}
        <div style={{ 
          minWidth: '150px',
          maxWidth: '150px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignSelf: 'stretch'
        }}>
          <div className="sum-card" style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>Total Cartões</div>
            <div className="sum-card-val neg" style={{ fontSize: '0.9rem' }}>{fmtR(totalCartoes)}</div>
            <div className="sum-card-sub" style={{ marginTop: '2px' }}>
              <span style={{ color: 'var(--green)', fontSize: '0.6rem' }}>↗ {gastos.length} lançamentos</span>
            </div>
          </div>

          <div className="sum-card" style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>Débitos Fixos</div>
            <div className="sum-card-val neg" style={{ fontSize: '0.9rem' }}>{fmtR(totalDebitos)}</div>
            <div className="sum-card-sub" style={{ marginTop: '2px' }}>
              <span style={{ color: 'var(--mid)', fontSize: '0.6rem' }}>{debitosAtivos.length} ativos</span>
            </div>
          </div>

          <div className="sum-card" style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>Total Geral</div>
            <div className="sum-card-val neg" style={{ fontSize: '0.9rem' }}>{fmtR(totalGeral)}</div>
            {renda > 0 && (
              <div className="sum-card-sub" style={{ marginTop: '2px' }}>
                <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>{pctRenda.toFixed(0)}% da renda</span>
              </div>
            )}
          </div>

          <div className="sum-card" style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>{renda > 0 ? 'Saldo Estimado' : 'Renda'}</div>
            <div className={`sum-card-val ${renda > 0 ? (saldo >= 0 ? 'pos' : 'neg') : ''}`} style={{ fontSize: '0.9rem' }}>
              {renda > 0 ? (saldo < 0 ? '−' : '') + fmtR(Math.abs(saldo)) : 'Não definida'}
            </div>
          </div>
        </div>

        {/* Coluna do Meio - Gráfico de Pizza */}
        {sortedCategories.length > 0 && (
          <Card style={{ flex: 1, padding: '24px', minWidth: '350px', alignSelf: 'stretch' }}>
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

        {/* Coluna da Direita - Cards de Cartões de Crédito Empilhados */}
        {cartoesOrdem.length > 0 && (
          <div style={{ 
            minWidth: '300px',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            justifyContent: 'center'
          }}>
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
    </div>
  );
}
