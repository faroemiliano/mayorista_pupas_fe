const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

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
    const error = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(error?.detail || `No se pudo calcular el carrito (${response.status})`)
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
    const error = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(error?.detail || `No se pudo actualizar (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers: authHeaders() })
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(error?.detail || `No se pudo eliminar (${response.status})`)
  }
}

export async function apiGetBlob(path: string): Promise<Blob> {
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders() })
  if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status})`)
  return response.blob()
}
