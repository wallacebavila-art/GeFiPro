import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import cors from 'cors';

// Firebase config (mesmo do projeto)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA8wQazUOpj0GI0qLLZ9Sir0wgVtgEhzT4",
  authDomain: "financeiro-pessoal-4a6f9.firebaseapp.com",
  databaseURL: "https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com",
  projectId: "financeiro-pessoal-4a6f9",
  storageBucket: "financeiro-pessoal-4a6f9.firebasestorage.app",
  messagingSenderId: "90268413844",
  appId: "1:90268413844:web:8680846083088a999d6981"
};

// Initialize Firebase
const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(firebaseApp);

// Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper para gerar chave Firebase "YYYY_MM"
const mk = (y, m) => `${y}_${String(m).padStart(2, '0')}`;

// Endpoint para receber gastos do Make
app.post('/api/expenses', async (req, res) => {
  try {
    console.log('[API] Recebendo gasto:', req.body);
    
    const { valor, descricao, categoria, cartao, data, tipo, notas } = req.body;
    
    // Validações
    if (!valor || !descricao || !cartao || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campos obrigatórios: valor, descricao, cartao, data' 
      });
    }

    // Determinar mês e ano da data
    const dateObj = new Date(data);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    
    // Gerar chave do período
    const curKey = mk(year, month);
    
    // Preparar dados do gasto
    const gastoData = {
      valor: parseFloat(valor),
      descricao,
      categoria: categoria || 'Outros',
      cartao,
      data,
      tipo: tipo || 'normal',
      notas: notas || '',
      createdAt: new Date().toISOString()
    };

    // Se for parcelado, adicionar info de parcela
    if (tipo === 'parcelado' && req.body.parcela) {
      gastoData.parcela = req.body.parcela;
    }

    // Salvar no Firebase
    const gastosRef = ref(db, `gastos/${curKey}`);
    const newGastoRef = push(gastosRef);
    await set(newGastoRef, gastoData);

    console.log('[API] Gasto salvo com sucesso:', newGastoRef.key);
    
    res.json({ 
      success: true, 
      id: newGastoRef.key,
      message: 'Gasto salvo com sucesso',
      periodo: curKey
    });
    
  } catch (error) {
    console.error('[API] Erro ao salvar gasto:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/expenses`);
});
