/**
 * Utilitários para upload e processamento de imagens
 */

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Converte um arquivo de imagem para base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Arquivo deve ser uma imagem' }
  }

  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Imagem deve ter no máximo 5MB' }
  }

  // Verificar tipos permitidos
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato não suportado. Use JPEG, PNG, WebP ou GIF' }
  }

  return { valid: true }
}

/**
 * Processa upload de imagem usando Vercel Blob Storage
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Comprimir imagem antes do upload
    const compressedFile = await compressImage(file)

    // Criar FormData para envio
    const formData = new FormData()
    formData.append('image', compressedFile)

    // Fazer upload para a API route do Next.js (que usa Vercel Blob)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { 
        success: false, 
        error: errorData.error || `Erro no upload: ${response.status}` 
      }
    }

    const data = await response.json()
    return { success: true, url: data.url }
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload' 
    }
  }
}

/**
 * Comprime uma imagem mantendo qualidade aceitável
 */
export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calcular dimensões mantendo proporção
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback para arquivo original
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}