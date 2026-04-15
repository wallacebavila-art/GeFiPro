import { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { FormGroup, FormRow, Input, Select } from '../ui/Form.jsx';
import { CARTOES, MESES_S } from '../../constants.js';
import { mk, getAllCats } from '../../utils/helpers.js';

export default function DebitoModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  debito,
  catExtra,
  tipoPet = 'normal',
  curYear,
  curMonth,
}) {
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [dia, setDia] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('ativo');
  const [ateTipo, setAteTipo] = useState('indefinido');
  const [ateMes, setAteMes] = useState(curMonth);
  const [ateAno, setAteAno] = useState(curYear);
  const [tipoPetState, setTipoPetState] = useState(tipoPet);

  const isEdit = !!id;
  const allCats = getAllCats(catExtra);

  useEffect(() => {
    if (debito) {
      setId(debito.id || '');
      setNome(debito.nome || '');
      setValor(debito.valor || '');
      setDia(debito.dia || '');
      setCategoria(debito.categoria || '');
      setStatus(debito.status || 'ativo');
      setAteTipo(debito.ateTipo || 'indefinido');
      setAteMes(debito.ateMes || curMonth);
      setAteAno(debito.ateAno || curYear);
      setTipoPetState(debito.tipoPet || tipoPet);
    } else {
      resetForm();
    }
  }, [debito, tipoPet, isOpen]);

  const resetForm = () => {
    setId('');
    setNome('');
    setValor('');
    setDia('');
    setCategoria('');
    setStatus('ativo');
    setAteTipo('indefinido');
    setAteMes(curMonth);
    setAteAno(curYear);
    setTipoPetState(tipoPet);
  };

  const handleSave = () => {
    if (!nome) return;
    
    onSave({
      id,
      nome,
      valor: parseFloat(valor) || 0,
      dia: parseInt(dia) || null,
      categoria,
      status,
      tipoPet: tipoPetState,
      ateTipo,
      ateMes: ateTipo === 'definido' ? ateMes : null,
      ateAno: ateTipo === 'definido' ? ateAno : null,
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
  for (let y = curYear; y <= curYear + 15; y++) years.push(y);

  const title = isEdit 
    ? (tipoPetState === 'bob' ? '🐕 Editar Gasto do Bob' : '✎ Editar Débito Fixo')
    : (tipoPet === 'bob' ? '🐕 Gasto do Bob' : '+ Novo Débito Fixo');

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
          <Button onClick={handleSave}>Salvar</Button>
        </>
      )}
    >
      <input type="hidden" value={id} />
      <input type="hidden" value={tipoPetState} />

      <FormGroup label="Nome *">
        <Input
          type="text"
          placeholder="Ex: Financiamento Carro"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </FormGroup>

      <FormRow>
        <FormGroup label="Valor (R$) *">
          <Input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Dia de Vencimento">
          <Input
            type="number"
            min="1"
            max="31"
            inputMode="numeric"
            placeholder="Ex: 10"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <FormGroup label="Categoria">
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Selecionar...</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </FormGroup>

      <FormGroup label="Status">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ativo">Ativo</option>
          <option value="pausado">Pausado</option>
          <option value="encerrado">Encerrado</option>
        </Select>
      </FormGroup>

      <FormGroup label="Até Quando?">
        <Select value={ateTipo} onChange={(e) => setAteTipo(e.target.value)}>
          <option value="indefinido">Indefinido (sem data de fim)</option>
          <option value="definido">Data definida de encerramento</option>
        </Select>
      </FormGroup>

      {ateTipo === 'definido' && (
        <FormRow>
          <FormGroup label="Mês de Encerramento">
            <Select value={ateMes} onChange={(e) => setAteMes(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{MESES_S[i]}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Ano de Encerramento">
            <Select value={ateAno} onChange={(e) => setAteAno(parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </FormGroup>
        </FormRow>
      )}
    </Modal>
  );
}
