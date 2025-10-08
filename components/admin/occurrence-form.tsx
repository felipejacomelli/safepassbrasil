"use client"

import React from 'react'
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OccurrenceFormData, OccurrenceValidationErrors } from '@/lib/types/occurrence'

interface OccurrenceFormProps {
  occurrence: OccurrenceFormData
  index: number
  canRemove: boolean
  onUpdate: (index: number, field: keyof OccurrenceFormData, value: string) => void
  onRemove: (index: number) => void
  errors?: OccurrenceValidationErrors
}

export function OccurrenceForm({
  occurrence,
  index,
  canRemove,
  onUpdate,
  onRemove,
  errors = {}
}: OccurrenceFormProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5" />
            Ocorrência {index + 1}
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`start-${index}`} className="text-white">
              Data/Hora Início *
            </Label>
            <Input
              id={`start-${index}`}
              type="datetime-local"
              value={occurrence.start_at}
              onChange={(e) => onUpdate(index, 'start_at', e.target.value)}
              className={`bg-zinc-800 border-zinc-700 text-white rounded ${
                errors.start_at ? 'border-red-500' : ''
              }`}
            />
            {errors.start_at && (
              <p className="text-red-400 text-sm">{errors.start_at[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`end-${index}`} className="text-white">
              Data/Hora Fim *
            </Label>
            <Input
              id={`end-${index}`}
              type="datetime-local"
              value={occurrence.end_at}
              onChange={(e) => onUpdate(index, 'end_at', e.target.value)}
              className={`bg-zinc-800 border-zinc-700 text-white rounded ${
                errors.end_at ? 'border-red-500' : ''
              }`}
            />
            {errors.end_at && (
              <p className="text-red-400 text-sm">{errors.end_at[0]}</p>
            )}
          </div>
        </div>

        {/* Localização */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`uf-${index}`} className="text-white">
              UF *
            </Label>
            <Input
              id={`uf-${index}`}
              value={occurrence.uf}
              onChange={(e) => onUpdate(index, 'uf', e.target.value.toUpperCase())}
              placeholder="Ex: SP"
              maxLength={2}
              className={`bg-zinc-800 border-zinc-700 text-white rounded ${
                errors.uf ? 'border-red-500' : ''
              }`}
            />
            {errors.uf && (
              <p className="text-red-400 text-sm">{errors.uf[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`state-${index}`} className="text-white">
              Estado *
            </Label>
            <Input
              id={`state-${index}`}
              value={occurrence.state}
              onChange={(e) => onUpdate(index, 'state', e.target.value)}
              placeholder="Ex: São Paulo"
              className={`bg-zinc-800 border-zinc-700 text-white rounded ${
                errors.state ? 'border-red-500' : ''
              }`}
            />
            {errors.state && (
              <p className="text-red-400 text-sm">{errors.state[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`city-${index}`} className="text-white">
              Cidade *
            </Label>
            <Input
              id={`city-${index}`}
              value={occurrence.city}
              onChange={(e) => onUpdate(index, 'city', e.target.value)}
              placeholder="Ex: São Paulo"
              className={`bg-zinc-800 border-zinc-700 text-white rounded ${
                errors.city ? 'border-red-500' : ''
              }`}
            />
            {errors.city && (
              <p className="text-red-400 text-sm">{errors.city[0]}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
