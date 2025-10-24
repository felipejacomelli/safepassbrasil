# Regras do Projeto ReTicket

## Arquitetura do Projeto

### Stack Tecnológico
- **Framework**: Next.js 14+ com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Gerenciamento de Estado**: React Context API
- **Validação**: Zod + React Hook Form
- **Ícones**: Lucide React
- **Moeda**: Real Brasileiro (BRL)

### Estrutura de Diretórios
```
app/                    # App Router do Next.js
├── (auth)/            # Grupo de rotas de autenticação
├── admin/             # Área administrativa
├── account/           # Conta do usuário
├── globals.css        # Estilos globais
├── layout.tsx         # Layout raiz
└── page.tsx           # Página inicial

components/            # Componentes reutilizáveis
├── ui/               # Componentes base (shadcn/ui)
└── ...               # Componentes específicos

contexts/             # Contextos React
├── auth-context.tsx  # Contexto de autenticação
└── ...

hooks/                # Hooks customizados
├── useAuth.tsx       # Hook de autenticação
├── use-media-query.tsx # Hook para media queries
└── ...

lib/                  # Utilitários e configurações
├── utils.ts          # Funções utilitárias
└── ...

utils/                # Utilitários específicos
├── formatCurrency.ts # Formatação de moeda
└── ...
```

## Convenções de Código

### Componentes React
- Use **function components** com TypeScript
- Prefira **client components** quando necessário interatividade
- Use **server components** por padrão para melhor performance
- Nomeação em PascalCase para componentes
- Props tipadas com interfaces TypeScript

### Roteamento (App Router)
- Use a estrutura de pastas do App Router
- `page.tsx` para páginas
- `layout.tsx` para layouts compartilhados
- `loading.tsx` para estados de carregamento
- `error.tsx` para tratamento de erros
- Grupos de rotas com `(nome)` quando apropriado

### Estilização
- **Tailwind CSS** como sistema principal
- **shadcn/ui** para componentes base
- Use `cn()` utility para merge de classes
- Responsive design mobile-first
- Paleta de cores consistente definida no `tailwind.config.js`

### Gerenciamento de Estado
- **React Context** para estado global (autenticação, tema)
- **useState/useEffect** para estado local
- **React Hook Form** para formulários
- **Zod** para validação de schemas

### Autenticação e Autorização
- Context API para gerenciar estado de autenticação
- Middleware para proteção de rotas (`/admin`, `/account`)
- Tipos de usuário: `admin`, `user`
- Simulação de 2FA quando necessário

## Padrões de Desenvolvimento

### Nomenclatura
- **Arquivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Variáveis/Funções**: camelCase (`formatCurrency`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Tipos/Interfaces**: PascalCase (`User`, `AuthContextType`)

### Imports
- Imports absolutos usando path mapping (`@/components`, `@/lib`)
- Ordem: externos → internos → relativos
- Agrupar imports por tipo

### Tratamento de Dados
- Validação com Zod schemas
- Formatação de moeda em BRL
- Tratamento de erros consistente
- Loading states para melhor UX

### Performance
- Lazy loading para componentes pesados
- Otimização de imagens com Next.js Image
- Server Components quando possível
- Memoização quando apropriado

## Funcionalidades Específicas

### Sistema de Eventos
- CRUD completo de eventos
- Categorização de eventos
- Sistema de preços e ingressos
- Carrinho de compras

### Autenticação
- Login/Registro de usuários
- Área administrativa protegida
- Perfil de usuário editável
- Sistema de logout

### Interface
- Design responsivo
- Componentes reutilizáveis
- Estados de loading e erro
- Feedback visual consistente

## Commits e Versionamento

### Mensagens de Commit (em Português)
- `feat: adiciona nova funcionalidade`
- `fix: corrige bug específico`
- `refactor: melhora código existente`
- `style: ajustes de estilização`
- `chore: tarefas de manutenção`

### Estrutura de Branches
- `main`: código de produção
- `develop`: desenvolvimento ativo
- `feature/*`: novas funcionalidades
- `fix/*`: correções de bugs

## Qualidade de Código

### TypeScript
- Tipagem estrita habilitada
- Interfaces para props e dados
- Evitar `any`, usar tipos específicos
- Utilizar generics quando apropriado

### Linting e Formatação
- ESLint configurado
- Prettier para formatação
- Configurações no `next.config.mjs`

### Testes
- Testes unitários para utilitários
- Testes de integração para componentes críticos
- Testes E2E para fluxos principais

## Deployment e Build

### Configurações
- Next.js otimizado para produção
- Variáveis de ambiente para diferentes ambientes
- Build otimizado com tree-shaking
- Análise de bundle quando necessário

### Monitoramento
- Logs estruturados
- Métricas de performance
- Tratamento de erros em produção