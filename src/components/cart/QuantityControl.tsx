type Props = {
  value: number
  max: number
  onChange: (value: number) => void
  compact?: boolean
}

export function QuantityControl({ value, max, onChange, compact = false }: Props) {
  return (
    <div className={`quantity-control ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Disminuir cantidad"
      >−</button>
      <input
        type="number"
        min="1"
        max={max}
        value={value}
        onChange={(event) => onChange(Math.min(Math.max(Number(event.target.value), 1), max))}
        aria-label="Cantidad"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >+</button>
    </div>
  )
}
