"use client"

import type React from "react"
import { useState, useActionState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Info, Save, AlertCircle, CheckCircle, Upload, Trash2 } from "lucide-react"
import { createEvent, type ActionState } from "@/lib/actions/events"
import { validateImageFile, uploadImage } from "@/lib/upload"
import { categoriesApi, type ApiCategory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewEventPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Estado do formulário usando useActionState
  const [state, formAction] = useActionState(createEvent, {
    success: false,
    message: "",
    errors: {},
  })

  // Estados para controle de UI e dados do formulário
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    category: "", // ID da categoria selecionada
    categoryName: "", // Nome da categoria selecionada
    image: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string>("")

  // Estados para categorias
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string>("")

  // useEffect para carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError("")
        const response = await categoriesApi.getAll()
        setCategories(response)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        setCategoriesError("Erro ao carregar categorias")
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
   }, [])

  // Função para lidar com mudanças no formulário
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEventForm(prev => ({ ...prev, [name]: value }))
  }

  // Função para lidar com upload de imagem
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpar estados anteriores
    setImageError("")
    setImageUploading(true)

    try {
      // Validar arquivo
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setImageError(validation.error || "Arquivo inválido")
        return
      }

      // Fazer upload da imagem
      const uploadResult = await uploadImage(file)
      if (!uploadResult.success) {
        setImageError(uploadResult.error || "Erro no upload")
        return
      }

      // Atualizar estados
      setImageFile(file)
      setImagePreview(uploadResult.url || "")
      setEventForm(prev => ({ ...prev, image: uploadResult.url || "" }))
      
    } catch (error) {
      setImageError("Erro inesperado no upload")
      console.error("Erro no upload:", error)
    } finally {
      setImageUploading(false)
    }
  }

  // Função para remover imagem
  const handleRemoveImage = async () => {
    try {
      // Se há uma imagem no servidor, tentar removê-la
      if (eventForm.image && eventForm.image.startsWith('http')) {
        // Extrair o nome do arquivo da URL
        const urlParts = eventForm.image.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Fazer requisição para remover do servidor
        const token = localStorage.getItem('authToken')
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/delete-image/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ filename }),
          })
        }
      }
    } catch (error) {
      console.error("Erro ao remover imagem do servidor:", error)
      // Continuar com a remoção local mesmo se houver erro no servidor
    }

    // Limpar estados locais
    setImageFile(null)
    setImagePreview("")
    setImageError("")
    setEventForm(prev => ({ ...prev, image: "" }))
    
    // Limpar input file
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Função para preparar dados do formulário para envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se categoria foi selecionada
    if (!eventForm.category || !eventForm.categoryName) {
      console.error("Categoria não selecionada")
      return
    }
    
    // Verificar se imagem foi fornecida (campo obrigatório)
    if (!eventForm.image) {
      console.error("Imagem é obrigatória")
      return
    }
    
    const formData = new FormData()
    
    // Adicionar os campos obrigatórios conforme especificado
    formData.append('name', eventForm.name)
    formData.append('description', eventForm.description)
    formData.append('category', eventForm.categoryName) // Nome da categoria (string)
    formData.append('category_id', eventForm.category) // ID da categoria (string/number)
    formData.append('image', eventForm.image) // Campo obrigatório
    
    console.log("=== DADOS SENDO ENVIADOS ===")
    console.log("Nome:", eventForm.name)
    console.log("Descrição:", eventForm.description)
    console.log("Categoria (nome):", eventForm.categoryName)
    console.log("Category ID:", eventForm.category)
    console.log("Imagem:", eventForm.image)
    
    // Chamar Server Action usando startTransition
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
            <p className="text-muted-foreground mt-2">Preencha as informações básicas para criar um novo evento</p>
          </div>
          <Button 
            onClick={() => router.push('/admin/events')} 
            variant="outline" 
            className="border-border text-foreground hover:bg-accent"
          >
            Voltar
          </Button>
        </div>

        {/* Mensagens de feedback */}
        {state.success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-400">{state.message}</span>
          </div>
        )}

        {state.message && !state.success && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{state.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Info className="w-5 h-5 mr-2" />
                Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">Nome do Evento *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={eventForm.name}
                    onChange={handleEventChange}
                    className="bg-accent border-zinc-600 text-foreground"
                    placeholder="Digite o nome do evento"
                    required
                  />
                  {state.errors?.name && (
                    <p className="text-red-400 text-sm mt-1">{state.errors.name[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category" className="text-foreground">Categoria *</Label>
                  <Select 
                    name="category" 
                    value={eventForm.category} 
                    onValueChange={(value) => {
                      // Encontrar a categoria selecionada para obter o nome
                      const selectedCategory = categories.find(cat => cat.id === value)
                      setEventForm(prev => ({ 
                        ...prev, 
                        category: value,
                        categoryName: selectedCategory?.name || ""
                      }))
                    }}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="bg-accent border-zinc-600 text-foreground">
                      <SelectValue placeholder={
                        categoriesLoading 
                          ? "Carregando categorias..." 
                          : categoriesError 
                            ? "Erro ao carregar categorias" 
                            : "Selecione uma categoria"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-accent border-zinc-600">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoriesError && (
                    <p className="text-yellow-400 text-sm mt-1">
                      {categoriesError}. Tente recarregar a página.
                    </p>
                  )}
                  {state.errors?.category && (
                    <p className="text-red-400 text-sm mt-1">{state.errors.category[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Descrição *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventChange}
                  className="bg-accent border-zinc-600 text-foreground min-h-[100px]"
                  placeholder="Descreva o evento..."
                  required
                />
                {state.errors?.description && (
                  <p className="text-red-400 text-sm mt-1">{state.errors.description[0]}</p>
                )}
              </div>

              <div>
                <Label htmlFor="image" className="text-foreground">Imagem do Evento *</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-accent border-zinc-600 text-foreground"
                      disabled={imageUploading}
                      required
                    />
                    {imageUploading && (
                      <div className="flex items-center text-blue-400">
                        <Upload className="w-4 h-4 mr-2 animate-pulse" />
                        Enviando...
                      </div>
                    )}
                  </div>
                  
                  {imageError && (
                    <p className="text-red-400 text-sm">{imageError}</p>
                  )}
                  
                  {!eventForm.image && (
                    <p className="text-yellow-400 text-sm">
                      A imagem é obrigatória para criar o evento.
                    </p>
                  )}
                  
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-600">
                      <img 
                        src={imagePreview} 
                        alt="Preview do evento" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-600 hover:bg-red-700 rounded-full"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {state.errors?.image && (
                  <p className="text-red-400 text-sm mt-1">{state.errors.image[0]}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <Button
              type="button"
              onClick={() => router.push('/admin/events')}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-foreground"
              disabled={isPending || !eventForm.image || !eventForm.category}
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Criar Evento
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Informação sobre próximos passos */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-medium mb-2">Próximos Passos</h3>
              <p className="text-blue-300 text-sm">
                Após criar o evento, você poderá adicionar ocorrências, tipos de ingressos e ingressos únicos 
                através dos links na barra lateral: <strong>Ocorrências</strong>, <strong>Tipos de Ingressos</strong> e <strong>Ingressos Únicos</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
