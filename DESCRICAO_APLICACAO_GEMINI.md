# Descrição da Aplicação GeFiPro

## O que é o GeFiPro?

O GeFiPro é um sistema de gestão financeira pessoal desenvolvido em React que permite controlar gastos de cartão de crédito, débitos fixos e visualizar o dashboard financeiro.

## Funcionalidades Principais

### 1. Gestão de Gastos por Cartão
- Cadastro de gastos em múltiplos cartões de crédito
- Suporte a 3 cartões padrão: Itaú LATAM PASS, Porto Seguro, Nubank
- Possibilidade de adicionar cartões personalizados
- Categorização automática de gastos

### 2. Tipos de Gastos
- **Normal:** Gasto único no mês
- **Parcelado:** Gasto dividido em várias parcelas (cria automaticamente nos meses seguintes)
- **Recorrente:** Gasto que se repete mensalmente sem data de encerramento

### 3. Débitos Fixos
- Contas mensais fixas (aluguel, internet, etc.)
- Controle de pagamento (marcado/não marcado)
- Suporte a débitos de pets com data de encerramento

### 4. Dashboard
- Visualização de gastos por categoria
- Gráficos de distribuição
- Resumo financeiro do mês
- Health score (saúde financeira)

### 5. Configurações
- Personalização de categorias
- Edição de cartões (vencimento, fechamento, ícone)
- Tema claro/escuro
- Tamanho de fonte ajustável
- Escala de layout

## Arquitetura Técnica

### Frontend
- **Framework:** React 18 + Vite 5
- **Estilização:** CSS customizado com variáveis CSS
- **Gráficos:** Chart.js + react-chartjs-2
- **Animações:** Framer Motion
- **PWA:** Service Worker para cache e offline

### Backend
- **Banco de Dados:** Firebase Realtime Database
- **URL:** https://financeiro-pessoal-4a6f9-default-rtdb.firebaseio.com
- **Estrutura de Dados:**
  - `gastos/{ano_mes}/{id}` - Gastos por período
  - `debitos/{id}` - Débitos fixos
  - `config/{key}` - Configurações do usuário
  - `pagamentos/{ano_mes}/{id}` - Status de pagamentos

### Estrutura de Gasto no Firebase
```json
{
  "valor": 150.00,
  "descricao": "Mercado Extra",
  "categoria": "Alimentação",
  "cartao": "itau",
  "data": "2026-01-15",
  "tipo": "normal",
  "parcela": "1/6",  // opcional, apenas se parcelado
  "notas": ""        // opcional
}
```

## Cartões Disponíveis

- **itau** - Itaú LATAM PASS (vencimento: dia 10, fechamento: dia 5)
- **porto** - Porto Seguro (vencimento: dia 15, fechamento: dia 10)
- **nubank** - Nubank (vencimento: dia 8, fechamento: dia 1)

## Categorias Padrão

Alimentação, Mercado, Saúde, Lazer, Viagem, Pet, Assinaturas, Educação, Vestuário, Casa, Carro, Pensão, Moradia, Outros

## Integração com Make + iPhone Shortcuts

### Objetivo
Capturar gastos do cartão Itau (via Apple Pay) e salvar automaticamente no sistema.

### Fluxo Atual
1. Usuário paga com Apple Pay no iPhone
2. Recebe notificação do app Itau
3. Shortcuts detecta/processa a notificação
4. Envia dados para o Make via webhook
5. Make processa e envia para API do GeFiPro
6. API salva no Firebase
7. Gasto aparece no site

### Endpoint da API
- **URL local:** http://localhost:3001/api/expenses
- **Método:** POST
- **Body:** JSON com dados do gasto

### Exemplo de Requisição
```json
{
  "valor": "150.00",
  "descricao": "Mercado Extra",
  "categoria": "Alimentação",
  "cartao": "itau",
  "data": "2026-01-15",
  "tipo": "normal"
}
```

## Arquivos do Projeto

### Frontend
- `src/App.jsx` - Componente principal
- `src/hooks/useFirebase.js` - Hook para integração Firebase
- `src/components/pages/` - Páginas (CartoesPage, DashboardPage, etc.)
- `src/components/modals/` - Modais (GastoModal, DebitoModal)
- `src/constants.js` - Constantes e configurações

### Backend (Novo)
- `server.js` - Servidor Express com endpoint para Make
- `package.json` - Dependências (incluindo express, cors)

## Contexto da Integração

O usuário já configurou o Shortcuts do iPhone com o Make e está funcionando. Agora precisa configurar o Make para enviar os dados para a API do GeFiPro, que salva automaticamente no Firebase.

O servidor Express foi criado para receber os dados do Make e persistir no Firebase usando a mesma estrutura de dados que o frontend utiliza.
