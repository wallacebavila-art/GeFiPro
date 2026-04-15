import { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { FormGroup, FormRow, Input, Select, TextArea } from '../ui/Form.jsx';
import { today, getAllCats, parseValor } from "../../utils/helpers.js";
import { CARTOES } from "../../constants.js";

// Helper para criar data baseada no mês/ano selecionado (dia 1º por padrão)
const getDefaultDateForMonth = (year, month) => {
  const d = new Date(year, month - 1, 1);
  return d.toISOString().split('T')[0];
};

export default function GastoModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  gasto,
  catExtra,
  cartoesExtra,
  curCartao,
  curMonth,
  curYear,
  isDuplicate = false,
}) {
  const [id, setId] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(getDefaultDateForMonth(curYear, curMonth));
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [notas, setNotas] = useState('');
  const [tipo, setTipo] = useState('normal');
  const [parcIni, setParcIni] = useState(1);
  const [parcTot, setParcTot] = useState(6);
  const [valorTipo, setValorTipo] = useState('total'); // 'total' ou 'parcela'
  const [mesDest, setMesDest] = useState(curMonth);
  const [anoDest, setAnoDest] = useState(curYear);
  const [cartaoDest, setCartaoDest] = useState(curCartao === 'todos' ? '' : curCartao);
  const [erro, setErro] = useState('');

  const isEdit = !!id && !isDuplicate;
  const allCats = getAllCats(catExtra);
  
  // Combina cartões padrão com cartões personalizados, removendo duplicados por ID
  const todosCartoes = useMemo(() => {
    const customIds = new Set((cartoesExtra || []).map(c => c.id));
    const defaultsFiltered = CARTOES.filter(c => !customIds.has(c.id));
    return [...defaultsFiltered, ...(cartoesExtra || [])];
  }, [cartoesExtra]);

  useEffect(() => {
    if (gasto) {
      setId(gasto.id || '');
      setValor(gasto.valor || '');
      setData(gasto.data || getDefaultDateForMonth(curYear, curMonth));
      setDescricao(gasto.descricao || '');
      setCategoria(gasto.categoria || '');
      setNotas(gasto.notas || '');
      setTipo(gasto.tipo || 'normal');
      setCartaoDest(gasto.cartao || curCartao);
      if (gasto.parcela) {
        const [ini, tot] = gasto.parcela.split('/');
        setParcIni(parseInt(ini) || 1);
        setParcTot(parseInt(tot) || 6);
      }
    } else if (isOpen) {
      // Modal opened for new expense - reset form and use current card
      setId('');
      setValor('');
      setData(getDefaultDateForMonth(curYear, curMonth));
      setDescricao('');
      setCategoria('');
      setNotas('');
      setTipo('normal');
      setParcIni(1);
      setParcTot(6);
      setValorTipo('total');
      setMesDest(curMonth);
      setAnoDest(curYear);
      setCartaoDest(curCartao === 'todos' ? '' : curCartao);
    }
  }, [gasto, curCartao, isOpen, curMonth, curYear]);

  const resetForm = () => {
    setId('');
    setValor('');
    setData(getDefaultDateForMonth(curYear, curMonth));
    setDescricao('');
    setCategoria('');
    setNotas('');
    setTipo('normal');
    setParcIni(1);
    setParcTot(6);
    setValorTipo('total');
    setMesDest(curMonth);
    setAnoDest(curYear);
    setCartaoDest(curCartao === 'todos' ? '' : curCartao);
    setErro('');
  };

  const handleSave = () => {
    console.log('handleSave called:', { valor, descricao, data, cartaoDest, valorTipo });
    
    // Validações obrigatórias
    if (curCartao === 'todos') {
      setErro('Não é possível criar gasto na visão "Todos". Selecione um cartão específico.');
      return;
    }
    
    if (!cartaoDest) {
      setErro('Selecione o cartão do gasto.');
      return;
    }
    if (!data) {
      setErro('Informe a data do gasto.');
      return;
    }
    if (!valor || parseValor(valor) <= 0) {
      setErro('Informe um valor válido para o gasto.');
      return;
    }
    if (!categoria) {
      setErro('Selecione a categoria do gasto.');
      return;
    }
    if (!tipo) {
      setErro('Selecione o tipo do gasto.');
      return;
    }
    
    // Limpa erro antes de salvar
    setErro('');
    
    // Passa o valor bruto e deixa o App.jsx fazer os cálculos
    onSave({
      id: isDuplicate ? '' : id,
      valor: parseValor(valor),
      data,
      descricao,
      categoria,
      notas,
      tipo,
      parcela: tipo === 'parcelado' ? `${parcIni}/${parcTot}` : '',
      valorTipo,  // 'total' ou 'parcela' - importante para o cálculo no App.jsx
      mesDest,
      anoDest,
      cartaoDest,
    });
    
    if (!isEdit) resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (id) {
      onDelete(id);
      onClose();
    }
  };

  const years = [];
  for (let y = curYear - 2; y <= curYear + 2; y++) years.push(y);

  const title = isEdit ? '✎ Editar Gasto' : isDuplicate ? `⧉ Duplicar: ${descricao}` : '+ Novo Gasto';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={(
        <>
          {isEdit && (
            <Button variant="danger" onClick={handleDelete}>Deletar</Button>
          )}
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Atualizar' : isDuplicate ? 'Salvar Cópia' : 'Salvar'}
          </Button>
        </>
      )}
    >
      {erro && (
        <div style={{ 
          background: 'var(--danger-bg, rgba(239, 68, 68, 0.1))', 
          color: 'var(--danger, #ef4444)', 
          padding: '12px 16px', 
          borderRadius: 'var(--r, 8px)', 
          marginBottom: '16px',
          fontSize: '0.9rem'
        }}>
          ⚠️ {erro}
        </div>
      )}
      <input type="hidden" value={id} />

      {/* Seletor do tipo de gasto */}
      <FormGroup label="Tipo de Gasto *">
        <div className="tipo-selector">
          <div 
            className={`tipo-opt ${tipo === 'normal' ? 'active' : ''}`}
            onClick={() => setTipo('normal')}
          >
            <span className="tipo-icon">💳</span>Normal
          </div>
          <div 
            className={`tipo-opt ${tipo === 'parcelado' ? 'active' : ''}`}
            onClick={() => setTipo('parcelado')}
          >
            <span className="tipo-icon">📅</span>Parcelado
          </div>
          <div 
            className={`tipo-opt ${tipo === 'recorrente' ? 'active' : ''}`}
            onClick={() => setTipo('recorrente')}
          >
            <span className="tipo-icon">🔄</span>Recorrente
          </div>
        </div>
      </FormGroup>

      {/* Valor e data */}
      <FormRow>
        <FormGroup label="Valor (R$) *">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Data *">
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </FormGroup>
      </FormRow>

      {/* Mês/Ano destino (edição) */}
      {isEdit && (
        <FormRow>
          <FormGroup label="Mês de Destino">
            <Select value={mesDest} onChange={(e) => setMesDest(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][i]}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Ano de Destino">
            <Select value={anoDest} onChange={(e) => setAnoDest(parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </FormGroup>
        </FormRow>
      )}

      {/* Descrição */}
      <FormGroup label="Descrição *">
        <Input
          type="text"
          placeholder="Ex: Mercado Extra"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </FormGroup>

      {/* Categoria */}
      <FormGroup label="Categoria *">
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Selecionar...</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </FormGroup>

      {/* Cartão */}
      <FormGroup label="Cartão *">
        <Select value={cartaoDest} onChange={(e) => setCartaoDest(e.target.value)}>
          <option value="">Selecionar...</option>
          {todosCartoes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormGroup>

      {/* Notas */}
      <FormGroup label="Notas (opcional)">
        <TextArea
          placeholder="Ex: presente aniversário da Manu..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </FormGroup>

      {/* Campos de parcelamento */}
      {tipo === 'parcelado' && (
        <div id="g-parc-fields">
          {/* Toggle valor total vs parcela */}
          <FormGroup label="Tipo de Valor">
            <div className="tipo-selector" style={{ marginBottom: '8px' }}>
              <div 
                className={`tipo-opt ${valorTipo === 'total' ? 'active' : ''}`}
                onClick={() => setValorTipo('total')}
              >
                <span className="tipo-icon">💰</span>Valor Total
              </div>
              <div 
                className={`tipo-opt ${valorTipo === 'parcela' ? 'active' : ''}`}
                onClick={() => setValorTipo('parcela')}
              >
                <span className="tipo-icon">📋</span>Valor da Parcela
              </div>
            </div>
            <div className="info-block" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {valorTipo === 'total' 
                ? `O valor será dividido em ${parcTot} parcelas de ${(parseValor(valor || 0) / parcTot).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                : `Cada parcela terá o valor de ${parseValor(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              }
            </div>
          </FormGroup>

          <FormRow>
            <FormGroup label="Parcela Inicial">
              <Input
                type="number"
                min="1"
                inputMode="numeric"
                value={parcIni}
                onChange={(e) => setParcIni(parseInt(e.target.value) || 1)}
              />
            </FormGroup>
            <FormGroup label="Total de Parcelas">
              <Input
                type="number"
                min="2"
                inputMode="numeric"
                value={parcTot}
                onChange={(e) => setParcTot(parseInt(e.target.value) || 6)}
              />
            </FormGroup>
          </FormRow>
          <div className="info-block">
            ✦ As parcelas seguintes são criadas automaticamente nos meses seguintes do Firebase.
          </div>
        </div>
      )}

      {/* Info tipo recorrente */}
      {tipo === 'recorrente' && (
        <div className="info-block">
          🔄 Gasto recorrente — valor fixo mensal sem data de encerramento.
        </div>
      )}
    </Modal>
  );
}
