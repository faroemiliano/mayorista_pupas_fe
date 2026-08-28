import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '../types/catalog'
import type { CartItem } from '../types/cart'

const STORAGE_KEY = 'pupas-mayorista-cart'

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  totalUnits: number
  addItem: (product: Product, quantity: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as CartItem[] : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    totalUnits: items.reduce((total, item) => total + item.quantity, 0),
    addItem(product, quantity) {
      const maxStock = Math.floor(Number(product.stock_disponible))
      if (quantity < 1 || maxStock < 1) return

      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id)
        if (!existing) {
          return [...current, { product, quantity: Math.min(quantity, maxStock) }]
        }
        return current.map((item) => item.product.id === product.id
          ? { ...item, product, quantity: Math.min(item.quantity + quantity, maxStock) }
          : item)
      })
      setIsOpen(true)
    },
    updateQuantity(productId, quantity) {
      setItems((current) => current
        .map((item) => {
          if (item.product.id !== productId) return item
          const maxStock = Math.floor(Number(item.product.stock_disponible))
          return { ...item, quantity: Math.min(Math.max(quantity, 0), maxStock) }
        })
        .filter((item) => item.quantity > 0))
    },
    removeItem(productId) {
      setItems((current) => current.filter((item) => item.product.id !== productId))
    },
    clearCart() {
      setItems([])
    },
    openCart() {
      setIsOpen(true)
    },
    closeCart() {
      setIsOpen(false)
    },
  }), [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe utilizarse dentro de CartProvider')
  return context
}
