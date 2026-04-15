import { useState } from 'react';
import { fmtR } from '../../utils/helpers.js';

// Componente para exibir a bandeira do cartão
function BandeiraIcon({ bandeira }) {
  const bandeiras = {
    visa: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect fill="#1A1F71" width="48" height="48" rx="4"/>
        <path fill="#FFFFFF" d="M18.5 32L15 16h4l1.5 8h0.1l3-8h4l-5 16h-4.1zm11.5 0l2.5-16h4l-2.5 16h-4zm6.5-16c-1 0-1.8 0.5-2.2 1.3L33 16h4l1.5 1h0.1l-1.5 1.5c0.5 0.2 1 0.7 1 1.5 0 0.5-0.2 1-0.5 1.5L36 24h-4l1.5-2.5c-0.5 0-1 0.2-1.5 0.5L30 24h-4l4-8c0.8-1.5 2.3-2.5 4-2.5 0.5 0 1 0 1.5 0.2V16z"/>
      </svg>
    ),
    mastercard: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect fill="#000000" width="48" height="48" rx="4"/>
        <circle cx="19" cy="24" r="10" fill="#EB001B"/>
        <circle cx="29" cy="24" r="10" fill="#F79E1B"/>
        <path d="M24 16.5c2.5 2 4 5 4 7.5s-1.5 5.5-4 7.5c-2.5-2-4-5-4-7.5s1.5-5.5 4-7.5z" fill="#FF5F00"/>
      </svg>
    ),
    amex: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect fill="#006FCF" width="48" height="48" rx="4"/>
        <text x="24" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">AMEX</text>
      </svg>
    ),
    elo: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect fill="#000000" width="48" height="48" rx="4"/>
        <circle cx="16" cy="24" r="8" fill="#FFDF00"/>
        <circle cx="32" cy="24" r="8" fill="#00A4E0"/>
        <ellipse cx="24" cy="24" rx="6" ry="8" fill="#E31837"/>
      </svg>
    ),
    hipercard: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect fill="#B31219" width="48" height="48" rx="4"/>
        <text x="24" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">HIPER</text>
      </svg>
    ),
    default: (
      <svg viewBox="0 0 48 48" width="48" height="48">
        <rect fill="#6366f1" width="48" height="48" rx="4"/>
        <text x="24" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="20">💳</text>
      </svg>
    )
  };
  
  return bandeiras[bandeira?.toLowerCase()] || bandeiras.default;
}

export default function CartaoCard({ cartao, gastos, curMonth, curYear, isTop }) {
  const [isHovered, setIsHovered] = useState(false);
  // Calcular gastos do cartão no período atual
  const gastosCartao = gastos?.filter(g => g.cartao === cartao.id) || [];
  const totalUsado = gastosCartao.reduce((s, g) => s + (g.valor || 0), 0);
  
  // Limite e cálculos
  const limite = cartao.limite || 0;
  const disponivel = Math.max(0, limite - totalUsado);
  const percentualUsado = limite > 0 ? (totalUsado / limite) * 100 : 0;
  
  // Gerar número do cartão com máscara
  const numeroCartao = `**** **** **** ${(cartao.numero || '0000').toString().padStart(4, '0')}`;
  
  // Validade
  const validade = cartao.validade || `${String(curMonth).padStart(2, '0')}/${String(curYear).slice(-2)}`;
  
  // Bandeira (visa, mastercard, amex, elo, hipercard)
  const bandeira = cartao.bandeira || 'default';
  
  // Cor neutra padrão para todos os cartões (sem personalização de cor)
  const gradient = 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)';

  return (
    <div style={{
      background: gradient,
      borderRadius: '16px',
      padding: isTop ? '24px' : '20px',
      minWidth: '340px',
      maxWidth: '400px',
      height: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      opacity: 1,
      position: 'relative',
      overflow: 'hidden',
      border: isTop ? 'none' : `2px solid ${isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: isTop 
        ? '0 16px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15)' 
        : isHovered 
          ? '0 10px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)'
          : '0 8px 20px rgba(0,0,0,0.25)',
    }}
    // Hover desabilitado para teste
    // onMouseEnter={() => setIsHovered(true)}
    // onMouseLeave={() => setIsHovered(false)}
  >
      {/* Indicador de clicável para cartões de trás */}
      {!isTop && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
          pointerEvents: 'none',
          transition: 'background 0.15s, color 0.15s'
        }}>
          ↑
        </div>
      )}
      {/* Header - Saldo e Bandeira */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{
            fontSize: isTop ? '0.75rem' : '0.65rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            {cartao.name}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.5px'
          }}>
            {fmtR(totalUsado)}
          </div>
        </div>
        <div style={{ 
          width: '60px', 
          height: '60px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cartao.id === 'itau' ? (
            <img 
              src="/assets/Itaú_Unibanco_logo_2023.svg.png" 
              alt="Itaú"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          ) : cartao.id === 'porto' ? (
            <img 
              src="/assets/Porto_Seguro_Logo-removebg-preview.png" 
              alt="Porto Seguro"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          ) : cartao.id === 'nubank' ? (
            <img 
              src="/assets/nubank-icon.png" 
              alt="Nubank"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '4px'
              }}
            />
          ) : (
            <BandeiraIcon bandeira={bandeira} />
          )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '1.1rem',
            color: '#ffffff',
            fontWeight: 500,
            letterSpacing: '2px',
            fontFamily: 'monospace',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            marginBottom: '12px'
          }}>
            {numeroCartao}
          </div>
          
          {/* Barra de progresso do limite */}
          {limite > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '4px'
              }}>
                <span>Utilizado: {percentualUsado.toFixed(0)}%</span>
                <span>Disponível: {fmtR(disponivel)}</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(percentualUsado, 100)}%`,
                  height: '100%',
                  background: percentualUsado > 90 ? '#ef4444' : percentualUsado > 70 ? '#f59e0b' : '#10b981',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '2px'
                }}>
                  Fechamento
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  Dia {cartao.fechamento || 5}
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '2px'
                }}>
                  Vencimento
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  Dia {cartao.vencimento || 10}
                </div>
              </div>
            </div>
            
            {limite > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '2px'
                }}>
                  Limite
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  {fmtR(limite)}
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
