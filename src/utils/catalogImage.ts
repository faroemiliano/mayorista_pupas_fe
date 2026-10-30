const MAX_SOURCE_BYTES = 30 * 1024 * 1024
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024
const MAX_PIXELS = 50_000_000
const MAX_SIDE = 2000
const WEBP_QUALITY = 0.82
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('La foto está dañada o el navegador no puede leerla.'))
    }
    image.src = url
  })
}

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== 'image/webp') {
        reject(new Error('Este navegador no pudo convertir la foto a WebP.'))
        return
      }
      resolve(blob)
    }, 'image/webp', WEBP_QUALITY)
  })
}

export async function optimizeCatalogImage(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`${file.name}: usá una foto JPG, PNG o WebP.`)
  }
  if (file.size <= 0 || file.size > MAX_SOURCE_BYTES) {
    throw new Error(`${file.name}: la foto original puede pesar hasta 30 MB.`)
  }

  const image = await loadImage(file)
  if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) {
    throw new Error(`${file.name}: la foto tiene demasiados píxeles.`)
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('El navegador no pudo preparar la foto.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const blob = await canvasToWebp(canvas)
  canvas.width = 1
  canvas.height = 1
  if (blob.size > MAX_OUTPUT_BYTES) {
    throw new Error(`${file.name}: la versión optimizada todavía supera los 8 MB.`)
  }
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto'
  return new File([blob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}
