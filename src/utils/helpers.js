// ═══════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════

import { CAT_COLORS_DEFAULT, CATS_SISTEMA } from '../constants.js';

// Gera chave Firebase "YYYY_MM" para o par ano/mês
export const mk = (y, m) => `${y}_${String(m).padStart(2, '0')}`;

// Formata número como moeda brasileira: "R$ 1.234,56"
export const fmtR = (v) => 'R$ ' + Math.abs(v || 0).toFixed(2)
  .replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Converte valor brasileiro (com vírgula) para número
export const parseValor = (v) => {
  if (!v || v === '') return 0;
  // Remove pontos de milhar e troca vírgula por ponto
  const clean = String(v).replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Retorna data de hoje no formato "YYYY-MM-DD" (compatível com input type=date)
export const today = () => new Date().toISOString().split('T')[0];

// Formata "YYYY-MM-DD" → "DD/MM/YYYY" para exibição completa
export const fmtDate = (s) => {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};

// Escapa caracteres especiais HTML (protege contra XSS)
export const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Retorna a cor de uma categoria (procura nas extras primeiro, depois nas padrão)
export const getCatColor = (cat, catExtra = []) => {
  const extra = catExtra.find(c => c.nome === cat);
  return extra ? extra.cor : (CAT_COLORS_DEFAULT[cat] || '#94a3b8');
};

// Retorna todas as categorias disponíveis (sistema + personalizadas)
export const getAllCats = (catExtra = []) => [...new Set([...CATS_SISTEMA, ...catExtra.map(c => c.nome)])];

// Calcula o score de saúde financeira
export const calcularHealthScore = (renda, totalGeral, totalParc, limiteParcPct) => {
  let score = 100;
  const pctRenda = renda > 0 ? (totalGeral / renda) * 100 : 0;
  
  if (renda > 0) {
    if (pctRenda > 100) score = 10;
    else if (pctRenda > 90) score = 30;
    else if (pctRenda > 75) score = 55;
    else if (pctRenda > 60) score = 70;
    else if (pctRenda > 45) score = 85;
    else score = 95;
  } else { 
    score = 50; 
  }
  
  if (renda > 0 && totalParc > renda * limiteParcPct) {
    score = Math.max(score - 15, 5);
  }
  
  return score;
};

// Retorna a cor e label baseado no score
export const getHealthInfo = (score) => {
  if (score >= 70) return { cor: 'var(--accent)', label: '✦ Saudável' };
  if (score >= 40) return { cor: 'var(--gold)', label: '⚠ Atenção' };
  return { cor: 'var(--red)', label: '✕ Crítico' };
};
