import { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { FormGroup, FormRow, Input } from '../ui/Form.jsx';

// Lista de ícones disponíveis
const ICONES_DISPONIVEIS = [
  '💳', '💜', '🔵', '💰', '🏦', '💎', '🟢', '🟡', '🟠', '🔴', '⚫', '⚪',
  '🟣', '🟤', '🔷', '🔶', '💙', '💚', '💛', '🧡', '❤️', '🖤', '🤍', '🤎',
  '🏧', '💵', '💶', '💷', '💴', '🪙', '🛒', '🛍️', '🎁', '🎀', '🎊', '🎉'
];

export default function CartaoModal({
  isOpen,
  onClose,
  onSave,
  cartao,
}) {
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#4d9fff');
  const [icone, setIcone] = useState('💳');
  const [iconeImagem, setIconeImagem] = useState('');
  const [vencimento, setVencimento] = useState(10);
  const [fechamento, setFechamento] = useState(5);

  const isEdit = !!id;

  useEffect(() => {
    if (cartao) {
      setId(cartao.id || '');
      setNome(cartao.name || '');
      setCor(cartao.color || '#4d9fff');
      setIcone(cartao.icone || '💳');
      setIconeImagem(cartao.iconeImagem || '');
      setVencimento(cartao.vencimento || 10);
      setFechamento(cartao.fechamento || 5);
    } else if (isOpen) {
      // Novo cartão
      setId('');
      setNome('');
      setCor('#4d9fff');
      setIcone('💳');
      setIconeImagem('');
      setVencimento(10);
      setFechamento(5);
    }
  }, [cartao, isOpen]);

  const handleSave = () => {
    if (!nome.trim()) return;
    
    const cartaoId = id || nome.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    onSave({
      id: cartaoId,
      name: nome.trim(),
      color: cor,
      icone: iconeImagem ? '' : icone,
      iconeImagem: iconeImagem,
      vencimento: parseInt(vencimento) || 10,
      fechamento: parseInt(fechamento) || 5,
    });
    
    onClose();
  };

  const title = isEdit ? '✎ Editar Cartão' : '+ Novo Cartão';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!nome.trim()}>
            {isEdit ? 'Atualizar' : 'Salvar'}
          </Button>
        </>
      )}
    >
      {/* Nome */}
      <FormGroup label="Nome do Cartão *">
        <Input
          type="text"
          placeholder="Ex: Santander"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </FormGroup>

      {/* Cor, Vencimento e Fechamento */}
      <FormRow>
        <FormGroup label="Cor">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              style={{ 
                width: 60, 
                height: 40, 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r2)', 
                padding: 2, 
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '.8rem', color: 'var(--mid)' }}>
              {cor}
            </span>
          </div>
        </FormGroup>

        <FormGroup label="Vencimento">
          <Input
            type="number"
            min="1"
            max="31"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            style={{ width: 100 }}
          />
        </FormGroup>

        <FormGroup label="Fechamento">
          <Input
            type="number"
            min="1"
            max="31"
            value={fechamento}
            onChange={(e) => setFechamento(e.target.value)}
            style={{ width: 100 }}
          />
        </FormGroup>
      </FormRow>

      {/* Ícone */}
      <FormGroup label="Ícone">
        {/* Upload de imagem customizada */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            padding: '8px 12px',
            background: 'var(--s2)',
            borderRadius: 'var(--r2)',
            border: '1px dashed var(--border)',
            cursor: 'pointer',
            fontSize: '.85rem'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setIconeImagem(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{ display: 'none' }}
            />
            📁 Upload de imagem
          </label>
          {iconeImagem && (
            <div style={{ 
              marginTop: 8, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8 
            }}>
              <img 
                src={iconeImagem} 
                alt="Preview" 
                style={{ 
                  width: 32, 
                  height: 32, 
                  objectFit: 'cover',
                  borderRadius: 'var(--r2)',
                  border: '1px solid var(--border)'
                }} 
              />
              <button
                onClick={() => setIconeImagem('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontSize: '.75rem'
                }}
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>
        
        <div style={{ fontSize: '.8rem', color: 'var(--mid)', marginBottom: 8 }}>
          Ou escolha um ícone:
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(9, 1fr)', 
          gap: 8,
          padding: '8px',
          background: 'var(--s2)',
          borderRadius: 'var(--r2)',
          border: '1px solid var(--border)',
          opacity: iconeImagem ? 0.5 : 1
        }}>
          {ICONES_DISPONIVEIS.map((icon) => (
            <button
              key={icon}
              onClick={() => !iconeImagem && setIcone(icon)}
              disabled={!!iconeImagem}
              style={{
                padding: '8px',
                fontSize: '1.3rem',
                background: icone === icon ? 'var(--accent2)' : 'transparent',
                border: icone === icon ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius: 'var(--r2)',
                cursor: iconeImagem ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </FormGroup>

      {/* Preview */}
      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        background: 'var(--s2)', 
        borderRadius: 'var(--r2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        {iconeImagem ? (
          <img 
            src={iconeImagem} 
            alt="Ícone" 
            style={{ 
              width: 32, 
              height: 32, 
              objectFit: 'cover',
              borderRadius: 'var(--r2)',
              border: '1px solid var(--border)'
            }} 
          />
        ) : (
          <span style={{ fontSize: '1.5rem' }}>{icone}</span>
        )}
        <span className="cartao-dot" style={{ 
          background: cor, 
          width: 12, 
          height: 12, 
          borderRadius: '50%',
          display: 'inline-block'
        }}></span>
        <span style={{ fontWeight: 500 }}>
          {nome || 'Nome do Cartão'}
        </span>
        <span style={{ 
          fontSize: '.75rem', 
          color: 'var(--mid)', 
          marginLeft: 'auto' 
        }}>
          Venc: {vencimento} | Fech: {fechamento}
        </span>
      </div>
    </Modal>
  );
}
