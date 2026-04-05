import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { fmtR, calcularHealthScore, getHealthInfo, getCatColor } from '../../utils/helpers.js';
import { CARTOES, CAT_COLORS_DEFAULT } from '../../constants.js';
import { Card, CardTitle } from '../ui/Card.jsx';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage({
  gastos,
  debitos,
  renda,
  limiteParcPct,
  curYear,
  curMonth,
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
    .slice(0, 8); // Show max 8 categories

  const pieChartData = {
    labels: sortedCategories.map(([cat]) => cat),
    datasets: [
      {
        data: sortedCategories.map(([, val]) => val),
        backgroundColor: sortedCategories.map(([cat]) => 
          CAT_COLORS_DEFAULT[cat] || '#94a3b8'
        ),
        borderWidth: 2,
        borderColor: 'var(--s1)',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--text)',
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${fmtR(value)} (${percentage}%)`;
          },
        },
      },
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

      {/* Cards de métricas */}
      <div className="sum-grid" id="dash-cards">
        <div className="sum-card c-red">
          <div className="sum-card-label">Total Cartões</div>
          <div className="sum-card-val neg">{fmtR(totalCartoes)}</div>
          <div className="sum-card-sub">{gastos.length} lançamentos</div>
        </div>
        <div className="sum-card c-blue">
          <div className="sum-card-label">Débitos Fixos</div>
          <div className="sum-card-val neg">{fmtR(totalDebitos)}</div>
          <div className="sum-card-sub">{debitosAtivos.length} ativos</div>
        </div>
        <div className="sum-card c-gold">
          <div className="sum-card-label">Total Geral</div>
          <div className="sum-card-val neg">{fmtR(totalGeral)}</div>
          {renda > 0 && <div className="sum-card-sub">{pctRenda.toFixed(0)}% da renda</div>}
        </div>
        <div className="sum-card c-green">
          <div className="sum-card-label">{renda > 0 ? 'Saldo Estimado' : 'Renda'}</div>
          <div className={`sum-card-val ${renda > 0 ? (saldo >= 0 ? 'pos' : 'neg') : ''}`}>
            {renda > 0 ? (saldo < 0 ? '−' : '') + fmtR(Math.abs(saldo)) : 'Não definida'}
          </div>
        </div>
      </div>

      {/* Gastos por Categoria - Pie Chart */}
      <Card>
        <CardTitle>🍕 Gastos por Categoria</CardTitle>
        {sortedCategories.length > 0 ? (
          <div style={{ height: 300, padding: 16 }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        ) : (
          <div style={{ 
            height: 200, 
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
  );
}
