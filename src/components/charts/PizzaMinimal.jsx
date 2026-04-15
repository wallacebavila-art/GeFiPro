import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PizzaMinimal({ data, total }) {
  const labels = data.map(([label]) => label);
  const values = data.map(([, value]) => value);

  // Cores sóbrias estilo imagem (ciano, azul, dourado, cinza, vermelho, verde)
  const colors = [
    '#10b981', // ciano/esmeralda
    '#3b82f6', // azul
    '#f59e0b', // dourado
    '#64748b', // cinza
    '#ef4444', // vermelho
    '#8b5cf6', // roxo
  ];

  const chartData = {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderColor: '#111827', // mesma cor do fundo do card
      borderWidth: 3,
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff',
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // donut mais fino
    radius: '95%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: true,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 800,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
