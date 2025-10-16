"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowRightLeft,
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileImage,
  Info
} from "lucide-react"
import { uploadImage } from "@/lib/upload"

interface TransferConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: TransferConfirmationData) => Promise<void>
  type: 'mark_transferred' | 'confirm_receipt'
  ticketInfo: {
    eventName: string
    ticketType: string
    price: string
  }
}

interface TransferConfirmationData {
  notes?: string
  evidenceFile?: File
}

export default function TransferConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  ticketInfo
}: TransferConfirmationModalProps) {
  const [notes, setNotes] = useState("")
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [evidencePreview, setEvidencePreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [evidenceError, setEvidenceError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isMarkTransferred = type === 'mark_transferred'
  const isConfirmReceipt = type === 'confirm_receipt'

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEvidenceError("")

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      setEvidenceError("Apenas imagens são aceitas")
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setEvidenceError("Arquivo deve ter no máximo 5MB")
      return
    }

    setEvidenceFile(file)
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setEvidencePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = () => {
    setEvidenceFile(null)
    setEvidencePreview("")
    setEvidenceError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const data: TransferConfirmationData = {
        notes: notes.trim() || undefined,
        evidenceFile: evidenceFile || undefined
      }

      await onConfirm(data)
      
      // Reset form
      setNotes("")
      setEvidenceFile(null)
      setEvidencePreview("")
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao processar transferência")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModalContent = () => {
    if (isMarkTransferred) {
      return {
        title: "Marcar como Transferido",
        icon: <ArrowRightLeft className="h-5 w-5 text-blue-500" />,
        description: "Confirme que você transferiu este ingresso para o comprador.",
        warningText: "Ao marcar como transferido, você confirma que entregou o ingresso. Esta ação não pode ser desfeita.",
        confirmText: "Confirmar Transferência",
        notesLabel: "Observações sobre a transferência (opcional)",
        notesPlaceholder: "Ex: Transferido via WhatsApp, comprovante enviado por email..."
      }
    } else {
      return {
        title: "Confirmar Recebimento",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        description: "Confirme que você recebeu este ingresso do vendedor.",
        warningText: "Ao confirmar o recebimento, você declara ter recebido o ingresso válido. Esta ação liberará o pagamento para o vendedor.",
        confirmText: "Confirmar Recebimento",
        notesLabel: "Observações sobre o recebimento (opcional)",
        notesPlaceholder: "Ex: Ingresso recebido em perfeitas condições, código QR funcionando..."
      }
    }
  }

  const content = getModalContent()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {content.icon}
            <span>{content.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Ingresso */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Detalhes do Ingresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Evento:</span>
                <span className="text-white font-medium">{ticketInfo.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tipo:</span>
                <span className="text-white">{ticketInfo.ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor:</span>
                <span className="text-white font-medium">{ticketInfo.price}</span>
              </div>
            </CardContent>
          </Card>

          {/* Descrição e Aviso */}
          <div className="space-y-4">
            <p className="text-zinc-300">{content.description}</p>
            
            <Alert className="bg-amber-950 border-amber-800">
              <Info className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-200">
                {content.warningText}
              </AlertDescription>
            </Alert>
          </div>

          {/* Campo de Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">
              {content.notesLabel}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={content.notesPlaceholder}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-zinc-500">
              {notes.length}/500 caracteres
            </p>
          </div>

          {/* Upload de Evidência (Opcional) */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Evidência (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 text-sm mb-4">
                {isMarkTransferred 
                  ? "Anexe uma foto do comprovante de transferência, conversa ou recibo."
                  : "Anexe uma foto do ingresso recebido ou comprovante de recebimento."
                }
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {evidenceFile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Arquivo anexado</span>
                  </div>
                  
                  {evidencePreview && (
                    <div className="relative w-32 h-32 bg-zinc-800 rounded-lg overflow-hidden">
                      <img
                        src={evidencePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-zinc-400">{evidenceFile.name}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Alterar arquivo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-dashed border-zinc-600 hover:border-zinc-500"
                >
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                    <span className="text-sm text-zinc-400">Clique para anexar imagem</span>
                  </div>
                </Button>
              )}

              {evidenceError && (
                <p className="text-red-400 text-xs mt-2">{evidenceError}</p>
              )}
            </CardContent>
          </Card>

          {/* Erro Geral */}
          {error && (
            <Alert className="bg-red-950 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`flex-1 ${
                isMarkTransferred 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  {isMarkTransferred ? (
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {content.confirmText}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}