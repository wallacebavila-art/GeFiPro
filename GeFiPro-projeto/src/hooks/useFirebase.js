import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, remove, update, onValue } from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants.js';

// Inicialização do Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

export function useFirebase() {
  // Inicializa estados vazios - sempre carrega do Firebase
  const [gastos, setGastos] = useState([]);
  const [debitos, setDebitos] = useState([]);
  const [catExtra, setCatExtra] = useState([]);
  const [cartoesExtra, setCartoesExtra] = useState([]);
  const [pagamentos, setPagamentos] = useState({});
  const [config, setConfig] = useState({
    renda: 0,
    limiteParcPct: 0.30,
    tema: 'dark',
  });
  const [fbStats, setFbStats] = useState({ reads: 0, writes: 0, lastSync: null });
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Monitorar conexão
  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    return onValue(connectedRef, (snap) => {
      setConnected(snap.val());
    });
  }, []);

  // Carregar dados de um período específico
  const loadGastosPeriodo = useCallback(async (year, month) => {
    const key = `${year}_${String(month).padStart(2, '0')}`;
    const snap = await get(ref(db, `gastos/${key}`));
    setFbStats(prev => ({ ...prev, reads: prev.reads + 1 }));
    const arr = [];
    if (snap.exists()) {
      snap.forEach(c => arr.push({ id: c.key, ...c.val() }));
    }
    return arr;
  }, []);

  // Carregar todos os dados
  const loadAll = useCallback(async (curYear, curMonth, silent = false) => {
    const curKey = `${curYear}_${String(curMonth).padStart(2, '0')}`;
    
    if (!silent) setIsLoading(true);
    
    console.log('[loadAll] Carregando dados para:', curKey);
    
    try {
      // Usar fetch igual ao handleChangeMonth para consistência
      const [gSnap, dSnap, cfgSnap, pgSnap] = await Promise.all([
        fetch(`https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/gastos/${curKey}.json`).then(r => r.json()),
        fetch('https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/debitos.json').then(r => r.json()),
        fetch('https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/config.json').then(r => r.json()),
        fetch(`https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/pagamentos/${curKey}.json`).then(r => r.json()),
      ]);

      setFbStats(prev => ({ ...prev, reads: prev.reads + 4, lastSync: new Date() }));

      // Processa gastos
      const gArr = [];
      if (gSnap) Object.entries(gSnap).forEach(([id, val]) => gArr.push({ id, ...val }));
      console.log('[loadAll] Gastos carregados:', gArr.length);
      setGastos(gArr);

      // Processa débitos
      const dArr = [];
      if (dSnap) Object.entries(dSnap).forEach(([id, val]) => dArr.push({ id, ...val }));
      setDebitos(dArr);

      // Processa config
      let newConfig = {
        renda: 0,
        limiteParcPct: 0.30,
        tema: 'dark',
      };
      if (cfgSnap) {
        newConfig = {
          renda: cfgSnap.renda || 0,
          limiteParcPct: cfgSnap.limiteParcPct || 0.30,
          tema: cfgSnap.tema || 'dark',
          categorias: cfgSnap.categorias || [],
        };
        setConfig(newConfig);
        setCatExtra(cfgSnap.categorias || []);
        setCartoesExtra(cfgSnap.cartoes || []);
      }

      // Processa pagamentos
      const pObj = pgSnap || {};
      setPagamentos(pObj);

      return { gastos: gArr, debitos: dArr, config: newConfig, pagamentos: pObj };
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Salvar gasto
  const saveGasto = useCallback(async (curKey, gastoData, isEdit = false) => {
    const dados = {
      valor: gastoData.valor,
      descricao: gastoData.descricao,
      data: gastoData.data,
      categoria: gastoData.categoria,
      cartao: gastoData.cartaoDest,
      tipo: gastoData.tipo,
      notas: gastoData.notas,
      parcela: gastoData.parcela,
    };

    if (isEdit && gastoData.id) {
      await update(ref(db, `gastos/${curKey}/${gastoData.id}`), dados);
    } else {
      await push(ref(db, `gastos/${curKey}`), dados);
    }
    setFbStats(prev => ({ ...prev, writes: prev.writes + 1, lastSync: new Date() }));
  }, []);

  // Deletar gasto
  const deleteGasto = useCallback(async (curKey, id) => {
    await remove(ref(db, `gastos/${curKey}/${id}`));
    setFbStats(prev => ({ ...prev, writes: prev.writes + 1 }));
  }, []);

  // Salvar débito
  const saveDebito = useCallback(async (debitoData) => {
    const dados = {
      nome: debitoData.nome,
      valor: debitoData.valor,
      dia: debitoData.dia,
      categoria: debitoData.categoria,
      status: debitoData.status,
      tipoPet: debitoData.tipoPet,
      ateTipo: debitoData.ateTipo,
      ateMes: debitoData.ateMes,
      ateAno: debitoData.ateAno,
    };

    if (debitoData.id) {
      await update(ref(db, `debitos/${debitoData.id}`), dados);
    } else {
      await push(ref(db, 'debitos'), dados);
    }
    setFbStats(prev => ({ ...prev, writes: prev.writes + 1, lastSync: new Date() }));
  }, []);

  // Deletar débito
  const deleteDebito = useCallback(async (id) => {
    await remove(ref(db, `debitos/${id}`));
    setFbStats(prev => ({ ...prev, writes: prev.writes + 1 }));
  }, []);

  // Toggle pagamento
  const togglePagamento = useCallback(async (curKey, id, atual) => {
    await set(ref(db, `pagamentos/${curKey}/${id}`), !atual);
    setFbStats(prev => ({ ...prev, writes: prev.writes + 1 }));
  }, []);

  // Salvar config
  const saveConfig = useCallback(async (key, value) => {
    await set(ref(db, `config/${key}`), value);
    setFbStats(prev => ({ ...prev, writes: prev.writes + 1, lastSync: new Date() }));
  }, []);

  return {
    db,
    gastos,
    debitos,
    catExtra,
    cartoesExtra,
    pagamentos,
    config,
    fbStats,
    connected,
    isLoading,
    setGastos,
    setDebitos,
    setCatExtra,
    setCartoesExtra,
    setPagamentos,
    setConfig,
    loadAll,
    loadGastosPeriodo,
    saveGasto,
    deleteGasto,
    saveDebito,
    deleteDebito,
    togglePagamento,
    saveConfig,
  };
}
