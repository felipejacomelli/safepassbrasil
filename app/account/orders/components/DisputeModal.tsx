"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useDisputes } from "@/hooks/use-disputes"

// Schema de validação
const disputeSchema = z.object({
  fullName: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  orderNumber: z.string()
    .min(1, "Número do pedido é obrigatório")
    .max(50, "Número do pedido deve ter no máximo 50 caracteres"),
  email: z.string()
    .email("E-mail inválido")
    .max(100, "E-mail deve ter no máximo 100 caracteres"),
  phone: z.string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Telefone deve conter apenas números e símbolos válidos"),
  description: z.string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres")
})

type DisputeFormData = z.infer<typeof disputeSchema>

interface UploadedFile {
  id: string
  file: File
  preview?: string
  uploading: boolean
  error?: string
}

interface DisputeModalProps {
  isOpen: boolean
  onClose: () => void
  ticketData?: {
    id: string
    orderNumber: string
    eventName: string
    ticketType: string
  }
}

export function DisputeModal({ isOpen, onClose, ticketData }: DisputeModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [validationError, setValidationError] = useState<string | null>(null)
  
  // Hook para integração com API
  const { 
    loading, 
    error, 
    validateTicketForDispute, 
    uploadEvidence, 
    createDispute 
  } = useDisputes()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      fullName: "",
      orderNumber: ticketData?.orderNumber || "",
      email: "",
      phone: "",
      description: ""
    }
  })

  const description = watch("description")
  const remainingChars = 500 - (description?.length || 0)

  // Função para gerar ID único
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Validação de arquivo
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de arquivo não permitido. Use PDF, JPG ou PNG."
    }

    if (file.size > maxSize) {
      return "Arquivo muito grande. Máximo 5MB."
    }

    return null
  }

  // Upload de arquivos
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (uploadedFiles.length + files.length > 5) {
      toast.error("Máximo de 5 arquivos permitidos")
      return
    }

    files.forEach(file => {
      const error = validateFile(file)
      
      if (error) {
        toast.error(error)
        return
      }

      const fileId = generateId()
      const newFile: UploadedFile = {
        id: fileId,
        file,
        uploading: true
      }

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, preview: e.target?.result as string, uploading: false }
                : f
            )
          )
        }
        reader.readAsDataURL(file)
      } else {
        // Para PDFs, apenas marcar como não carregando
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, uploading: false }
                : f
            )
          )
        }, 500)
      }

      setUploadedFiles(prev => [...prev, newFile])
    })

    // Limpar input
    event.target.value = ''
  }, [uploadedFiles.length])

  // Remover arquivo
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  // Validar ticket ao abrir modal
  const validateTicket = useCallback(async () => {
    if (!ticketData) return

    try {
      const validation = await validateTicketForDispute(ticketData.id, ticketData.orderNumber)
      
      if (!validation.canCreateDispute) {
        setValidationError(validation.error || 'Não é possível criar disputa para este ticket')
        return false
      }
      
      setValidationError(null)
      return true
    } catch (err) {
      setValidationError('Erro ao validar ticket')
      return false
    }
  }, [ticketData, validateTicketForDispute])

  // Submissão do formulário com integração real
  const onSubmit = async (data: DisputeFormData) => {
    setIsSubmitting(true)
    setValidationError(null)

    try {
      // 1. Validar ticket
      if (!ticketData) {
        throw new Error('Dados do ticket não encontrados')
      }

      const isValid = await validateTicket()
      if (!isValid) {
        return
      }

      // 2. Upload de evidências (se houver)
      const evidenceUrls: string[] = []
      
      if (uploadedFiles.length > 0) {
        toast.info(`Enviando ${uploadedFiles.length} arquivo(s)...`)
        
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i]
          
          try {
            setUploadProgress(prev => ({ ...prev, [file.id]: 0 }))
            toast.info(`Enviando arquivo ${i + 1} de ${uploadedFiles.length}...`)
            
            const url = await uploadEvidence(file.file)
            evidenceUrls.push(url)
            
            setUploadProgress(prev => ({ ...prev, [file.id]: 100 }))
          } catch (err) {
            console.error(`Erro ao fazer upload do arquivo ${file.file.name}:`, err)
            toast.error(`Erro ao enviar ${file.file.name}. Tente novamente.`)
            return
          }
        }
      }

      // 3. Buscar escrow_transaction_id
      const { getEscrowByOrderId } = useDisputes()
      const escrow = await getEscrowByOrderId(ticketData.orderNumber)
      
      if (!escrow) {
        throw new Error('Escrow não encontrado para este pedido')
      }

      // 4. Criar disputa
      const disputeData = {
        escrow_transaction: escrow.id,
        dispute_type: 'other', // Por enquanto, sempre 'other'. Pode ser expandido depois
        description: data.description,
        evidence: evidenceUrls,
        disputed_amount: parseFloat('0') // Valor será calculado pelo backend baseado no escrow
      }

      const result = await createDispute(disputeData)

      toast.success("Disputa enviada com sucesso! Você receberá uma resposta em até 48 horas.")
      
      // Reset do formulário
      reset()
      setUploadedFiles([])
      setUploadProgress({})
      onClose()

    } catch (error) {
      console.error('Erro ao enviar disputa:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar disputa. Tente novamente.'
      toast.error(errorMessage)
      setValidationError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue("phone", formatted)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">
            Abrir Disputa/Reclamação
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados abaixo para abrir uma disputa sobre seu ingresso. 
            Nossa equipe analisará seu caso em até 48 horas.
          </DialogDescription>
        </DialogHeader>

        {/* Informações do ingresso (se disponível) */}
        {ticketData && (
          <div className="bg-accent rounded-lg p-4 mb-6">
            <h3 className="text-foreground font-medium mb-2">Dados do Ingresso</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="text-muted-foreground">Evento:</span> {ticketData.eventName}</p>
              <p><span className="text-muted-foreground">Tipo:</span> {ticketData.ticketType}</p>
              <p><span className="text-muted-foreground">Pedido:</span> {ticketData.orderNumber}</p>
            </div>
          </div>
        )}

        {/* Erro de validação */}
        {validationError && (
          <Alert className="bg-red-900/20 border-red-700 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Erro geral */}
        {error && (
          <Alert className="bg-red-900/20 border-red-700 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campos obrigatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                className="bg-accent border-border text-foreground"
                placeholder="Seu nome completo"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber" className="text-foreground">
                Número do Pedido/Ingresso *
              </Label>
              <Input
                id="orderNumber"
                {...register("orderNumber")}
                className="bg-accent border-border text-foreground"
                placeholder="Ex: #12345"
              />
              {errors.orderNumber && (
                <p className="text-red-400 text-sm">{errors.orderNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail para Contato *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-accent border-border text-foreground"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Telefone para Contato *
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                onChange={handlePhoneChange}
                className="bg-accent border-border text-foreground"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Descrição detalhada */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Descrição Detalhada *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              className="bg-accent border-border text-foreground min-h-[120px]"
              placeholder="Descreva detalhadamente o problema ou motivo da disputa. Inclua datas, horários e qualquer informação relevante."
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description.message}</p>
              )}
              <p className={`text-sm ${remainingChars < 50 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                {remainingChars} caracteres restantes
              </p>
            </div>
          </div>

          {/* Upload de arquivos */}
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Anexos/Comprovação</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Anexe comprovantes, prints ou documentos relevantes (PDF, JPG, PNG - máx. 5MB cada, até 5 arquivos)
              </p>
            </div>

            {/* Área de upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadedFiles.length >= 5}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${uploadedFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  {uploadedFiles.length >= 5 
                    ? "Limite de 5 arquivos atingido"
                    : "Clique para selecionar arquivos ou arraste aqui"
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG - máx. 5MB cada
                </p>
              </label>
            </div>

            {/* Lista de arquivos */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-foreground font-medium">Arquivos Anexados:</h4>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 bg-accent rounded-lg p-3">
                    <div className="flex-shrink-0">
                      {file.file.type.startsWith('image/') ? (
                        file.preview ? (
                          <img 
                            src={file.preview} 
                            alt="Preview" 
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        )
                      ) : (
                        <FileText className="w-10 h-10 text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm truncate">{file.file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {file.uploading || uploadProgress[file.id] !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        {uploadProgress[file.id] !== undefined && (
                          <span className="text-xs text-blue-400">
                            {uploadProgress[file.id]}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações importantes */}
          <Alert className="bg-blue-900/20 border-blue-700">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Importante:</strong> Todas as disputas são analisadas individualmente. 
              Mantenha seus dados de contato atualizados para receber atualizações sobre o processo.
            </AlertDescription>
          </Alert>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-border text-foreground hover:bg-accent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviar Reclamação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}