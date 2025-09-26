/**
 * Utilitário para detectar e ofuscar QR codes em imagens
 * Implementa detecção básica de padrões quadrados que podem ser QR codes
 */

export interface QRDetectionResult {
  hasQRCode: boolean
  qrRegions: Array<{
    x: number
    y: number
    width: number
    height: number
  }>
}

/**
 * Detecta possíveis QR codes em uma imagem usando análise de canvas
 */
export function detectQRCodes(imageElement: HTMLImageElement): Promise<QRDetectionResult> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve({ hasQRCode: false, qrRegions: [] })
      return
    }

    canvas.width = imageElement.width
    canvas.height = imageElement.height
    
    ctx.drawImage(imageElement, 0, 0)
    
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const qrRegions = findQRPatterns(imageData)
      
      resolve({
        hasQRCode: qrRegions.length > 0,
        qrRegions
      })
    } catch (error) {
      console.warn('Erro ao detectar QR codes:', error)
      resolve({ hasQRCode: false, qrRegions: [] })
    }
  })
}

/**
 * Procura por padrões quadrados que podem ser QR codes
 * Implementação simplificada baseada em detecção de bordas e padrões
 */
function findQRPatterns(imageData: ImageData): Array<{x: number, y: number, width: number, height: number}> {
  const { data, width, height } = imageData
  const qrRegions: Array<{x: number, y: number, width: number, height: number}> = []
  
  // Converter para escala de cinza para análise
  const grayData = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    grayData[i / 4] = gray
  }
  
  // Procurar por regiões quadradas com alto contraste
  const minSize = Math.min(width, height) * 0.1 // QR code deve ter pelo menos 10% da menor dimensão
  const maxSize = Math.min(width, height) * 0.8 // E no máximo 80%
  
  for (let y = 0; y < height - minSize; y += 10) {
    for (let x = 0; x < width - minSize; x += 10) {
      const region = analyzeRegion(grayData, width, height, x, y, minSize)
      
      if (region.isQRCandidate && region.size >= minSize && region.size <= maxSize) {
        qrRegions.push({
          x: region.x,
          y: region.y,
          width: region.size,
          height: region.size
        })
      }
    }
  }
  
  // Remover regiões sobrepostas (manter a maior)
  return removeDuplicateRegions(qrRegions)
}

/**
 * Analisa uma região específica para determinar se pode ser um QR code
 */
function analyzeRegion(
  grayData: Uint8Array, 
  width: number, 
  height: number, 
  startX: number, 
  startY: number, 
  minSize: number
): { isQRCandidate: boolean, x: number, y: number, size: number } {
  
  let maxSize = Math.min(width - startX, height - startY, minSize * 3)
  
  for (let size = minSize; size <= maxSize; size += 5) {
    if (startX + size >= width || startY + size >= height) break
    
    const contrast = calculateRegionContrast(grayData, width, startX, startY, size)
    const hasSquarePattern = checkSquarePattern(grayData, width, startX, startY, size)
    
    // QR codes têm alto contraste e padrões quadrados característicos
    if (contrast > 100 && hasSquarePattern) {
      return {
        isQRCandidate: true,
        x: startX,
        y: startY,
        size
      }
    }
  }
  
  return { isQRCandidate: false, x: startX, y: startY, size: minSize }
}

/**
 * Calcula o contraste em uma região
 */
function calculateRegionContrast(
  grayData: Uint8Array, 
  width: number, 
  x: number, 
  y: number, 
  size: number
): number {
  let min = 255
  let max = 0
  
  for (let dy = 0; dy < size; dy += 2) {
    for (let dx = 0; dx < size; dx += 2) {
      const idx = (y + dy) * width + (x + dx)
      if (idx < grayData.length) {
        const pixel = grayData[idx]
        min = Math.min(min, pixel)
        max = Math.max(max, pixel)
      }
    }
  }
  
  return max - min
}

/**
 * Verifica se há padrões quadrados característicos de QR codes
 */
function checkSquarePattern(
  grayData: Uint8Array, 
  width: number, 
  x: number, 
  y: number, 
  size: number
): boolean {
  // Verificar cantos para padrões de finder (quadrados nos cantos)
  const cornerSize = Math.floor(size * 0.15)
  
  const corners = [
    { x: x, y: y }, // Top-left
    { x: x + size - cornerSize, y: y }, // Top-right
    { x: x, y: y + size - cornerSize }, // Bottom-left
  ]
  
  let cornerPatterns = 0
  
  for (const corner of corners) {
    if (hasFinderPattern(grayData, width, corner.x, corner.y, cornerSize)) {
      cornerPatterns++
    }
  }
  
  // QR codes têm pelo menos 2 finder patterns visíveis
  return cornerPatterns >= 2
}

/**
 * Verifica se uma região tem padrão de finder (quadrado com bordas alternadas)
 */
function hasFinderPattern(
  grayData: Uint8Array, 
  width: number, 
  x: number, 
  y: number, 
  size: number
): boolean {
  if (size < 5) return false
  
  // Verificar bordas do quadrado
  let darkPixels = 0
  let lightPixels = 0
  const threshold = 128
  
  // Verificar borda superior e inferior
  for (let dx = 0; dx < size; dx++) {
    const topIdx = y * width + (x + dx)
    const bottomIdx = (y + size - 1) * width + (x + dx)
    
    if (topIdx < grayData.length && grayData[topIdx] < threshold) darkPixels++
    else lightPixels++
    
    if (bottomIdx < grayData.length && grayData[bottomIdx] < threshold) darkPixels++
    else lightPixels++
  }
  
  // Verificar bordas esquerda e direita
  for (let dy = 1; dy < size - 1; dy++) {
    const leftIdx = (y + dy) * width + x
    const rightIdx = (y + dy) * width + (x + size - 1)
    
    if (leftIdx < grayData.length && grayData[leftIdx] < threshold) darkPixels++
    else lightPixels++
    
    if (rightIdx < grayData.length && grayData[rightIdx] < threshold) darkPixels++
    else lightPixels++
  }
  
  // Finder patterns têm bordas predominantemente escuras
  return darkPixels > lightPixels * 1.5
}

/**
 * Remove regiões duplicadas/sobrepostas
 */
function removeDuplicateRegions(regions: Array<{x: number, y: number, width: number, height: number}>) {
  const filtered: Array<{x: number, y: number, width: number, height: number}> = []
  
  for (const region of regions) {
    let isOverlapping = false
    
    for (let i = 0; i < filtered.length; i++) {
      const existing = filtered[i]
      
      // Verificar sobreposição
      const overlapX = Math.max(0, Math.min(region.x + region.width, existing.x + existing.width) - Math.max(region.x, existing.x))
      const overlapY = Math.max(0, Math.min(region.y + region.height, existing.y + existing.height) - Math.max(region.y, existing.y))
      const overlapArea = overlapX * overlapY
      
      const regionArea = region.width * region.height
      const existingArea = existing.width * existing.height
      
      // Se há sobreposição significativa (>50%), manter a maior região
      if (overlapArea > Math.min(regionArea, existingArea) * 0.5) {
        isOverlapping = true
        
        if (regionArea > existingArea) {
          filtered[i] = region // Substituir pela região maior
        }
        break
      }
    }
    
    if (!isOverlapping) {
      filtered.push(region)
    }
  }
  
  return filtered
}

/**
 * Ofusca QR codes detectados em uma imagem
 */
export function obfuscateQRCodes(
  imageElement: HTMLImageElement, 
  qrRegions: Array<{x: number, y: number, width: number, height: number}>
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve('')
      return
    }

    canvas.width = imageElement.width
    canvas.height = imageElement.height
    
    // Desenhar imagem original
    ctx.drawImage(imageElement, 0, 0)
    
    // Ofuscar cada região de QR code
    qrRegions.forEach(region => {
      // Aplicar blur/pixelização na região
      const regionData = ctx.getImageData(region.x, region.y, region.width, region.height)
      
      // Pixelizar a região
      const pixelSize = Math.max(4, Math.floor(Math.min(region.width, region.height) / 20))
      pixelateImageData(regionData, pixelSize)
      
      // Aplicar overlay semi-transparente
      ctx.putImageData(regionData, region.x, region.y)
      
      // Adicionar overlay com ícone de segurança
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(region.x, region.y, region.width, region.height)
      
      // Adicionar texto de aviso
      ctx.fillStyle = 'white'
      ctx.font = `${Math.max(12, region.width / 8)}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText('🔒', region.x + region.width / 2, region.y + region.height / 2)
    })
    
    resolve(canvas.toDataURL('image/jpeg', 0.9))
  })
}

/**
 * Pixeliza dados de imagem
 */
function pixelateImageData(imageData: ImageData, pixelSize: number) {
  const { data, width, height } = imageData
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Calcular cor média do bloco
      let r = 0, g = 0, b = 0, a = 0, count = 0
      
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          r += data[idx]
          g += data[idx + 1]
          b += data[idx + 2]
          a += data[idx + 3]
          count++
        }
      }
      
      if (count > 0) {
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        a = Math.round(a / count)
        
        // Aplicar cor média a todo o bloco
        for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            data[idx] = r
            data[idx + 1] = g
            data[idx + 2] = b
            data[idx + 3] = a
          }
        }
      }
    }
  }
}

/**
 * Função principal para processar imagem e ofuscar QR codes automaticamente
 */
export async function processImageWithQRObfuscation(file: File): Promise<{
  processedImageUrl: string
  hasQRCodes: boolean
  qrRegionsFound: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = async () => {
      try {
        // Detectar QR codes
        const detection = await detectQRCodes(img)
        
        if (detection.hasQRCode && detection.qrRegions.length > 0) {
          // Ofuscar QR codes encontrados
          const obfuscatedUrl = await obfuscateQRCodes(img, detection.qrRegions)
          
          resolve({
            processedImageUrl: obfuscatedUrl,
            hasQRCodes: true,
            qrRegionsFound: detection.qrRegions.length
          })
        } else {
          // Nenhum QR code encontrado, retornar imagem original
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            resolve({
              processedImageUrl: canvas.toDataURL('image/jpeg', 0.9),
              hasQRCodes: false,
              qrRegionsFound: 0
            })
          } else {
            reject(new Error('Não foi possível processar a imagem'))
          }
        }
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'))
    }
    
    // Carregar imagem do arquivo
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}