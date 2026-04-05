import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, remove, update, onValue } from 'firebase/database';
import { FIREBASE_CONFIG } from '../constants.js';

// Inicialização do Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

// Helper para localStorage com prefixo
const CACHE_KEY = 'fin_cache_v1';
const saveToCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      _timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Erro ao salvar cache:', e);
  }
};

const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      // Verifica se cache tem menos de 7 dias
      const isValid = data._timestamp && (Date.now() - data._timestamp) < 7 * 24 * 60 * 60 * 1000;
      return isValid ? data : null;
    }
  } catch (e) {
    console.warn('Erro ao carregar cache:', e);
  }
  return null;
};

export function useFirebase() {
  // Inicializa estados com dados do cache (se existir)
  const cached = loadFromCache();
  
  const [gastos, setGastos] = useState(cached?.gastos || []);
  const [debitos, setDebitos] = useState(cached?.debitos || []);
  const [catExtra, setCatExtra] = useState(cached?.catExtra || []);
  const [cartoesExtra, setCartoesExtra] = useState(cached?.cartoesExtra || []);
  const [pagamentos, setPagamentos] = useState(cached?.pagamentos || {});
  const [config, setConfig] = useState(cached?.config || {
    renda: 0,
    limiteParcPct: 0.30,
    tema: 'dark',
  });
  const [fbStats, setFbStats] = useState({ reads: 0, writes: 0, lastSync: cached?._timestamp ? new Date(cached._timestamp) : null });
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
    
    try {
      const [gSnap, dSnap, cfgSnap, pgSnap] = await Promise.all([
        get(ref(db, `gastos/${curKey}`)),
        get(ref(db, 'debitos')),
        get(ref(db, 'config')),
        get(ref(db, `pagamentos/${curKey}`)),
      ]);

      setFbStats(prev => ({ ...prev, reads: prev.reads + 4, lastSync: new Date() }));

      // Processa gastos
      const gArr = [];
      if (gSnap.exists()) gSnap.forEach(c => gArr.push({ id: c.key, ...c.val() }));
      setGastos(gArr);

      // Processa débitos
      const dArr = [];
      if (dSnap.exists()) dSnap.forEach(c => dArr.push({ id: c.key, ...c.val() }));
      setDebitos(dArr);

      // Processa config
      let newConfig = config;
      if (cfgSnap.exists()) {
        const cfg = cfgSnap.val();
        newConfig = {
          renda: cfg.renda || 0,
          limiteParcPct: cfg.limiteParcPct || 0.30,
          tema: cfg.tema || 'dark',
          categorias: cfg.categorias || [],
        };
        setConfig(newConfig);
        setCatExtra(cfg.categorias || []);
        setCartoesExtra(cfg.cartoes || []);
      }

      // Processa pagamentos
      const pObj = {};
      if (pgSnap.exists()) pgSnap.forEach(c => { pObj[c.key] = c.val(); });
      setPagamentos(pObj);

      // Salva tudo no cache
      saveToCache({
        gastos: gArr,
        debitos: dArr,
        catExtra: cfgSnap.val()?.categorias || [],
        cartoesExtra: cfgSnap.val()?.cartoes || [],
        pagamentos: pObj,
        config: newConfig,
      });

      return { gastos: gArr, debitos: dArr, config: newConfig, pagamentos: pObj };
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [config]);

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

  // Limpar cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('Cache local limpo');
    } catch (e) {
      console.warn('Erro ao limpar cache:', e);
    }
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
    clearCache,
  };
}
