"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Eye, 
  EyeOff, 
  Upload,
  Copy,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { UniqueTicket, TicketError } from "@/hooks/use-unique-tickets"

interface TicketFormProps {
  ticket: UniqueTicket
  index: number
  errors: Record<number, TicketError>
  onUpdate: (index: number, field: keyof UniqueTicket, value: any) => void
  onRemove: (index: number) => void
  canRemove: boolean
  onDuplicate?: (index: number) => void
}

export function TicketForm({ 
  ticket, 
  index, 
  errors, 
  onUpdate, 
  onRemove, 
  canRemove,
  onDuplicate 
}: TicketFormProps) {
  const [imageObfuscated, setImageObfuscated] = useState<Record<number, boolean>>({})
  const [isDragOver, setIsDragOver] = useState(false)

  const ticketErrors = errors[index] || {}

  const handleImageUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      const currentImages = ticket.images || []
      const currentPreviews = ticket.imagePreviews || []
      
      // Verificar limite de imagens
      if (currentImages.length + newFiles.length > 5) {
        alert('Máximo de 5 imagens por ingresso')
        return
      }

      // Verificar tamanho das imagens
      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        alert('Algumas imagens são maiores que 5MB e foram ignoradas')
        return
      }

      const allFiles = [...currentImages, ...newFiles]
      const allPreviews: string[] = [...currentPreviews]
      
      let processedCount = 0
      
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          allPreviews.push(e.target?.result as string)
          processedCount++
          
          if (processedCount === newFiles.length) {
            onUpdate(index, 'images', allFiles)
            onUpdate(index, 'imagePreviews', allPreviews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (imageIndex: number) => {
    const currentImages = ticket.images || []
    const currentPreviews = ticket.imagePreviews || []
    
    onUpdate(index, 'images', currentImages.filter((_, i) => i !== imageIndex))
    onUpdate(index, 'imagePreviews', currentPreviews.filter((_, i) => i !== imageIndex))
  }

  const toggleImageObfuscation = (imageIndex: number) => {
    setImageObfuscated(prev => ({
      ...prev,
      [imageIndex]: !prev[imageIndex]
    }))
  }

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    
    const numberValue = parseInt(numbers) / 100
    return `R$ ${numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const handlePriceChange = (value: string) => {
    const formatted = formatPrice(value)
    onUpdate(index, 'price', formatted)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    handleImageUpload(files)
  }

  const getValidationIcon = (field: keyof TicketError) => {
    if (ticketErrors[field]) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    
    // Verificar se o campo está válido
    switch (field) {
      case 'name':
        return ticket.name.trim().length >= 3 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null
      case 'price':
        const price = parseFloat(ticket.price.replace(/[^\d,]/g, '').replace(',', '.'))
        return !isNaN(price) && price > 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null
      case 'quantity':
        return ticket.quantity > 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null
      case 'images':
        return ticket.images.length > 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null
      default:
        return null
    }
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              Ingresso Único {index + 1}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {ticket.quantity} {ticket.quantity === 1 ? 'unidade' : 'unidades'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(index)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Duplicar ingresso"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Remover ingresso"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Nome e Preço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${index}`} className="flex items-center gap-2">
              Nome do Ingresso *
              {getValidationIcon('name')}
            </Label>
            <Input
              id={`name-${index}`}
              value={ticket.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              placeholder="Ex: Ingresso VIP Especial"
              className={ticketErrors.name ? 'border-red-500' : ''}
            />
            {ticketErrors.name && (
              <p className="text-sm text-red-600">{ticketErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`price-${index}`} className="flex items-center gap-2">
              Preço *
              {getValidationIcon('price')}
            </Label>
            <Input
              id={`price-${index}`}
              value={ticket.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="R$ 0,00"
              className={ticketErrors.price ? 'border-red-500' : ''}
            />
            {ticketErrors.price && (
              <p className="text-sm text-red-600">{ticketErrors.price}</p>
            )}
          </div>
        </div>

        {/* Quantidade */}
        <div className="space-y-2">
          <Label htmlFor={`quantity-${index}`} className="flex items-center gap-2">
            Quantidade *
            {getValidationIcon('quantity')}
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdate(index, 'quantity', Math.max(1, ticket.quantity - 1))}
              disabled={ticket.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id={`quantity-${index}`}
              type="number"
              min="1"
              max="1000"
              value={ticket.quantity}
              onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
              className={`text-center w-24 ${ticketErrors.quantity ? 'border-red-500' : ''}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUpdate(index, 'quantity', Math.min(1000, ticket.quantity + 1))}
              disabled={ticket.quantity >= 1000}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {ticketErrors.quantity && (
            <p className="text-sm text-red-600">{ticketErrors.quantity}</p>
          )}
          <p className="text-xs text-gray-500">
            Cada quantidade criará um ingresso individual
          </p>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor={`description-${index}`}>
            Descrição
          </Label>
          <Textarea
            id={`description-${index}`}
            value={ticket.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            placeholder="Descreva os benefícios e características especiais deste ingresso..."
            className={`min-h-[100px] ${ticketErrors.description ? 'border-red-500' : ''}`}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            {ticketErrors.description && (
              <p className="text-sm text-red-600">{ticketErrors.description}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {ticket.description.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Upload de Imagens */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            Imagens do Ingresso *
            {getValidationIcon('images')}
          </Label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : ticketErrors.images 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id={`image-upload-${index}`}
            />
            <Label 
              htmlFor={`image-upload-${index}`}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Selecionar Imagens
            </Label>
            <p className="text-xs text-gray-500 mt-2">
              Máximo 5 imagens, até 5MB cada
            </p>
          </div>

          {ticketErrors.images && (
            <p className="text-sm text-red-600">{ticketErrors.images}</p>
          )}

          {/* Preview das Imagens */}
          {ticket.imagePreviews && ticket.imagePreviews.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ticket.imagePreviews.map((preview, imgIndex) => (
                  <div key={imgIndex} className="relative group">
                    <div className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${imgIndex + 1}`}
                        className={`w-full h-full object-cover rounded-lg border ${
                          imageObfuscated[imgIndex] ? 'blur-sm' : ''
                        }`}
                      />
                      
                      {/* Overlay com controles */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toggleImageObfuscation(imgIndex)}
                            className="bg-white bg-opacity-90 hover:bg-opacity-100"
                          >
                            {imageObfuscated[imgIndex] ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(imgIndex)}
                            className="bg-red-600 bg-opacity-90 hover:bg-opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Imagem {imgIndex + 1}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span>
                  {ticket.images.length} imagem(ns) carregada(s)
                </span>
                <span>
                  Para {ticket.quantity} ingresso(s)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Opções Avançadas */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`price-blocked-${index}`}
              checked={ticket.price_blocked || false}
              onChange={(e) => onUpdate(index, 'price_blocked', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor={`price-blocked-${index}`} className="text-sm">
              Preço bloqueado (não pode ser alterado pelo comprador)
            </Label>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-sm">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informações do Sistema:</p>
                <ul className="text-xs space-y-1">
                  <li>• Status será definido automaticamente como "Disponível"</li>
                  <li>• {ticket.quantity} ingresso(s) individual(is) será(ão) criado(s)</li>
                  <li>• Cada ingresso terá uma imagem única (se disponível)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}