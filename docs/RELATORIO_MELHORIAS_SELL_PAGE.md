
## Análise Profunda do Arquivo `app/event/[slug]/sell/page.tsx`

### 🔍 **Problemas Identificados**

#### 1. **Violação dos Padrões de Componentização**
- **Problema**: Componente monolítico com 1089 linhas
- **Impacto**: Dificulta manutenção, reutilização e testes
- **Solução**: Quebrar em componentes menores e reutilizáveis

#### 2. **Estilização Inline Excessiva**
- **Problema**: Uso massivo de `style` inline (mais de 200 ocorrências)
- **Impacto**: Viola padrões do projeto que usa Tailwind CSS + shadcn/ui
- **Solução**: Migrar para classes Tailwind e componentes shadcn/ui

#### 3. **Gerenciamento de Estado Inadequado**
- **Problema**: Múltiplos `useState` sem organização
- **Impacto**: Estado complexo e difícil de gerenciar
- **Solução**: Implementar `useReducer` ou custom hooks

#### 4. **Falta de Validação com Zod**
- **Problema**: Validação manual sem schemas
- **Impacto**: Inconsistência com padrões do projeto
- **Solução**: Implementar schemas Zod para validação

#### 5. **Ausência de React Hook Form**
- **Problema**: Formulário nativo sem otimizações
- **Impacto**: Performance e UX subótimos
- **Solução**: Migrar para React Hook Form + Zod

#### 6. **Lógica de Negócio no Componente**
- **Problema**: Lógica de API e validação misturada com UI
- **Impacto**: Viola separação de responsabilidades
- **Solução**: Extrair para custom hooks e services

---

## 📋 **Implementações Necessárias**

### **1. Refatoração de Componentes**

#### **1.1 Criar Componente de Formulário de Venda**
```typescript
// components/sell/SellTicketForm.tsx
interface SellTicketFormProps {
  event: ApiEvent
  onSubmit: (data: SellTicketFormData) => Promise<void>
  isLoading: boolean
}
```

#### **1.2 Criar Componente de Informações do Evento**
```typescript
// components/sell/EventInfoCard.tsx
interface EventInfoCardProps {
  event: ApiEvent
  selectedOccurrence: ApiOccurrence | null
}
```

#### **1.3 Criar Componente de Seleção de Ocorrência**
```typescript
// components/sell/OccurrenceSelector.tsx
interface OccurrenceSelectorProps {
  occurrences: ApiOccurrence[]
  value: string
  onChange: (value: string) => void
}
```

#### **1.4 Criar Componente de Seleção de Tipo de Ingresso**
```typescript
// components/sell/TicketTypeSelector.tsx
interface TicketTypeSelectorProps {
  ticketTypes: TicketType[]
  value: string
  onChange: (value: string) => void
  disabled: boolean
}
```

#### **1.5 Criar Componente de Configuração de Preço**
```typescript
// components/sell/PriceConfiguration.tsx
interface PriceConfigurationProps {
  price: number
  onChange: (price: number) => void
  platformFeeRate: number
}
```

#### **1.6 Criar Componente de Controle de Quantidade**
```typescript
// components/sell/QuantitySelector.tsx
interface QuantitySelectorProps {
  value: number
  onChange: (quantity: number) => void
  maxQuantity: number
}
```

### **2. Schemas de Validação Zod**

#### **2.1 Schema para Formulário de Venda**
```typescript
// lib/schemas/sell-ticket.ts
export const sellTicketSchema = z.object({
  occurrenceId: z.string().min(1, "Selecione uma data e local"),
  ticketTypeId: z.string().min(1, "Selecione um tipo de ingresso"),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  quantity: z.number().int().min(1, "Quantidade deve ser maior que zero").max(10, "Máximo de 10 ingressos"),
  description: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "Você deve aceitar os termos")
})

export type SellTicketFormData = z.infer<typeof sellTicketSchema>
```

### **3. Custom Hooks**

#### **3.1 Hook para Gerenciamento do Formulário**
```typescript
// hooks/use-sell-ticket-form.ts
export function useSellTicketForm(event: ApiEvent) {
  const form = useForm<SellTicketFormData>({
    resolver: zodResolver(sellTicketSchema),
    defaultValues: {
      occurrenceId: "",
      ticketTypeId: "",
      price: 0,
      quantity: 1,
      description: "",
      termsAccepted: false
    }
  })

  // Lógica de validação e submissão
}
```

#### **3.2 Hook para Cálculos de Preço**
```typescript
// hooks/use-price-calculations.ts
export function usePriceCalculations(price: number, platformFeeRate: number) {
  const sellerReceives = useMemo(() => 
    price * (1 - platformFeeRate), [price, platformFeeRate]
  )
  
  const platformFee = useMemo(() => 
    price * platformFeeRate, [price, platformFeeRate]
  )

  return { sellerReceives, platformFee }
}
```

#### **3.3 Hook para Submissão de Ingressos**
```typescript
// hooks/use-sell-ticket-submission.ts
export function useSellTicketSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submitTickets = async (tickets: SellTicketFormData[]) => {
    // Lógica de submissão
  }

  return { submitTickets, isSubmitting, error, success }
}
```

### **4. Migração para Tailwind CSS + shadcn/ui**

#### **4.1 Substituir Estilos Inline**
- Remover todos os `style` inline
- Implementar classes Tailwind CSS
- Usar componentes shadcn/ui (Card, Button, Input, etc.)

#### **4.2 Componentes shadcn/ui a Implementar**
```typescript
// Componentes necessários:
- Card, CardContent, CardHeader, CardTitle
- Button (com variantes)
- Input, Label, Textarea
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Alert, AlertDescription
- Badge
- Breadcrumb
- Form (React Hook Form)
```

### **5. Melhorias de UX/UI**

#### **5.1 Estados de Loading**
```typescript
// Implementar skeleton loaders
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

#### **5.2 Feedback Visual**
```typescript
// Toast notifications para sucesso/erro
import { toast } from "sonner"

toast.success("Ingresso publicado com sucesso!")
toast.error("Erro ao publicar ingresso")
```

#### **5.3 Validação em Tempo Real**
```typescript
// Validação com debounce
const debouncedPrice = useDebounce(price, 300)
useEffect(() => {
  // Validação do preço
}, [debouncedPrice])
```

### **6. Otimizações de Performance**

#### **6.1 Memoização de Componentes**
```typescript
const EventInfoCard = memo(({ event, selectedOccurrence }: EventInfoCardProps) => {
  // Componente memoizado
})
```

#### **6.2 Lazy Loading**
```typescript
const SellTicketForm = lazy(() => import('./SellTicketForm'))
```

#### **6.3 Otimização de Re-renders**
```typescript
// Usar useCallback para funções
const handleOccurrenceChange = useCallback((value: string) => {
  setSelectedOccurrence(value)
}, [])
```

### **7. Melhorias de Acessibilidade**

#### **7.1 ARIA Labels**
```typescript
<select
  aria-label="Selecionar data e local do evento"
  aria-describedby="occurrence-help"
>
```

#### **7.2 Navegação por Teclado**
```typescript
// Implementar navegação por teclado
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    // Lógica de navegação
  }
}
```

### **8. Testes**

#### **8.1 Testes Unitários**
```typescript
// __tests__/SellTicketForm.test.tsx
describe('SellTicketForm', () => {
  it('should validate required fields', () => {
    // Teste de validação
  })
})
```

#### **8.2 Testes de Integração**
```typescript
// __tests__/sell-ticket-integration.test.tsx
describe('Sell Ticket Integration', () => {
  it('should submit ticket successfully', () => {
    // Teste de integração
  })
})
```

---

## 🎯 **Priorização das Implementações**

### **Alta Prioridade (Crítico)**
1. **Refatoração de Componentes** - Quebrar componente monolítico
2. **Migração para Tailwind CSS** - Remover estilos inline
3. **Implementação de React Hook Form + Zod** - Validação adequada
4. **Custom Hooks** - Separar lógica de negócio

### **Média Prioridade (Importante)**
5. **Componentes shadcn/ui** - Padronização visual
6. **Melhorias de UX** - Loading states e feedback
7. **Otimizações de Performance** - Memoização e lazy loading

### **Baixa Prioridade (Desejável)**
8. **Testes** - Cobertura de testes
9. **Acessibilidade** - ARIA labels e navegação
10. **Documentação** - JSDoc e comentários

---

## 📊 **Métricas de Sucesso**

- **Redução de Linhas**: De 1089 para ~300 linhas no componente principal
- **Componentes Reutilizáveis**: 6+ componentes extraídos
- **Cobertura de Testes**: 80%+ de cobertura
- **Performance**: Redução de 50%+ no tempo de renderização
- **Acessibilidade**: Score 90+ no Lighthouse

---

## 🚀 **Próximos Passos**

1. **Criar estrutura de componentes** em `components/sell/`
2. **Implementar schemas Zod** em `lib/schemas/`
3. **Desenvolver custom hooks** em `hooks/`
4. **Migrar estilos** para Tailwind CSS
5. **Implementar testes** com Jest + RTL

---

*Este relatório foi gerado seguindo as boas práticas do projeto e padrões estabelecidos no codebase.*
