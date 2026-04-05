/**
 * Script para popular o ano de 2026 com gastos realistas
 * Execute: node populate2026.mjs
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push } from 'firebase/database';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBzNqg1bRUcWvAGN_EIt4dWpZpkjNNQ9_U",
  authDomain: "financeiro-pessoal-4a6f9.firebaseapp.com",
  databaseURL: "https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com",
  projectId: "financeiro-pessoal-4a6f9",
  storageBucket: "financeiro-pessoal-4a6f9.appspot.com",
  messagingSenderId: "283315277127",
  appId: "1:283315277127:web:1d9c4e1b3b1b1b1b1b1b1b"
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

// Categorias disponíveis
const CATEGORIAS = [
  'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Moradia',
  'Educação', 'Vestuário', 'Tecnologia', 'Serviços', 'Viagem',
  'Presentes', 'Assinaturas', 'Imprevistos', 'Investimentos'
];

// Cartões disponíveis
const CARTOES = ['itau', 'nubank', 'porto'];

// Descrições realistas por categoria
const DESCRICOES = {
  'Alimentação': [
    'Supermercado Pão de Açúcar', 'Mercado Extra', 'Padaria do João',
    'Restaurante Outback', 'Hamburgueria Artesanal', 'Pizzaria Domino\'s',
    'Sushi Plaza', 'Café da manhã Starbucks', 'Ifood - Delivery',
    'Açougue Premium', 'Feira livre', 'Atacadão', 'Mercadinho do bairro'
  ],
  'Transporte': [
    'Posto Shell - Gasolina', 'Posto Ipiranga', 'Estacionamento Shopping',
    'Uber corrida centro', '99 Táxi', 'Pedágio BR-101',
    'Lavagem de carro', 'Mecânico - Revisão', 'Seguro auto mensal',
    'Uber Eats entrega', 'Carro reserva', 'Bilhete único'
  ],
  'Saúde': [
    'Farmácia Drogasil', 'Drogaria Raia', 'Dentista - Limpeza',
    'Consulta médica', 'Exame laboratorial', 'Academia Smart Fit',
    'Plano de saúde mensal', 'Psicólogo', 'Nutricionista',
    'Remédios diversos', 'Óculos de sol', 'Protetor solar'
  ],
  'Lazer': [
    'Cinema Cinemark', 'Netflix mensalidade', 'Spotify Premium',
    'Teatro - Ingressos', 'Show Coldplay', 'Bar com amigos',
    'Churrascaria', 'Boliche', 'Parque temático',
    'Game novo PS5', 'Livros Amazon', 'Hobby modelismo'
  ],
  'Moradia': [
    'Condomínio mensal', 'Conta de luz', 'Conta de água',
    'Internet Vivo Fibra', 'Netflix/Streaming', 'Gás de cozinha',
    'IPTU parcela', 'Seguro residencial', 'Manutenção hidráulica',
    'Jardinagem', 'Limpeza diarista', 'Material de construção'
  ],
  'Educação': [
    'Faculdade mensalidade', 'Curso de inglês', 'Livros didáticos',
    'Material escolar', 'Curso online Udemy', 'Workshop profissional',
    'Certificação', 'Assinatura LinkedIn', 'E-book técnico'
  ],
  'Vestuário': [
    'Camisa Renner', 'Tênis Nike', 'Calça jeans Levi\'s',
    'Vestido Zara', 'Cueca Calvin Klein', 'Meias Pacote',
    'Jaqueta inverno', 'Óculos Ray-Ban', 'Relógio Casio',
    'Mochila', 'Roupas de academia'
  ],
  'Tecnologia': [
    'iPhone novo', 'Notebook Dell', 'Mouse Logitech',
    'Teclado mecânico', 'Fone Bluetooth', 'Carregador rápido',
    'Cabo USB-C', 'HD externo', 'Monitor 4K',
    'Webcam', 'Microfone', 'Placa de vídeo'
  ],
  'Serviços': [
    'Contador mensal', 'Advogado consulta', 'Lavanderia',
    'Manicure', 'Cabeleireiro', 'Barbearia',
    'Conserto celular', 'Chaveiro', 'Dedetização'
  ],
  'Viagem': [
    'Passagem aérea', 'Hotel Booking', 'Aluguel carro viagem',
    'Seguro viagem', 'Passeio turístico', 'Restaurante turístico',
    'Trem bala', 'Ônibus interestadual', 'Airbnb'
  ],
  'Presentes': [
    'Aniversário mãe', 'Dia dos pais', 'Amigo secreto',
    'Casamento amigo', 'Chá de bebê', 'Dia das crianças',
    'Natal família', 'Amigo oculto trabalho'
  ],
  'Assinaturas': [
    'Amazon Prime', 'Disney+', 'HBO Max',
    'YouTube Premium', 'Apple Music', 'Kindle Unlimited',
    'Microsoft 365', 'Adobe Creative', 'GitHub Pro'
  ],
  'Imprevistos': [
    'Multa trânsito', 'Conserto emergencial', 'Consulta urgente',
    'Troca de pneu', 'Pane elétrica', 'Vazamento',
    'Quebra de vidro', 'Objeto perdido'
  ],
  'Investimentos': [
    'Ações compra', 'Fundo imobiliário', 'Cripto Bitcoin',
    'Tesouro IPCA', 'CDB banco', 'Day trade',
    'Day trade - Perda'
  ]
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(month, year) {
  const day = randomInt(1, 28);
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}

function generateValor(min = 20, max = 3000) {
  const valor = randomInt(min, max);
  // Arredonda para valores "realistas"
  if (valor > 1000) return Math.round(valor / 50) * 50;
  if (valor > 200) return Math.round(valor / 10) * 10;
  return valor;
}

function generateExpense(month, year) {
  const categoria = randomChoice(CATEGORIAS);
  const descricoes = DESCRICOES[categoria] || ['Compra diversa'];
  const descricao = randomChoice(descricoes);
  const cartao = randomChoice(CARTOES);
  
  // 15% chance de ser parcelado
  const isParcelado = Math.random() < 0.15;
  
  if (isParcelado) {
    const totalParcelas = randomInt(3, 12);
    const parcelaAtual = randomInt(1, totalParcelas);
    const valorTotal = generateValor(500, 8000);
    const valorParcela = Math.round((valorTotal / totalParcelas) * 100) / 100;
    
    return {
      descricao,
      valor: valorParcela,
      categoria,
      cartao,
      data: randomDate(month, year),
      tipo: 'parcelado',
      parcela: `${parcelaAtual}/${totalParcelas}`,
      valorTotal
    };
  }
  
  // Gasto normal
  let minValor = 30;
  let maxValor = 800;
  
  if (categoria === 'Tecnologia') { minValor = 200; maxValor = 5000; }
  if (categoria === 'Viagem') { minValor = 300; maxValor = 4000; }
  if (categoria === 'Moradia') { minValor = 100; maxValor = 2000; }
  if (categoria === 'Assinaturas') { minValor = 15; maxValor = 100; }
  if (categoria === 'Alimentação') { minValor = 25; maxValor = 600; }
  
  return {
    descricao,
    valor: generateValor(minValor, maxValor),
    categoria,
    cartao,
    data: randomDate(month, year),
    tipo: 'normal'
  };
}

async function populateMonth(year, month) {
  const key = `${year}_${String(month).padStart(2, '0')}`;
  const gastosRef = ref(db, `gastos/${key}`);
  
  // Número de gastos varia por mês (20-45 gastos)
  const numGastos = randomInt(20, 45);
  const gastos = {};
  
  for (let i = 0; i < numGastos; i++) {
    const expense = generateExpense(month, year);
    const id = push(gastosRef).key;
    gastos[id] = expense;
  }
  
  await set(gastosRef, gastos);
  console.log(`✅ Mês ${key}: ${numGastos} gastos adicionados`);
}

async function populate2026() {
  console.log('🚀 Iniciando população do ano 2026...\n');
  
  for (let month = 1; month <= 12; month++) {
    await populateMonth(2026, month);
  }
  
  console.log('\n✨ Ano 2026 completamente preenchido!');
  console.log('Total estimado: ~400-500 gastos');
  process.exit(0);
}

populate2026().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
