const messages = [
  'Compra mínima: $100.000',
  '5% OFF en efectivo',
  'Descuentos por cantidad',
  'No realizamos cambios',
]

export function AnnouncementBar() {
  return (
    <aside
      className="announcement-bar"
      aria-label="Condiciones de compra"
    >
      <span className="announcement-spark" aria-hidden="true">✦</span>
      <div className="announcement-messages">
        {messages.map((message, index) => (
          <span key={message}>
            {index > 0 && (
              <span className="announcement-divider" aria-hidden="true">•</span>
            )}
            <strong>{message}</strong>
          </span>
        ))}
      </div>
      <span className="announcement-spark" aria-hidden="true">✦</span>
    </aside>
  )
}
