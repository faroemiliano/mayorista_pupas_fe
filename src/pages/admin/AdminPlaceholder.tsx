type Props = {
  title: string
  description: string
  icon: string
}

export function AdminPlaceholder({ title, description, icon }: Props) {
  return <div className="admin-page"><header className="admin-page-header"><div><p className="eyebrow">PRÓXIMO MÓDULO</p><h1>{title}</h1><span>{description}</span></div></header><section className="admin-placeholder"><span>{icon}</span><h2>{title} está preparado</h2><p>La estructura visual ya existe. Se habilitará cuando conectemos sus modelos y endpoints.</p></section></div>
}
