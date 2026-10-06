const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function errorDetail(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => typeof item === 'object' && item !== null && 'msg' in item && typeof item.msg === 'string' ? item.msg : null)
      .filter((message): message is string => Boolean(message))
    return messages.length ? messages.join('. ') : null
  }
  if (typeof detail === 'object' && detail !== null && 'message' in detail && typeof detail.message === 'string') return detail.message
  return null
}

async function responseError(response: Response, fallback: string): Promise<Error> {
  const payload = await response.json().catch(() => null) as { detail?: unknown } | null
  return new Error(errorDetail(payload?.detail) || `${fallback} (${response.status})`)
}

function authHeaders(): Record<string,string> {
  const token=localStorage.getItem('pupas-auth-token')
  return token?{Authorization:`Bearer ${token}`}:{ }
}

export function apiAsset(path: string): string {
  return `${API_URL}${path}`
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders() },
  })

  if (!response.ok) {
    throw new Error(`No se pudo cargar la información (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw await responseError(response, 'No se pudo calcular el carrito')
  }

  return response.json() as Promise<T>
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw await responseError(response, 'No se pudo actualizar')
  }

  return response.json() as Promise<T>
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw await responseError(response, 'No se pudo guardar')
  }
  return response.json() as Promise<T>
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers: authHeaders() })
  if (!response.ok) {
    throw await responseError(response, 'No se pudo eliminar')
  }
}

export async function apiGetBlob(path: string): Promise<Blob> {
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders() })
  if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status})`)
  return response.blob()
}
