// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

export const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
export const MESES_S = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Cartões padrão do sistema (podem ser editados pelo usuário)
// Ordem fixa: Itaú LATAM PASS -> Porto Seguro -> Nubank
export const CARTOES_DEFAULT = [
  { id:'itau',   name:'Itaú LATAM PASS', vencimento: 10, fechamento: 5, icone: '💳' },
  { id:'porto',  name:'Porto Seguro',     vencimento: 15, fechamento: 10, icone: '🔵' },
  { id:'nubank', name:'Nubank',           vencimento: 8,  fechamento: 1, icone: '💜' },
];

// Cartões do usuário - exporta os padrão para compatibilidade
export const CARTOES = CARTOES_DEFAULT;

// Cores padrão das categorias do sistema
export const CAT_COLORS_DEFAULT = {
  'Alimentação':'#f59e0b','Mercado':'#10b981','Saúde':'#3b82f6',
  'Lazer':'#8b5cf6','Viagem':'#06b6d4','Pet':'#f97316',
  'Assinaturas':'#64748b','Educação':'#84cc16','Vestuário':'#ec4899',
  'Casa':'#a78bfa','Carro':'#ff6b35','Pensão':'#475569',
  'Moradia':'#7c3aed','Outros':'#94a3b8'
};

// Nomes das categorias do sistema (não podem ser removidas pelo usuário)
export const CATS_SISTEMA = Object.keys(CAT_COLORS_DEFAULT);

// Limite padrão de parcelas como % da renda (30%)
export const LIMITE_PARC_DEFAULT = 0.30;

// Configuração do Firebase
export const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyA8wQazUOpj0GI0qLLZ9Sir0wgVtgEhzT4",
  authDomain:        "financeiro-pessoal-4a6f9.firebaseapp.com",
  databaseURL:       "https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com",
  projectId:         "financeiro-pessoal-4a6f9",
  storageBucket:     "financeiro-pessoal-4a6f9.firebasestorage.app",
  messagingSenderId: "90268413844",
  appId:             "1:90268413844:web:8680846083088a999d6981"
};

// Títulos das páginas
export const PAGE_TITLES = {
  cartoes: 'Cartões',
  debitos: 'Débitos Fixos',
  dashboard: 'Dashboard',
  config: 'Configurações'
};

// Tipos de gráficos para widgets
export const WIDGET_TYPES = {
  pizza: '🍕 Pizza (Doughnut)',
  barras: '📊 Barras Verticais',
  'barras-h': '📉 Barras Horizontais',
  linha: '📈 Linha',
  historico: '📅 Histórico 6 Meses',
  parcelas: '🔗 Parcelamentos'
};

// Tamanhos de fonte disponíveis
export const FONT_SIZES = {
  small: { label: 'Pequeno', base: 12, scale: 0.85 },
  normal: { label: 'Normal', base: 14, scale: 1 },
  large: { label: 'Grande', base: 16, scale: 1.15 },
  xlarge: { label: 'Muito Grande', base: 18, scale: 1.3 }
};

export const FONT_SIZE_DEFAULT = 'normal';

// Escalas de layout disponíveis
export const LAYOUT_SCALES = {
  small: { label: 'Compacto', value: 0.85 },
  normal: { label: 'Padrão', value: 1 },
  large: { label: 'Ampliado', value: 1.15 },
  xlarge: { label: 'Muito Ampliado', value: 1.3 }
};

export const LAYOUT_SCALE_DEFAULT = 'normal';
