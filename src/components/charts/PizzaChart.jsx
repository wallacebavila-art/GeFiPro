import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useState, useCallback } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PizzaChart({ data, total }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const labels = data.map(([label]) => label);
  const values = data.map(([, value]) => value);

  const colors = [
    '#FF10F0', '#00F0FF', '#39FF14', '#FF0040', '#BF00FF', '#FF6600', '#00FF80', '#FFFF00'
  ];

  const backgroundColors = values.map((_, i) => {
    if (selectedIndex !== null && selectedIndex !== i) {
      return colors[i % colors.length] + '40';
    }
    return colors[i % colors.length];
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderWidth: selectedIndex !== null ? 4 : 3,
        borderColor: values.map((_, i) => 
          selectedIndex === i ? '#ffffff' : '#0f172a'
        ),
        hoverBorderWidth: 5,
        hoverBorderColor: '#ffffff',
        hoverOffset: selectedIndex !== null ? 0 : 15,
        offset: values.map((_, i) => selectedIndex === i ? 20 : 0)
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    radius: '92%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: isAnimating ? 600 : 400,
      easing: 'easeOutElastic'
    },
    layout: { padding: 20 },
    onHover: (event, elements) => {
      if (elements && elements.length > 0) {
        setHoveredIndex(elements[0].index);
        event.native.target.style.cursor = 'pointer';
      } else {
        setHoveredIndex(null);
        event.native.target.style.cursor = 'default';
      }
    },
    onClick: (event, elements) => {
      if (elements && elements.length > 0) {
        const clickedIndex = elements[0].index;
        setIsAnimating(true);
        setSelectedIndex(prev => prev === clickedIndex ? null : clickedIndex);
        setTimeout(() => setIsAnimating(false), 500);
      } else {
        setSelectedIndex(null);
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: selectedIndex !== null ? colors[selectedIndex % colors.length] : 'rgba(255,255,255,0.3)',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 16,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            const isSel = selectedIndex === context.dataIndex;
            return [
              `Valor: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              `Percentual: ${percentage}%`,
              isSel ? '✓ Selecionado (clique para desmarcar)' : 'Clique para destacar'
            ];
          }
        }
      }
    },
    layout: {
      padding: 16
    }
  };

  const activeIndex = selectedIndex !== null ? selectedIndex : hoveredIndex;
  const isSelected = selectedIndex !== null;
  
  const displayValue = activeIndex !== null ? values[activeIndex] : total;
  const displayLabel = activeIndex !== null ? labels[activeIndex] : (isSelected ? null : 'Total Cartões');
  const displayPercentage = activeIndex !== null 
    ? ((values[activeIndex] / total) * 100).toFixed(1) 
    : null;
  const displayColor = activeIndex !== null 
    ? colors[activeIndex % colors.length] 
    : '#00F0FF';

  return (
    <div style={{ 
      height: 240, 
      position: 'relative',
      filter: isAnimating ? 'brightness(1.1)' : 'none',
      transition: 'filter 0.3s ease'
    }}>
      <Doughnut data={chartData} options={options} />
      {/* Centro com info */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        {activeIndex !== null ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#94a3b8', 
              marginBottom: '4px',
              fontWeight: 500
            }}>
              {displayLabel}
              {isSelected && <span style={{ color: displayColor }}> ●</span>}
            </div>
            <div style={{ 
              fontSize: isSelected ? '1.4rem' : '1.2rem', 
              fontWeight: 800, 
              color: displayColor,
              textShadow: `0 0 25px ${displayColor}80, 0 0 50px ${displayColor}40`,
              transition: 'all 0.3s ease'
            }}>
              {displayPercentage}%
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
              R$ {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>
              Total Cartões
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00F0FF', textShadow: '0 0 25px #00F0FF80, 0 0 50px #00F0FF40' }}>
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
              👆 Clique nas fatias
            </div>
          </div>
        )}
      </div>

      {/* Botão reset */}
      {selectedIndex !== null && (
        <button
          onClick={() => {
            setIsAnimating(true);
            setSelectedIndex(null);
            setTimeout(() => setIsAnimating(false), 500);
          }}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: displayColor,
            color: '#0f172a',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: `0 0 20px ${displayColor}80, 0 0 40px ${displayColor}40`
          }}
        >
          ✕ Resetar
        </button>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
