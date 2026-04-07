import { fmtR } from '../../utils/helpers.js';

// Componente para exibir a bandeira do cartão
function BandeiraIcon({ bandeira, color }) {
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
        <rect fill={color || '#6366f1'} width="48" height="48" rx="4"/>
        <text x="24" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="20">💳</text>
      </svg>
    )
  };
  
  return bandeiras[bandeira?.toLowerCase()] || bandeiras.default;
}

export default function CartaoCard({ cartao, gastos, curMonth, curYear, isTop }) {
  // Calcular gastos do cartão no período atual
  const gastosCartao = gastos?.filter(g => g.cartao === cartao.id) || [];
  const totalUsado = gastosCartao.reduce((s, g) => s + (g.valor || 0), 0);
  
  // Gerar número do cartão fake baseado no ID
  const numeroCartao = cartao.numero || `**** **** **** ${(cartao.id || '0000').toString().slice(-4).padStart(4, '0')}`;
  
  // Validade
  const validade = cartao.validade || `${String(curMonth).padStart(2, '0')}/${String(curYear).slice(-2)}`;
  
  // Bandeira (visa, mastercard, amex, elo, hipercard)
  const bandeira = cartao.bandeira || 'default';
  
  // Cores do gradiente baseadas na cor do cartão
  const getGradient = (color) => {
    const gradients = {
      '#3b82f6': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
      '#ef4444': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      '#10b981': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      '#f59e0b': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      '#8b5cf6': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
      '#ec4899': 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
      '#06b6d4': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
      '#f97316': 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
    };
    return gradients[color] || `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}bb 100%)`;
  };

  const gradient = getGradient(cartao.color);

  return (
    <div style={{
      background: gradient,
      borderRadius: '20px',
      padding: isTop ? '28px' : '24px',
      minWidth: '340px',
      maxWidth: '400px',
      height: isTop ? '220px' : '160px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: isTop ? 'space-between' : 'flex-start',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header - Saldo e Bandeira */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{
            fontSize: isTop ? '0.75rem' : '0.65rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            {isTop ? 'Saldo Atual' : cartao.name}
          </div>
          {isTop && (
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              {fmtR(totalUsado)}
            </div>
          )}
        </div>
        <div style={{ 
          width: isTop ? '48px' : '36px', 
          height: isTop ? '48px' : '36px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          <BandeiraIcon bandeira={bandeira} color={cartao.color} />
        </div>
      </div>

      {isTop && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '1.1rem',
            color: '#ffffff',
            fontWeight: 500,
            letterSpacing: '2px',
            fontFamily: 'monospace',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            marginBottom: '16px'
          }}>
            {numeroCartao}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '2px'
              }}>
                Validade
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#ffffff',
                fontWeight: 600
              }}>
                {validade}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
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
                fontSize: '0.9rem',
                color: '#ffffff',
                fontWeight: 600
              }}>
                Dia {cartao.vencimento || 10}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
