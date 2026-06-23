# Integração Make → GeFiPro

## Visão Geral

Este guia explica como configurar o Make para enviar gastos do iPhone (via Shortcuts) para o seu site GeFiPro automaticamente.

## Arquitetura

```
iPhone (Shortcuts) → Make (Webhook) → API GeFiPro → Firebase
```

## Passo 1: Iniciar o Servidor

No terminal, na pasta do projeto:

```bash
npm run server
```

O servidor vai rodar em `http://localhost:3001`

## Passo 2: Configurar o Make

### 2.1 Criar Webhook no Make

1. Acesse [make.com](https://make.com)
2. Crie um novo scenario
3. Adicione trigger **Webhooks**
4. Escolha **Custom webhook**
5. Dê um nome (ex: "Gastos Itau")
6. Copie a URL gerada pelo Make

### 2.2 Configurar o Scenario

Adicione os seguintes módulos:

**Módulo 1: Webhooks (Trigger)**
- Já configurado acima

**Módulo 2: HTTP (Request)**
- URL: `http://localhost:3001/api/expenses`
- Method: `POST`
- Headers:
  - `Content-Type`: `application/json`
- Body (JSON):
  ```json
  {
    "valor": "{{valor}}",
    "descricao": "{{descricao}}",
    "categoria": "{{categoria}}",
    "cartao": "{{cartao}}",
    "data": "{{data}}",
    "tipo": "{{tipo}}",
    "notas": "{{notas}}"
  }
  ```

### 2.3 Mapear Variáveis do Shortcuts

No iPhone Shortcuts, envie para o webhook do Make:

```json
{
  "valor": "150.00",
  "descricao": "Mercado Extra",
  "categoria": "Alimentação",
  "cartao": "itau",
  "data": "2026-01-15",
  "tipo": "normal",
  "notas": "Apple Pay"
}
```

## Passo 3: Configurar o Shortcut no iPhone

### 3.1 Criar Shortcut

1. Abra o app **Shortcuts** no iPhone
2. Crie um novo atalho
3. Adicione as ações:

**Ação 1: Pedir Input**
- Pedir: "Valor"
- Tipo: Número

**Ação 2: Pedir Input**
- Pedir: "Descrição"
- Tipo: Texto

**Ação 3: Selecionar**
- Lista de categorias: Alimentação, Mercado, Saúde, Lazer, etc.

**Ação 4: Selecionar**
- Lista de cartões: itau, porto, nubank

**Ação 5: Obter Data Atual**
- Formato: YYYY-MM-DD

**Ação 6: Obter Conteúdo da URL**
- URL: [URL do seu webhook do Make]
- Método: POST
- Headers: Content-Type = application/json
- Corpo da requisição: JSON com os dados acima

### 3.2 Exemplo de JSON para o Shortcut

```json
{
  "valor": "150.00",
  "descricao": "Mercado Extra",
  "categoria": "Alimentação",
  "cartao": "itau",
  "data": "2026-01-15",
  "tipo": "normal",
  "notas": ""
}
```

## Passo 4: Testar

1. Inicie o servidor: `npm run server`
2. Ative o scenario no Make
3. Execute o Shortcut no iPhone
4. Verifique no console do servidor se recebeu o dado
5. Abra seu site GeFiPro e veja se o gasto aparece

## Endpoint da API

### POST /api/expenses

Recebe gastos e salva no Firebase.

**Body:**
```json
{
  "valor": "150.00",           // Obrigatório
  "descricao": "Mercado Extra", // Obrigatório
  "categoria": "Alimentação",   // Opcional (padrão: Outros)
  "cartao": "itau",            // Obrigatório
  "data": "2026-01-15",        // Obrigatório (formato YYYY-MM-DD)
  "tipo": "normal",            // Opcional (normal, parcelado, recorrente)
  "parcela": "1/6",            // Opcional (apenas se tipo=parcelado)
  "notas": "Apple Pay"         // Opcional
}
```

**Response:**
```json
{
  "success": true,
  "id": "abc123",
  "message": "Gasto salvo com sucesso",
  "periodo": "2026_01"
}
```

## Cartões Disponíveis

- `itau` - Itaú LATAM PASS
- `porto` - Porto Seguro
- `nubank` - Nubank

## Categorias Disponíveis

- Alimentação, Mercado, Saúde, Lazer, Viagem, Pet
- Assinaturas, Educação, Vestuário, Casa, Carro, Pensão
- Moradia, Outros

## Deploy em Produção

Para usar em produção (não localhost):

### Opção 1: Render/Heroku/Vercel

1. Faça deploy do `server.js`
2. Atualize a URL no Make para a URL de produção
3. Atualize a URL no Shortcut

### Opção 2: Firebase Functions

1. Instale Firebase Functions
2. Mova a lógica do `server.js` para uma function
3. Deploy no Firebase

## Troubleshooting

### Servidor não inicia
- Verifique se a porta 3001 está disponível
- Verifique se as dependências foram instaladas

### Make não recebe dados
- Verifique se o webhook do Make está ativo
- Verifique se o Shortcut está enviando JSON válido

### Gasto não aparece no site
- Verifique o console do servidor por erros
- Verifique se o Firebase está conectado
- Dê refresh no site para sincronizar

## Segurança

Para produção, adicione:
- Autenticação (API key)
- Rate limiting
- HTTPS
- Validação adicional dos dados
