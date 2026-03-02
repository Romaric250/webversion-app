interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      <div className="min-w-0">
        <h1 className="page-title text-xl sm:text-2xl">{title}</h1>
        {subtitle && <p className="page-subtitle text-sm sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  )
}
