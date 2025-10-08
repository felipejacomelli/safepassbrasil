'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { TicketTypeFormData } from '@/hooks/use-ticket-types'

interface TicketTypeFormProps {
  ticketTypes: TicketTypeFormData[]
  onAddTicketType: () => void
  onRemoveTicketType: (index: number) => void
  onUpdateTicketType: (index: number, field: keyof TicketTypeFormData, value: string) => void
  getFieldError: (index: number, field: keyof TicketTypeFormData) => string | undefined
  disabled?: boolean
}

export function TicketTypeForm({
  ticketTypes,
  onAddTicketType,
  onRemoveTicketType,
  onUpdateTicketType,
  getFieldError,
  disabled = false
}: TicketTypeFormProps) {
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Tipos de Ingressos</h3>
        <Button
          type="button"
          onClick={onAddTicketType}
          disabled={disabled}
          size="sm"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Adicionar Tipo
        </Button>
      </div>

      {ticketTypes.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
          <CardContent className="pt-6">
            <p className="text-center text-zinc-400">
              Nenhum tipo de ingresso adicionado. Clique em "Adicionar Tipo" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ticketTypes.map((ticketType, index) => (
            <Card key={ticketType.id || index} className="bg-zinc-900 border-zinc-800 rounded-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Tipo de Ingresso {index + 1}
                  </CardTitle>
                  {ticketTypes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveTicketType(index)}
                      disabled={disabled}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Nome e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`} className="text-white">
                      Nome do Tipo <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={ticketType.name}
                      onChange={(e) => onUpdateTicketType(index, 'name', e.target.value)}
                      placeholder="Ex: Pista, Camarote, VIP"
                      disabled={disabled}
                      className={`bg-zinc-800 border-zinc-700 text-white rounded-lg ${
                        getFieldError(index, 'name') ? 'border-red-500' : ''
                      }`}
                    />
                    {getFieldError(index, 'name') && (
                      <p className="text-sm text-red-400">
                        {getFieldError(index, 'name')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`} className="text-white">
                      Preço (R$) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={ticketType.price}
                      onChange={(e) => onUpdateTicketType(index, 'price', e.target.value)}
                      placeholder="0,00"
                      disabled={disabled}
                      className={`bg-zinc-800 border-zinc-700 text-white rounded-lg ${
                        getFieldError(index, 'price') ? 'border-red-500' : ''
                      }`}
                    />
                    {getFieldError(index, 'price') && (
                      <p className="text-sm text-red-400">
                        {getFieldError(index, 'price')}
                      </p>
                    )}
                  </div>
                </div>


                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`} className="text-white">
                    Descrição <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id={`description-${index}`}
                    value={ticketType.description}
                    onChange={(e) => onUpdateTicketType(index, 'description', e.target.value)}
                    placeholder="Descrição detalhada do tipo de ingresso..."
                    disabled={disabled}
                    className={`bg-zinc-800 border-zinc-700 text-white rounded-lg ${
                      getFieldError(index, 'description') ? 'border-red-500' : ''
                    }`}
                    rows={3}
                  />
                  {getFieldError(index, 'description') && (
                    <p className="text-sm text-red-400">
                      {getFieldError(index, 'description')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}