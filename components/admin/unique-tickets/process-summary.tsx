"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  Info,
  Lightbulb
} from "lucide-react"

interface ProcessSummaryProps {
  selectedOccurrence: any
  ticketsCount: number
  totalTickets: number
  totalValue: number
  hasValidationErrors: boolean
}

export function ProcessSummary({ 
  selectedOccurrence, 
  ticketsCount, 
  totalTickets, 
  totalValue,
  hasValidationErrors 
}: ProcessSummaryProps) {
  const steps = [
    {
      id: 1,
      title: "Selecionar Evento e Ocorrência",
      description: "Escolha o evento e a data/horário específico",
      completed: !!selectedOccurrence,
      icon: selectedOccurrence ? CheckCircle2 : Circle
    },
    {
      id: 2,
      title: "Criar Ingressos Únicos",
      description: "Configure os ingressos com imagens personalizadas",
      completed: ticketsCount > 0 && !hasValidationErrors,
      inProgress: ticketsCount > 0 && hasValidationErrors,
      icon: ticketsCount > 0 && !hasValidationErrors ? CheckCircle2 : 
            ticketsCount > 0 && hasValidationErrors ? AlertTriangle : Circle
    },
    {
      id: 3,
      title: "Revisar e Salvar",
      description: "Confirme os dados e publique os ingressos",
      completed: false,
      disabled: !selectedOccurrence || ticketsCount === 0 || hasValidationErrors,
      icon: Circle
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  const getCurrentTip = () => {
    if (!selectedOccurrence) {
      return {
        type: "info" as const,
        title: "Primeiro passo",
        message: "Selecione um evento e sua ocorrência para começar a criar ingressos únicos."
      }
    }
    
    if (ticketsCount === 0) {
      return {
        type: "info" as const,
        title: "Criar ingressos",
        message: "Adicione pelo menos um ingresso único com imagem personalizada."
      }
    }
    
    if (hasValidationErrors) {
      return {
        type: "warning" as const,
        title: "Corrigir erros",
        message: "Verifique os campos destacados em vermelho antes de continuar."
      }
    }
    
    if (ticketsCount > 0 && !hasValidationErrors) {
      return {
        type: "success" as const,
        title: "Pronto para salvar",
        message: "Todos os ingressos estão configurados corretamente. Você pode salvar agora!"
      }
    }
    
    return null
  }

  const currentTip = getCurrentTip()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Progresso da Criação
          </CardTitle>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {completedSteps}/{steps.length} etapas
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso geral</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Lista de Etapas */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1
            
            return (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-3">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                    ${step.completed 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : step.inProgress
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                        : step.disabled
                          ? 'bg-gray-100 border-gray-300 text-gray-400'
                          : 'bg-blue-100 border-blue-500 text-blue-700'
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`
                      text-sm font-medium
                      ${step.completed 
                        ? 'text-green-900' 
                        : step.inProgress
                          ? 'text-yellow-900'
                          : step.disabled
                            ? 'text-gray-500'
                            : 'text-gray-900'
                      }
                    `}>
                      {step.title}
                    </h4>
                    <p className={`
                      text-xs mt-1
                      ${step.completed 
                        ? 'text-green-600' 
                        : step.inProgress
                          ? 'text-yellow-600'
                          : step.disabled
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Linha conectora */}
                {!isLast && (
                  <div className={`
                    absolute left-4 top-8 w-0.5 h-6 -translate-x-0.5
                    ${step.completed ? 'bg-green-300' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>

        {/* Resumo dos Ingressos */}
        {ticketsCount > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Resumo dos Ingressos
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tipos criados:</span>
                <span className="ml-2 font-medium">{ticketsCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Total de ingressos:</span>
                <span className="ml-2 font-medium">{totalTickets}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Valor total estimado:</span>
                <span className="ml-2 font-medium text-green-700">
                  R$ {totalValue.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dica Contextual */}
        {currentTip && (
          <div className={`
            rounded-lg p-4 border-l-4
            ${currentTip.type === 'success' 
              ? 'bg-green-50 border-green-500' 
              : currentTip.type === 'warning'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-blue-50 border-blue-500'
            }
          `}>
            <div className="flex items-start gap-3">
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                ${currentTip.type === 'success' 
                  ? 'text-green-600' 
                  : currentTip.type === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }
              `}>
                <Lightbulb className="h-4 w-4" />
              </div>
              
              <div className="flex-1">
                <h5 className={`
                  text-sm font-medium
                  ${currentTip.type === 'success' 
                    ? 'text-green-900' 
                    : currentTip.type === 'warning'
                      ? 'text-yellow-900'
                      : 'text-blue-900'
                  }
                `}>
                  {currentTip.title}
                </h5>
                <p className={`
                  text-xs mt-1
                  ${currentTip.type === 'success' 
                    ? 'text-green-700' 
                    : currentTip.type === 'warning'
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                  }
                `}>
                  {currentTip.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}