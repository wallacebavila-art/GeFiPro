import { useState, useEffect } from 'react';
import { useFirebase } from './hooks/useFirebase.js';
import { useToast } from './context/ToastContext.jsx';
import { useLoading } from './context/LoadingContext.jsx';
import { FONT_SIZES, FONT_SIZE_DEFAULT, CARTOES_DEFAULT } from './constants.js';
import { mk } from './utils/helpers.js';

// Layout components
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import MonthTabs from './components/layout/MonthTabs.jsx';
import BottomNav from './components/layout/BottomNav.jsx';

// Page components
import CartoesPage from './components/pages/CartoesPage.jsx';
import DebitosPage from './components/pages/DebitosPage.jsx';
import DashboardPage from './components/pages/DashboardPage.jsx';
import ConfigPage from './components/pages/ConfigPage.jsx';

// Modal components
import GastoModal from './components/modals/GastoModal.jsx';
import DebitoModal from './components/modals/DebitoModal.jsx';
import CartaoModal from './components/modals/CartaoModal.jsx';
import Modal from './components/ui/Modal.jsx';
import Button from './components/ui/Button.jsx';

// Import all CSS
import './styles/base.css';
import './styles/components.css';
import './styles/cartoes.css';
import './styles/debitos.css';
import './styles/dashboard.css';
import './styles/config.css';
import './styles/modals.css';

function App() {
  // Estado global da aplicação
  const [curYear, setCurYear] = useState(new Date().getFullYear());
  const [curMonth, setCurMonth] = useState(new Date().getMonth() + 1);
  const [curPage, setCurPage] = useState('cartoes');
  const [curCartao, setCurCartao] = useState('itau');
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || FONT_SIZE_DEFAULT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Estado dos modais
  const [gastoModalOpen, setGastoModalOpen] = useState(false);
  const [gastoModalData, setGastoModalData] = useState(null);
  const [gastoModalDuplicate, setGastoModalDuplicate] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);
  
  const [debitoModalOpen, setDebitoModalOpen] = useState(false);
  const [debitoModalData, setDebitoModalData] = useState(null);
  const [debitoModalTipo, setDebitoModalTipo] = useState('normal');

  const [cartaoModalOpen, setCartaoModalOpen] = useState(false);
  const [cartaoModalData, setCartaoModalData] = useState(null);

  // Firebase hook
  const {
    gastos,
    debitos,
    catExtra,
    pagamentos,
    cartoesExtra,
    config,
    fbStats,
    setGastos,
    setDebitos,
    setCatExtra,
    setPagamentos,
    setCartoesExtra,
    loadAll,
    loadGastosPeriodo,
    saveGasto,
    deleteGasto,
    saveDebito,
    deleteDebito,
    togglePagamento,
    saveConfig,
  } = useFirebase();

  const showToast = useToast();
  const showLoading = useLoading();

  // Inicialização
  useEffect(() => {
    async function init() {
      showLoading(true);
      await loadAll(curYear, curMonth);
      showLoading(false);
    }
    init();
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[App] Service Worker registrado:', registration.scope);
        })
        .catch((error) => {
          console.log('[App] Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', temaEscuro ? 'dark' : 'light');
  }, [temaEscuro]);

  // Aplicar tamanho da fonte
  useEffect(() => {
    const size = FONT_SIZES[fontSize] || FONT_SIZES.normal;
    document.documentElement.style.setProperty('--font-size-base', size.base + 'px');
    document.documentElement.style.setProperty('--font-size-scale', size.scale);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Navegação entre páginas
  const handleNavigate = (page) => {
    setCurPage(page);
  };

  // Mudança de mês
  const handleChangeMonth = async (month) => {
    setCurMonth(month);
    showLoading(true);
    
    try {
      const curKey = `${curYear}_${String(month).padStart(2, '0')}`;
      
      const [gSnap, pgSnap] = await Promise.all([
        fetch(`https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/gastos/${curKey}.json`).then(r => r.json()),
        fetch(`https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/pagamentos/${curKey}.json`).then(r => r.json()),
      ]);
      
      const gArr = [];
      if (gSnap) Object.entries(gSnap).forEach(([id, val]) => gArr.push({ id, ...val }));
      setGastos(gArr);
      
      const pObj = pgSnap || {};
      setPagamentos(pObj);
    } catch (e) {
      console.error('Erro ao carregar mês:', e);
      showToast('Erro ao carregar dados: ' + e.message, 'err');
    } finally {
      showLoading(false);
    }
  };

  // Mudança de ano
  const handleChangeYear = async (year) => {
    setCurYear(year);
    showLoading(true);
    try {
      const curKey = mk(year, curMonth);
      console.log('Carregando ano:', year, 'mês:', curMonth, 'chave:', curKey);
      
      const [gSnap, pgSnap] = await Promise.all([
        fetch(`https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/gastos/${curKey}.json`).then(r => r.json()),
        fetch(`https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/pagamentos/${curKey}.json`).then(r => r.json()),
      ]);
      
      console.log('Dados recebidos:', { gastos: gSnap, pagamentos: pgSnap });
      
      const gArr = [];
      if (gSnap) Object.entries(gSnap).forEach(([id, val]) => gArr.push({ id, ...val }));
      setGastos(gArr);
      
      const pObj = pgSnap || {};
      setPagamentos(pObj);
      
      // Recarrega a página após mudar o ano
      window.location.reload();
    } catch (e) {
      console.error('Erro ao carregar ano:', e);
      showToast('Erro ao carregar dados: ' + e.message, 'err');
    } finally {
      showLoading(false);
    }
  };

  // Ações do FAB
  const handleFabClick = () => {
    if (curPage === 'cartoes') {
      setGastoModalData(null);
      setGastoModalDuplicate(false);
      setGastoModalOpen(true);
    } else if (curPage === 'debitos') {
      setDebitoModalData(null);
      setDebitoModalTipo('normal');
      setDebitoModalOpen(true);
    } else if (curPage === 'dashboard') {
      // Nenhuma ação FAB no dashboard após remover widgets
    } else {
      handleNavigate('cartoes');
    }
  };

  // Salvar gasto
  const handleSaveGasto = async (data) => {
    showLoading(true);
    try {
      const curKey = mk(curYear, curMonth);
      
      // Se editando e mudou de mês/ano
      if (data.id && (data.mesDest !== curMonth || data.anoDest !== curYear)) {
        const destKey = mk(data.anoDest, data.mesDest);
        await saveGasto(destKey, { ...data, cartaoDest: data.cartaoDest }, false);
        await deleteGasto(curKey, data.id);
        showToast(`Gasto movido para ${data.mesDest}/${data.anoDest}`);
      } else if (!data.id && data.tipo === 'parcelado' && data.parcela) {
        // Novo gasto parcelado - criar todas as parcelas nos meses seguintes
        const [parcIni, parcTot] = data.parcela.split('/').map(Number);
        
        // Se o valor informado é o total, divide pelo número de parcelas
        // Se já é o valor da parcela, usa diretamente
        const valorBase = data.valorTipo === 'total' 
          ? Math.round((data.valor / parcTot) * 100) / 100 
          : data.valor;
        
        // Criar parcela do mês atual
        await saveGasto(curKey, {
          ...data,
          valor: valorBase,
          parcela: `${parcIni}/${parcTot}`,
          cartaoDest: data.cartaoDest,
        }, false);
        
        // Criar parcelas dos meses seguintes
        let mes = curMonth;
        let ano = curYear;
        
        for (let i = parcIni + 1; i <= parcTot; i++) {
          mes++;
          if (mes > 12) {
            mes = 1;
            ano++;
          }
          const key = mk(ano, mes);
          await saveGasto(key, {
            ...data,
            valor: valorBase,
            parcela: `${i}/${parcTot}`,
            cartaoDest: data.cartaoDest,
          }, false);
        }
        
        showToast(`Gasto parcelado criado: ${parcTot} parcelas de ${valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
      } else if (!data.id && data.tipo === 'recorrente') {
        // Novo gasto recorrente - criar em todos os meses até o ano máximo (curYear + 4)
        const maxYear = curYear + 4;
        let mes = curMonth;
        let ano = curYear;
        let count = 0;
        
        // Cria o gasto recorrente em todos os meses do ano atual até o ano máximo
        while (ano < maxYear || (ano === maxYear && mes <= 12)) {
          const key = mk(ano, mes);
          await saveGasto(key, {
            ...data,
            valor: data.valor,
            cartaoDest: data.cartaoDest,
          }, false);
          count++;
          
          mes++;
          if (mes > 12) {
            mes = 1;
            ano++;
          }
        }
        
        showToast(`Gasto recorrente criado: ${count} meses (${curYear} a ${maxYear})`);
      } else {
        await saveGasto(curKey, data, !!data.id);
        showToast(data.id ? 'Gasto atualizado!' : 'Gasto salvo!');
      }
      
      // Recarrega gastos
      const g = await loadGastosPeriodo(curYear, curMonth);
      setGastos(g);
    } catch (e) {
      showToast('Erro ao salvar', 'err');
    }
    showLoading(false);
  };

  // Editar gasto
  const handleEditGasto = (id, duplicate = false) => {
    const g = gastos.find(x => x.id === id);
    if (g) {
      setGastoModalData(g);
      setGastoModalDuplicate(duplicate);
      setGastoModalOpen(true);
    }
  };

  // Abrir confirmação de delete para gasto parcelado ou recorrente
  const handleDeleteGasto = (id) => {
    const gasto = gastos.find(g => g.id === id);
    
    // Se for parcelado, mostra confirmação de parcelas
    if (gasto && gasto.tipo === 'parcelado' && gasto.parcela) {
      setDeleteConfirmData({ id, gasto, tipo: 'parcelado' });
      setDeleteConfirmOpen(true);
    }
    // Se for recorrente, mostra confirmação de recorrência
    else if (gasto && gasto.tipo === 'recorrente') {
      setDeleteConfirmData({ id, gasto, tipo: 'recorrente' });
      setDeleteConfirmOpen(true);
    }
    else {
      // Deleta direto se não for parcelado nem recorrente
      deleteGastoSimples(id);
    }
  };

  // Deletar gasto simples (não parcelado)
  const deleteGastoSimples = async (id) => {
    showLoading(true);
    try {
      const curKey = mk(curYear, curMonth);
      await deleteGasto(curKey, id);
      setGastos(gastos.filter(g => g.id !== id));
      showToast('Gasto removido');
    } catch (e) {
      showToast('Erro ao deletar', 'err');
    }
    showLoading(false);
  };

  // Deletar apenas este item (parcela ou recorrente do mês atual)
  const deleteItemUnico = async () => {
    if (!deleteConfirmData) return;
    setDeleteConfirmOpen(false);
    await deleteGastoSimples(deleteConfirmData.id);
    setDeleteConfirmData(null);
  };

  // Deletar todas as parcelas restantes
  const deleteTodasParcelas = async () => {
    if (!deleteConfirmData) return;
    const { gasto } = deleteConfirmData;
    const [parcAtual, parcTot] = gasto.parcela.split('/').map(Number);
    
    showLoading(true);
    setDeleteConfirmOpen(false);
    
    try {
      let mes = curMonth;
      let ano = curYear;
      
      // Deletar parcelas a partir da atual até o final
      for (let i = parcAtual; i <= parcTot; i++) {
        const key = mk(ano, mes);
        
        // Busca o gasto no mês específico
        const gastosMes = await loadGastosPeriodo(ano, mes);
        const gastoMes = gastosMes.find(g => 
          g.descricao === gasto.descricao && 
          g.cartao === gasto.cartao && 
          g.tipo === 'parcelado' &&
          g.parcela === `${i}/${parcTot}`
        );
        
        if (gastoMes) {
          await deleteGasto(key, gastoMes.id);
        }
        
        mes++;
        if (mes > 12) {
          mes = 1;
          ano++;
        }
      }
      
      // Recarrega gastos do mês atual
      const g = await loadGastosPeriodo(curYear, curMonth);
      setGastos(g);
      
      showToast(`${parcTot - parcAtual + 1} parcelas removidas`);
    } catch (e) {
      showToast('Erro ao deletar parcelas', 'err');
    }
    
    setDeleteConfirmData(null);
    showLoading(false);
  };

  // Deletar todos os meses de um gasto recorrente
  const deleteTodosRecorrentes = async () => {
    if (!deleteConfirmData) return;
    const { gasto } = deleteConfirmData;
    
    showLoading(true);
    setDeleteConfirmOpen(false);
    
    try {
      const maxYear = curYear + 4;
      let mes = curMonth;
      let ano = curYear;
      let count = 0;
      
      // Deletar recorrências do ano atual até o ano máximo
      while (ano < maxYear || (ano === maxYear && mes <= 12)) {
        const key = mk(ano, mes);
        
        // Busca o gasto recorrente no mês específico
        const gastosMes = await loadGastosPeriodo(ano, mes);
        const gastoMes = gastosMes.find(g => 
          g.descricao === gasto.descricao && 
          g.cartao === gasto.cartao && 
          g.tipo === 'recorrente'
        );
        
        if (gastoMes) {
          await deleteGasto(key, gastoMes.id);
          count++;
        }
        
        mes++;
        if (mes > 12) {
          mes = 1;
          ano++;
        }
      }
      
      // Recarrega gastos do mês atual
      const g = await loadGastosPeriodo(curYear, curMonth);
      setGastos(g);
      
      showToast(`${count} recorrências removidas`);
    } catch (e) {
      showToast('Erro ao deletar recorrências', 'err');
    }
    
    setDeleteConfirmData(null);
    showLoading(false);
  };

  // Salvar débito
  const handleSaveDebito = async (data) => {
    showLoading(true);
    try {
      await saveDebito(data);
      showToast(data.id ? 'Débito atualizado!' : 'Débito salvo!');
      
      // Recarrega débitos
      const dSnap = await fetch('https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com/debitos.json').then(r => r.json());
      const dArr = [];
      if (dSnap) Object.entries(dSnap).forEach(([id, val]) => dArr.push({ id, ...val }));
      setDebitos(dArr);
    } catch (e) {
      showToast('Erro ao salvar', 'err');
    }
    showLoading(false);
  };

  // Abrir modal débito
  const handleAddDebito = (tipo = 'normal') => {
    setDebitoModalData(null);
    setDebitoModalTipo(tipo);
    setDebitoModalOpen(true);
  };

  // Editar débito
  const handleEditDebito = (id) => {
    const d = debitos.find(x => x.id === id);
    if (d) {
      setDebitoModalData(d);
      setDebitoModalTipo(d.tipoPet || 'normal');
      setDebitoModalOpen(true);
    }
  };

  // Deletar débito
  const handleDeleteDebito = async (id) => {
    showLoading(true);
    try {
      await deleteDebito(id);
      setDebitos(debitos.filter(d => d.id !== id));
      showToast('Débito removido');
    } catch (e) {
      showToast('Erro ao deletar', 'err');
    }
    showLoading(false);
  };

  // Toggle pagamento
  const handleTogglePagamento = async (id) => {
    const atual = pagamentos[id] === true;
    const curKey = mk(curYear, curMonth);
    await togglePagamento(curKey, id, atual);
    setPagamentos({ ...pagamentos, [id]: !atual });
    showToast(!atual ? '✓ Marcado como pago' : 'Desmarcado');
  };

  // Salvar config
  const handleSaveConfig = async (key, value) => {
    await saveConfig(key, value);
    showToast('Configuração salva!');
  };

  // Toggle tema
  const handleToggleTheme = async () => {
    const novo = !temaEscuro;
    setTemaEscuro(novo);
    await saveConfig('tema', novo ? 'dark' : 'light');
  };

  // Adicionar categoria
  const handleAddCategoria = async (nome, cor) => {
    const novas = [...catExtra, { nome, cor }];
    await saveConfig('categorias', novas);
    setCatExtra(novas);
    showToast(`Categoria "${nome}" adicionada!`);
  };

  // Remover categoria
  const handleRemoveCategoria = async (idx) => {
    const novas = catExtra.filter((_, i) => i !== idx);
    await saveConfig('categorias', novas);
    setCatExtra(novas);
    showToast('Categoria removida');
  };

  // Adicionar/Editar cartão
  const handleAddCartao = async (nome, cor, icone, iconeImagem, vencimento, fechamento) => {
    const id = nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const novoCartao = { 
      id, 
      name: nome, 
      color: cor, 
      icone: iconeImagem ? '' : (icone || '💳'), 
      iconeImagem: iconeImagem || '',
      vencimento: vencimento || 10,
      fechamento: fechamento || 5
    };
    const novos = [...cartoesExtra, novoCartao];
    await saveConfig('cartoes', novos);
    setCartoesExtra(novos);
    showToast(`Cartão "${nome}" adicionado!`);
  };

  const handleEditCartao = async (cartaoEditado) => {
    const idx = cartoesExtra.findIndex(c => c.id === cartaoEditado.id);
    let novos;
    if (idx >= 0) {
      // Cartão custom existe - atualiza
      novos = [...cartoesExtra];
      novos[idx] = cartaoEditado;
    } else {
      // Cartão padrão sendo editado - adiciona como custom
      novos = [...cartoesExtra, cartaoEditado];
    }
    await saveConfig('cartoes', novos);
    setCartoesExtra(novos);
    showToast(`Cartão "${cartaoEditado.name}" atualizado!`);
  };

  const handleOpenCartaoModal = (cartao = null) => {
    setCartaoModalData(cartao);
    setCartaoModalOpen(true);
  };

  const handleSaveCartao = (cartaoData) => {
    // Se tem ID, é edição (tanto de cartão custom quanto padrão)
    if (cartaoData.id) {
      handleEditCartao(cartaoData);
    } else {
      // Novo cartão
      handleAddCartao(cartaoData.name, cartaoData.color, cartaoData.icone, cartaoData.iconeImagem, cartaoData.vencimento, cartaoData.fechamento);
    }
  };

  // Remover cartão
  const handleRemoveCartao = async (idx) => {
    const novos = cartoesExtra.filter((_, i) => i !== idx);
    await saveConfig('cartoes', novos);
    setCartoesExtra(novos);
    showToast('Cartão removido');
  };
  const handleChangeFontSize = async (novoTamanho) => {
    setFontSize(novoTamanho);
    await saveConfig('fontSize', novoTamanho);
    showToast(`Tamanho da fonte: ${FONT_SIZES[novoTamanho].label}`);
  };
  const handleForceSync = async () => {
    showToast('Sincronizando...', 'warn');
    showLoading(true);
    await loadAll(curYear, curMonth);
    showLoading(false);
    showToast('Sincronizado!');
  };

  // Renderizar página atual
  const renderPage = () => {
    switch (curPage) {
      case 'cartoes':
        return (
          <CartoesPage
            gastos={gastos}
            catExtra={catExtra}
            cartoesExtra={cartoesExtra}
            cartoesDefault={CARTOES_DEFAULT}
            renda={config.renda}
            limiteParcPct={config.limiteParcPct}
            curCartao={curCartao}
            setCurCartao={setCurCartao}
            curMonth={curMonth}
            curYear={curYear}
            onAddExpense={() => {
              setGastoModalData(null);
              setGastoModalDuplicate(false);
              setGastoModalOpen(true);
            }}
            onEditExpense={handleEditGasto}
            onDeleteExpense={handleDeleteGasto}
            loadGastosPeriodo={loadGastosPeriodo}
            onOpenCartaoModal={handleOpenCartaoModal}
            onRemoveCartao={handleRemoveCartao}
          />
        );
      case 'debitos':
        return (
          <DebitosPage
            debitos={debitos}
            pagamentos={pagamentos}
            catExtra={catExtra}
            curMonth={curMonth}
            curYear={curYear}
            onAddDebito={handleAddDebito}
            onEditDebito={handleEditDebito}
            onDeleteDebito={handleDeleteDebito}
            onTogglePagamento={handleTogglePagamento}
            onValorReajuste={() => {}}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            gastos={gastos}
            debitos={debitos}
            renda={config.renda}
            limiteParcPct={config.limiteParcPct}
            curYear={curYear}
            curMonth={curMonth}
          />
        );
      case 'config':
        return (
          <ConfigPage
            renda={config.renda}
            limiteParcPct={config.limiteParcPct}
            temaEscuro={temaEscuro}
            fontSize={fontSize}
            catExtra={catExtra}
            fbStats={fbStats}
            gastos={gastos}
            debitos={debitos}
            curYear={curYear}
            curMonth={curMonth}
            onSaveConfig={handleSaveConfig}
            onToggleTheme={handleToggleTheme}
            onChangeFontSize={handleChangeFontSize}
            onAddCategoria={handleAddCategoria}
            onRemoveCategoria={handleRemoveCategoria}
            onForceSync={handleForceSync}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="app">
      <Sidebar
        curPage={curPage}
        curMonth={curMonth}
        curYear={curYear}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div id="main">
        <Topbar curPage={curPage} />
        {curPage !== 'config' && (
          <MonthTabs 
            curMonth={curMonth} 
            curYear={curYear}
            onChangeMonth={handleChangeMonth}
            onChangeYear={handleChangeYear}
          />
        )}
        <div id="content">
          {renderPage()}
        </div>
        <BottomNav
          curPage={curPage}
          onNavigate={handleNavigate}
          onFabClick={handleFabClick}
        />
      </div>

      {/* Modais */}
      <GastoModal
        isOpen={gastoModalOpen}
        onClose={() => setGastoModalOpen(false)}
        onSave={handleSaveGasto}
        onDelete={handleDeleteGasto}
        gasto={gastoModalData}
        catExtra={catExtra}
        cartoesExtra={cartoesExtra}
        curCartao={curCartao}
        curMonth={curMonth}
        curYear={curYear}
        isDuplicate={gastoModalDuplicate}
      />

      <DebitoModal
        isOpen={debitoModalOpen}
        onClose={() => setDebitoModalOpen(false)}
        onSave={handleSaveDebito}
        onDelete={handleDeleteDebito}
        debito={debitoModalData}
        catExtra={catExtra}
        tipoPet={debitoModalTipo}
        curYear={curYear}
        curMonth={curMonth}
      />

      <CartaoModal
        isOpen={cartaoModalOpen}
        onClose={() => setCartaoModalOpen(false)}
        onSave={handleSaveCartao}
        cartao={cartaoModalData}
      />

      {/* Modal de confirmação de delete de parcela ou recorrente */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={deleteConfirmData?.tipo === 'recorrente' ? '� Excluir Recorrência' : '�📅 Excluir Parcela'}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={deleteItemUnico}>
              Apenas este mês
            </Button>
            <Button onClick={deleteConfirmData?.tipo === 'recorrente' ? deleteTodosRecorrentes : deleteTodasParcelas}>
              {deleteConfirmData?.tipo === 'recorrente' ? 'Todos os meses' : 'Todas as parcelas'}
            </Button>
          </>
        )}
      >
        {deleteConfirmData && (
          <div>
            {deleteConfirmData.tipo === 'recorrente' ? (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Este é um gasto <strong>recorrente</strong> 🔄
                </p>
                <p style={{ marginBottom: '16px', color: 'var(--mid)' }}>
                  Você deseja excluir apenas deste mês ou de todos os meses futuros?
                </p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Este é um gasto parcelado: <strong>{deleteConfirmData.gasto.parcela}</strong>
                </p>
                <p style={{ marginBottom: '16px', color: 'var(--mid)' }}>
                  Você deseja excluir apenas esta parcela ou todas as parcelas restantes?
                </p>
              </>
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--dim)', padding: '12px', background: 'var(--s3)', borderRadius: 'var(--r)', marginTop: '8px' }}>
              <strong>{deleteConfirmData.gasto.descricao}</strong>
              <br />
              Valor: {deleteConfirmData.gasto.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
