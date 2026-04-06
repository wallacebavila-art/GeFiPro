import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { fmtR, calcularHealthScore, getHealthInfo } from '../../utils/helpers.js';
import { CAT_COLORS_DEFAULT } from '../../constants.js';
import { Card, CardTitle } from '../ui/Card.jsx';
import { useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage({
  gastos,
  debitos,
  renda,
  limiteParcPct,
  curYear,
  curMonth,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
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
    .slice(0, 8); // Show max 8 categories

  // Paleta de cores vibrantes para o gráfico
  const VIBRANT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  ];

  const pieChartData = {
    labels: sortedCategories.map(([cat]) => cat),
    datasets: [
      {
        data: sortedCategories.map(([, val]) => val),
        backgroundColor: sortedCategories.map((_, i) => VIBRANT_COLORS[i % VIBRANT_COLORS.length]),
        borderWidth: 3,
        borderColor: '#0f172a',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
        hoverOffset: 12,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    radius: '120%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
    onHover: (event, elements) => {
      if (elements && elements.length > 0) {
        setHoveredIndex(elements[0].index);
        event.native.target.style.cursor = 'pointer';
      } else {
        setHoveredIndex(null);
        event.native.target.style.cursor = 'default';
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 14,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return ` ${context.label}: ${fmtR(value)} (${percentage}%)`;
          },
        },
      },
    },
    layout: {
      padding: 20,
    },
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

      {/* Layout: Cards à esquerda (50%), Gráfico à direita (50%) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', height: '350px' }}>
        {/* Cards de métricas - tamanho fixo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '280px', flexShrink: 0 }}>
          <div className="sum-card c-red" style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label">Total Cartões</div>
            <div className="sum-card-val neg">{fmtR(totalCartoes)}</div>
            <div className="sum-card-sub">{gastos.length} lançamentos</div>
          </div>
          <div className="sum-card c-blue" style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label">Débitos Fixos</div>
            <div className="sum-card-val neg">{fmtR(totalDebitos)}</div>
            <div className="sum-card-sub">{debitosAtivos.length} ativos</div>
          </div>
          <div className="sum-card c-gold" style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label">Total Geral</div>
            <div className="sum-card-val neg">{fmtR(totalGeral)}</div>
            {renda > 0 && <div className="sum-card-sub">{pctRenda.toFixed(0)}% da renda</div>}
          </div>
          <div className="sum-card c-green" style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sum-card-label">{renda > 0 ? 'Saldo Estimado' : 'Renda'}</div>
            <div className={`sum-card-val ${renda > 0 ? (saldo >= 0 ? 'pos' : 'neg') : ''}`}>
              {renda > 0 ? (saldo < 0 ? '−' : '') + fmtR(Math.abs(saldo)) : 'Não definida'}
            </div>
          </div>
        </div>

        {/* Gastos por Categoria - Doughnut Chart (preenche restante) */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {sortedCategories.length > 0 ? (
            <div style={{ 
              position: 'relative', 
              flex: 1, 
              padding: '16px', 
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '140%', height: '140%' }}>
                  <Doughnut data={pieChartData} options={pieChartOptions} />
                </div>
              </div>
              {/* Centro com info */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}>
                {hoveredIndex !== null ? (
                  <>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>
                      {sortedCategories[hoveredIndex][0]}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: VIBRANT_COLORS[hoveredIndex % VIBRANT_COLORS.length],
                    }}>
                      {((sortedCategories[hoveredIndex][1] / totalCartoes) * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                      {fmtR(sortedCategories[hoveredIndex][1])}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '2px' }}>Total Cartões</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ECDC4' }}>
                      {fmtR(totalCartoes)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div style={{ 
              flex: 1,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--dim)',
              fontSize: '.9rem',
              padding: 16
            }}>
              Nenhum gasto registrado este período
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
