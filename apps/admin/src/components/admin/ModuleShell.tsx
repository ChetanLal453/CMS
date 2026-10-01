'use client'

import type { ReactNode } from 'react'

interface ModuleShellProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export default function ModuleShell({ title, description, actions, children, className }: ModuleShellProps) {
  return (
    <section className={className ? `module-shell ${className}` : 'module-shell'}>
      <div className="pg-hd">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="pg-actions">{actions}</div> : null}
      </div>
      {children}
      <style jsx>{`
        :global(.cm-admin-shell .module-shell) {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }
      `}</style>
    </section>
  )
}
