# Meu Mercadinho

Sistema completo de gestão para mercadinhos, desenvolvido com React + Vite e Firebase Firestore.

## 🚀 Funcionalidades

- **Dashboard**: Resumo geral com saldo em caixa, vendas do dia, estoque baixo e contas próximas
- **Controle de Estoque**: Cadastro, edição e exclusão de produtos com controle de quantidade
- **Sistema de Vendas**: Registro de vendas com atualização automática de estoque
- **Controle de Compras**: Registro de entrada de mercadorias e atualização de estoque
- **Gestão de Fiado**: Controle de vendas a prazo com clientes
- **Contas a Pagar/Receber**: Gestão completa de contas com status e vencimentos
- **Fluxo de Caixa**: Histórico completo de movimentações financeiras

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Estilização**: CSS puro (sem frameworks)
- **Banco de Dados**: Firebase Firestore
- **Autenticação**: Sistema simples (adm/nautilus)
- **Deploy**: Netlify

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Conta no Firebase
- Conta no Netlify (para deploy)

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd meu-mercadinho
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

#### 3.1. Crie um projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar o projeto

#### 3.2. Configure o Firestore
1. No painel do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione uma localização (recomendado: us-central1)

#### 3.3. Obtenha as credenciais
1. Vá em "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique em "Web" (ícone `</>`)
4. Registre o app com um nome (ex: "meu-mercadinho")
5. Copie as credenciais do Firebase

#### 3.4. Configure o arquivo de configuração
1. Abra `src/services/firebaseConfig.js`
2. Substitua as credenciais pelas suas:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 4. Execute o projeto localmente
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🔐 Credenciais de Acesso

- **Usuário**: `adm`
- **Senha**: `nautilus`

## 📱 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── Layout.jsx      # Layout principal com sidebar
├── contexts/           # Contextos React
│   └── AuthContext.jsx # Contexto de autenticação
├── pages/              # Páginas da aplicação
│   ├── Login.jsx       # Tela de login
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Inventory.jsx   # Controle de estoque
│   ├── Sales.jsx       # Sistema de vendas
│   ├── Purchases.jsx   # Controle de compras
│   ├── CreditSales.jsx # Gestão de fiado
│   ├── Accounts.jsx    # Contas a pagar/receber
│   └── CashFlow.jsx    # Fluxo de caixa
├── services/           # Serviços e configurações
│   ├── firebaseConfig.js    # Configuração do Firebase
│   └── firebaseService.js   # Serviços do Firestore
├── styles/             # Estilos CSS
│   ├── Global.css      # Estilos globais
│   ├── Layout.css      # Estilos do layout
│   ├── Login.css       # Estilos da tela de login
│   ├── Dashboard.css   # Estilos do dashboard
│   ├── Inventory.css   # Estilos do estoque
│   ├── Sales.css       # Estilos das vendas
│   ├── Purchases.css   # Estilos das compras
│   ├── CreditSales.css # Estilos do fiado
│   ├── Accounts.css    # Estilos das contas
│   └── CashFlow.css    # Estilos do fluxo de caixa
└── utils/              # Utilitários
```

## 🗄️ Estrutura do Banco de Dados (Firestore)

### Coleções:

- **products**: Produtos do estoque
  ```javascript
  {
    name: string,
    category: string,
    costPrice: number,
    salePrice: number,
    stock: number,
    createdAt: timestamp
  }
  ```

- **sales**: Vendas realizadas
  ```javascript
  {
    items: array,
    total: number,
    date: timestamp,
    paymentType: 'cash' | 'card' | 'fiado',
    client?: string
  }
  ```

- **purchases**: Compras realizadas
  ```javascript
  {
    items: array,
    total: number,
    date: timestamp,
    supplier?: string
  }
  ```

- **debts**: Dívidas (fiado)
  ```javascript
  {
    client: string,
    value: number,
    status: 'pending' | 'paid',
    dueDate: timestamp,
    description?: string
  }
  ```

- **accountsPayable**: Contas a pagar
  ```javascript
  {
    description: string,
    value: number,
    dueDate: timestamp,
    status: 'pending' | 'paid'
  }
  ```

- **accountsReceivable**: Contas a receber
  ```javascript
  {
    description: string,
    value: number,
    dueDate: timestamp,
    status: 'pending' | 'paid'
  }
  ```

- **cashFlow**: Movimentações de caixa
  ```javascript
  {
    type: 'entrada' | 'saída',
    value: number,
    description: string,
    date: timestamp
  }
  ```

## 🚀 Deploy no Netlify

### 1. Build do projeto
```bash
npm run build
```

### 2. Deploy manual
1. Acesse [Netlify](https://netlify.com)
2. Faça login na sua conta
3. Arraste a pasta `dist` (gerada pelo build) para a área de deploy
4. Aguarde o deploy ser concluído

### 3. Deploy automático (recomendado)
1. Conecte seu repositório GitHub ao Netlify
2. Configure as seguintes opções:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Faça o deploy

### 4. Configuração de variáveis de ambiente (opcional)
Se preferir usar variáveis de ambiente para as credenciais do Firebase:

1. No Netlify, vá em "Site settings" > "Environment variables"
2. Adicione as variáveis do Firebase
3. Atualize o `firebaseConfig.js` para usar `import.meta.env`

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o projeto em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter

## 📱 Responsividade

O sistema é totalmente responsivo e funciona bem em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## 🎨 Design

- Interface limpa e moderna
- Cores consistentes e profissionais
- Animações suaves
- Ícones intuitivos
- Feedback visual para ações do usuário

## 🔒 Segurança

- Autenticação simples (pode ser expandida)
- Validação de dados no frontend
- Regras de segurança do Firestore (configurar conforme necessário)

## 🐛 Solução de Problemas

### Erro de conexão com Firebase
- Verifique se as credenciais estão corretas
- Confirme se o Firestore está habilitado
- Verifique as regras de segurança do Firestore

### Erro de build
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas
- Limpe o cache: `npm run build -- --force`

### Problemas de responsividade
- Teste em diferentes tamanhos de tela
- Verifique o console do navegador para erros CSS

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Firebase
2. Consulte a documentação do React
3. Verifique os logs do console do navegador

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

---

**Desenvolvido com ❤️ para facilitar a gestão de mercadinhos**# meu-mercadinho
