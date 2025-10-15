"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  FileImage,
  X
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (verificationData: VerificationData) => void
}

interface VerificationData {
  userConfirmed: boolean
  documentFront: File | null
  documentBack: File | null
  selfie: File | null
}

interface UserData {
  name: string
  email: string
  phone: string
  cpf: string
}

export function VerificationModal({ isOpen, onClose, onComplete }: VerificationModalProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationData, setVerificationData] = useState<VerificationData>({
    userConfirmed: false,
    documentFront: null,
    documentBack: null,
    selfie: null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs para inputs de arquivo
  const documentFrontRef = useRef<HTMLInputElement>(null)
  const documentBackRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  // Dados do usuário (simulados - em produção viriam da API)
  const userData: UserData = {
    name: user?.name || "Nome do Usuário",
    email: user?.email || "usuario@email.com",
    phone: user?.phone || "(11) 99999-9999",
    cpf: user?.cpf || "123.456.789-00"
  }

  const validateFile = (file: File, type: 'document' | 'selfie'): string | null => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

    if (!allowedTypes.includes(file.type)) {
      return "Formato não suportado. Use apenas JPG, JPEG ou PNG."
    }

    if (file.size > maxSize) {
      return "Arquivo muito grande. Máximo 5MB."
    }

    return null
  }

  const handleFileUpload = (file: File, field: keyof VerificationData) => {
    const error = validateFile(file, field === 'selfie' ? 'selfie' : 'document')
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
      return
    }

    setErrors(prev => ({ ...prev, [field]: '' }))
    setVerificationData(prev => ({ ...prev, [field]: file }))
  }

  const handleNext = () => {
    if (currentStep === 1) {
      setVerificationData(prev => ({ ...prev, userConfirmed: true }))
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Validar se os documentos foram enviados
      if (!verificationData.documentFront || !verificationData.documentBack) {
        setErrors(prev => ({ 
          ...prev, 
          documents: "Por favor, envie a frente e o verso do documento." 
        }))
        return
      }
      setErrors(prev => ({ ...prev, documents: '' }))
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!verificationData.selfie) {
      setErrors(prev => ({ ...prev, selfie: "Por favor, envie uma selfie." }))
      return
    }

    setIsSubmitting(true)
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      onComplete(verificationData)
      onClose()
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Erro ao processar verificação." }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Confirme seus dados cadastrais
        </h3>
        <p className="text-zinc-400 text-sm">
          Verifique se suas informações estão corretas antes de prosseguir
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Nome Completo</Label>
              <div className="mt-1 p-3 bg-zinc-800 rounded-md text-white">
                {userData.name}
              </div>
            </div>
            <div>
              <Label className="text-zinc-300">CPF</Label>
              <div className="mt-1 p-3 bg-zinc-800 rounded-md text-white">
                {userData.cpf}
              </div>
            </div>
            <div>
              <Label className="text-zinc-300">E-mail</Label>
              <div className="mt-1 p-3 bg-zinc-800 rounded-md text-white">
                {userData.email}
              </div>
            </div>
            <div>
              <Label className="text-zinc-300">Telefone</Label>
              <div className="mt-1 p-3 bg-zinc-800 rounded-md text-white">
                {userData.phone}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-950 border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          Se algum dado estiver incorreto, você pode atualizá-lo em sua conta antes de continuar.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileImage className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Envie seu documento de identificação
        </h3>
        <p className="text-zinc-400 text-sm">
          Faça upload da frente e verso do seu RG, CNH ou Passaporte
        </p>
      </div>

      {errors.documents && (
        <Alert className="bg-red-950 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            {errors.documents}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frente do documento */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Frente do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={documentFrontRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'documentFront')
              }}
            />
            
            {verificationData.documentFront ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Arquivo enviado</span>
                </div>
                <p className="text-xs text-zinc-400">
                  {verificationData.documentFront.name}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => documentFrontRef.current?.click()}
                  className="w-full"
                >
                  Alterar arquivo
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => documentFrontRef.current?.click()}
                className="w-full h-24 border-dashed border-zinc-600 hover:border-zinc-500"
              >
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Clique para enviar</span>
                </div>
              </Button>
            )}
            
            {errors.documentFront && (
              <p className="text-red-400 text-xs mt-2">{errors.documentFront}</p>
            )}
          </CardContent>
        </Card>

        {/* Verso do documento */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Verso do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={documentBackRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'documentBack')
              }}
            />
            
            {verificationData.documentBack ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Arquivo enviado</span>
                </div>
                <p className="text-xs text-zinc-400">
                  {verificationData.documentBack.name}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => documentBackRef.current?.click()}
                  className="w-full"
                >
                  Alterar arquivo
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => documentBackRef.current?.click()}
                className="w-full h-24 border-dashed border-zinc-600 hover:border-zinc-500"
              >
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Clique para enviar</span>
                </div>
              </Button>
            )}
            
            {errors.documentBack && (
              <p className="text-red-400 text-xs mt-2">{errors.documentBack}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-yellow-950 border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-200">
          Certifique-se de que as imagens estejam nítidas e todos os dados sejam legíveis.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Envie uma selfie para validação
        </h3>
        <p className="text-zinc-400 text-sm">
          Tire uma foto do seu rosto para confirmar sua identidade
        </p>
      </div>

      {errors.selfie && (
        <Alert className="bg-red-950 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            {errors.selfie}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Selfie para Verificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={selfieRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file, 'selfie')
            }}
          />
          
          {verificationData.selfie ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Selfie enviada com sucesso</span>
              </div>
              <p className="text-xs text-zinc-400">
                {verificationData.selfie.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selfieRef.current?.click()}
                className="w-full"
              >
                Tirar nova foto
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => selfieRef.current?.click()}
              className="w-full h-32 border-dashed border-zinc-600 hover:border-zinc-500"
            >
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                <span className="text-sm text-zinc-400">Tirar selfie</span>
              </div>
            </Button>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-blue-950 border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>Dicas para uma boa selfie:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Mantenha o rosto bem iluminado</li>
            <li>• Olhe diretamente para a câmera</li>
            <li>• Remova óculos escuros ou acessórios que cubram o rosto</li>
            <li>• Certifique-se de que a imagem esteja nítida</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Confirmação de Dados"
      case 2: return "Upload de Documentos"
      case 3: return "Verificação Facial"
      default: return "Verificação"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? "bg-blue-600 text-white"
                        : step < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        step < currentStep ? "bg-green-600" : "bg-zinc-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="ml-4">{getStepTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {errors.general && (
          <Alert className="bg-red-950 border-red-800 mt-4">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          <Button
            onClick={currentStep === 3 ? handleComplete : handleNext}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processando...
              </>
            ) : currentStep === 3 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Verificação
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}