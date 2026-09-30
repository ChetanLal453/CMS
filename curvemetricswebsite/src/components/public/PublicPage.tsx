import React from 'react'
import Link from 'next/link'
import { getComponentRenderer } from '@/components/registry'
import type { AdminNavigationItem, AdminPageBundle } from '@/lib/admin-pages'
import { reportCmsBoundaryViolation, reportRecoverableCmsBoundaryViolation } from '../../lib/cmsBoundary'
import { buildPublicPageView, type PublicPageView, type PublicSectionView } from '../../../../shared/page/viewHelpers'
import { createBlockViewModel } from '../../../../shared/blocks/registry'

function getEnvironment() {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

function isExternalUrl(href?: string) {
  return /^https?:\/\//i.test(String(href || '').trim())
}

function LinkOrAnchor({
  href,
  children,
  className,
  target,
  rel,
  style,
  title,
  ariaLabel,
}: {
  href?: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
  style?: React.CSSProperties
  title?: string
  ariaLabel?: string
}) {
  const safeHref = String(href || '').trim()

  if (!safeHref) {
    reportRecoverableCmsBoundaryViolation('navigation', 'Missing required navigation href.')
    return (
      <span className={className} style={style} title={title} aria-label={ariaLabel}>
        {children}
      </span>
    )
  }

  if (isExternalUrl(safeHref)) {
    return (
      <a href={safeHref} className={className} target={target} rel={rel} style={style} title={title} aria-label={ariaLabel}>
        {children}
      </a>
    )
  }

  return (
    <Link href={safeHref} className={className} target={target} rel={rel} style={style} title={title} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}

function NavigationList({
  items = [],
  tone = 'light',
  layout = 'horizontal',
}: {
  items?: AdminNavigationItem[]
  tone?: 'light' | 'dark'
  layout?: 'horizontal' | 'vertical'
}) {
  if (!items.length) {
    return null
  }

  return (
    <ul
      className={
        layout === 'horizontal'
          ? 'm-0 d-flex list-unstyled flex-column gap-2 p-0 d-lg-flex flex-lg-row flex-lg-wrap gap-lg-4'
          : 'm-0 d-flex list-unstyled flex-column gap-2 p-0'
      }>
      {items.map((item) => (
        <NavigationListItem key={item.id || `${item.label || 'nav-item'}`} item={item} tone={tone} />
      ))}
    </ul>
  )
}

function NavigationListItemInner({
  item,
  tone,
  label,
}: {
  item: AdminNavigationItem
  tone: 'light' | 'dark'
  label: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [openUpward, setOpenUpward] = React.useState(false)
  const hasChildren = !!item.children?.length
  const linkClass = tone === 'dark' ? 'text-white' : 'text-dark'
  const submenuClass = tone === 'dark' ? 'border-dark bg-black text-white' : 'border-light bg-white'

  React.useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector(`[data-nav-item="${CSS.escape(String(item.id || item.label || 'nav-item'))}"]`) as HTMLElement | null
      if (!target) {
        return
      }

      const dropdown = target.querySelector('[data-nav-dropdown="true"]') as HTMLElement | null
      if (!dropdown) {
        return
      }

      const rect = dropdown.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.top
      setOpenUpward(spaceBelow < rect.height + 24)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, item.id, item.label])

  return (
    <li
      className="position-relative"
      data-nav-item={String(item.id || item.label || 'nav-item')}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false)
        setOpenUpward(false)
      }}>
      <div className="d-flex align-items-center gap-2">
        <LinkOrAnchor
          href={item.href}
          className={`text-decoration-none small fw-semibold ${linkClass}`}
          target={item.open_new_tab ? '_blank' : undefined}
          rel={item.open_new_tab ? 'noreferrer noopener' : undefined}>
          {label}
        </LinkOrAnchor>
        {hasChildren ? <span className={`small ${tone === 'dark' ? 'text-white-50' : 'text-secondary'}`}>▾</span> : null}
      </div>

      {hasChildren ? (
        <>
          <div className="mt-2 border-start ps-3 d-lg-none">
            <NavigationList items={item.children} tone={tone} layout="vertical" />
          </div>
          <div
            data-nav-dropdown="true"
            className={`rounded-4 border p-3 shadow-lg position-absolute start-0 ${submenuClass}`}
            style={{
              minWidth: 220,
              display: isOpen ? 'block' : 'none',
              top: openUpward ? 'auto' : 'calc(100% + 2px)',
              bottom: openUpward ? '100%' : 'auto',
              zIndex: 30,
            }}>
            <NavigationList items={item.children} tone={tone} layout="vertical" />
          </div>
        </>
      ) : null}
    </li>
  )
}

function NavigationListItem({
  item,
  tone,
}: {
  item: AdminNavigationItem
  tone: 'light' | 'dark'
}) {
  const label = String(item.label || '').trim()

  if (!label) {
    reportRecoverableCmsBoundaryViolation('navigation', 'Missing required navigation label.')
    return null
  }

  return <NavigationListItemInner item={item} tone={tone} label={label} />
}

function renderComponent(component: { id: string | number; type: string; props: Record<string, any> }): React.ReactNode {
  let Renderer: React.ComponentType<any>

  try {
    Renderer = getComponentRenderer(component.type)
  } catch {
    const traceId = 'unknown-trace'
    if (getEnvironment() !== 'production') {
      throw new Error(`Unsupported component type: ${component.type || 'unknown'}`)
    }

    console.error('public_page_unknown_block', { traceId, type: component.type })
    return (
      <div className="rounded-3 border border-warning-subtle bg-warning-subtle p-3 text-warning-emphasis">
        Unsupported component type: <code>{component.type || 'unknown'}</code>
      </div>
    )
  }

  return (
    <div className="component-wrapper">
      <Renderer
        {...component.props}
        __sharedViewModel={createBlockViewModel(component.type, component.props)}
        _isInPageLayout={true}
        isPageView={true}
        hideLayout={true}
        suppressContainer={true}
        renderComponent={renderComponent}
      />
    </div>
  )
}

function getSectionRowAlignment(style?: Record<string, any>): React.CSSProperties['alignItems'] {
  if (style?.alignItems === 'center' || style?.alignItems === 'flex-end' || style?.alignItems === 'flex-start' || style?.alignItems === 'stretch') {
    return style.alignItems
  }

  return 'flex-start'
}

function PublicHeader({ view }: { view: ReturnType<typeof buildPublicPageView>['header'] }) {
  if (!view.visible) {
    return null
  }

  return (
    <header className={`border-bottom ${view.style.zIndex ? 'sticky-top' : 'position-relative'}`} style={view.style}>
      <div className="mx-auto d-flex flex-wrap align-items-center gap-4 px-4 py-4" style={{ maxWidth: '80rem', width: '100%' }}>
        <div className="d-flex min-w-0 align-items-center gap-3">
          {view.logoSrc ? <img src={view.logoSrc} alt={view.name || ''} style={{ height: 40, width: 'auto' }} /> : null}
          <div className="min-w-0">
            <div className="text-truncate fw-semibold">{view.name}</div>
          </div>
        </div>

        <div className="ms-lg-auto d-none flex-grow-1 justify-content-center d-lg-flex">
          <NavigationList items={view.navigationItems} tone={view.tone} />
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          {view.ctaLabel ? (
            <LinkOrAnchor href={view.ctaHref} className={view.ctaClassName} style={view.ctaStyle}>
              {view.ctaLabel}
            </LinkOrAnchor>
          ) : null}
          {view.navigationItems.length ? (
            <details className="position-relative d-lg-none">
              <summary
                className={`list-unstyled rounded-pill border px-4 py-2 small fw-semibold ${
                  view.tone === 'dark' ? 'border-light bg-white bg-opacity-10 text-white' : 'border-secondary bg-white text-dark'
                }`}
                style={{ listStyle: 'none' }}>
                Menu
              </summary>
              <div
                className={`position-absolute end-0 z-3 mt-3 rounded-4 border p-3 shadow-lg ${
                  view.tone === 'dark' ? 'border-dark bg-black text-white' : 'border-light bg-white'
                }`}
                style={{ minWidth: 'min(90vw, 22rem)' }}>
                <NavigationList items={view.navigationItems} tone={view.tone} />
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function PublicBanner({ view, accent }: { view: ReturnType<typeof buildPublicPageView>['banner']; accent: string }) {
  if (!view.visible) {
    return null
  }

  return (
    <section className="border-bottom" style={view.style}>
      <div className="container py-5">
        <div className="text-uppercase small fw-semibold text-secondary" style={{ letterSpacing: '0.08em' }}>
          {view.name}
        </div>
        {view.title ? <h1 className="mt-2 display-5 fw-semibold text-dark">{view.title}</h1> : null}
        {view.subtitle ? <p className="mt-3 lead text-secondary">{view.subtitle}</p> : null}
        {view.description ? <p className="mt-3 text-secondary">{view.description}</p> : null}
        {view.buttonLabel ? (
          <div className="mt-4">
            <LinkOrAnchor
              href={view.buttonHref}
              className="btn rounded-pill px-4 py-2 text-white text-decoration-none"
              style={{ backgroundColor: accent, borderColor: accent }}>
              {view.buttonLabel}
            </LinkOrAnchor>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function PublicFooter({
  view,
}: {
  view: ReturnType<typeof buildPublicPageView>['footer']
}) {
  if (!view.visible) {
    return null
  }

  return (
    <footer className={view.darkSurface ? 'border-top text-white' : 'border-top bg-light'} style={view.style}>
      <div className="container py-5">
        <div className="d-grid gap-4" style={view.gridStyle}>
          <div>
            <div className={`h5 fw-semibold ${view.headingClassName}`}>{view.name}</div>
            {view.logoUrl ? <img src={view.logoUrl} alt={view.name || 'Footer logo'} className="mt-3" style={{ height: 40, width: 'auto' }} /> : null}
            {(view.companyAddress || view.companyEmail || view.companyPhone) ? (
              <div className={`mt-4 rounded-4 border p-4 ${view.darkSurface ? 'border-light' : 'border-secondary-subtle bg-white'}`}>
                <div className={`fw-semibold ${view.headingClassName}`}>Company</div>
                <div className={`mt-2 small ${view.subheadingClassName}`} style={{ display: 'grid', gap: '8px' }}>
                  {view.companyAddress ? <div>{view.companyAddress}</div> : null}
                  {view.companyEmail ? (
                    <a className={`text-decoration-none ${view.linkClassName}`} href={`mailto:${view.companyEmail}`}>
                      {view.companyEmail}
                    </a>
                  ) : null}
                  {view.companyPhone ? (
                    <a className={`text-decoration-none ${view.linkClassName}`} href={`tel:${view.companyPhone.replace(/[^\d+]/g, '')}`}>
                      {view.companyPhone}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
            {view.newsletterEnabled ? (
              <div className={`mt-4 rounded-4 border p-4 ${view.darkSurface ? 'border-light' : 'border-secondary-subtle bg-white'}`}>
                <div className={`fw-semibold ${view.headingClassName}`}>Stay in the loop</div>
                <p className={`mt-2 mb-0 small ${view.subheadingClassName}`}>Get updates, insights, and announcements delivered to your inbox.</p>
                <div className="mt-3">
                  <LinkOrAnchor href="/contact" className={view.newsletterButtonClassName} style={view.newsletterButtonStyle}>
                    Join newsletter
                  </LinkOrAnchor>
                </div>
              </div>
            ) : null}
          </div>

          {view.columns.map((column) => (
            <div key={column.id}>
              <div className={`small text-uppercase fw-semibold ${view.subheadingClassName}`}>{column.heading}</div>
              <div className="mt-3 d-flex flex-column gap-2">
                {column.links.map((link) => (
                  <LinkOrAnchor key={link.id} href={link.href} className={`text-decoration-none small ${view.linkClassName}`}>
                    {link.label}
                  </LinkOrAnchor>
                ))}
              </div>
            </div>
          ))}
        </div>

        {view.socialLinks.length ? (
          <div className={`mt-4 d-flex flex-wrap gap-3 align-items-center footer-socials-${view.socialStyle}`}>
            {view.socialLinks.map((link) => (
              <LinkOrAnchor
                key={link.id}
                href={link.href}
                className={`text-decoration-none small ${view.linkClassName}`}
                style={view.socialLinkStyle}
                ariaLabel={link.label}
                title={link.label}>
                {view.socialStyle === 'text' ? (
                  link.label
                ) : (
                  <span style={view.socialGlyphStyle}>
                    <i className={link.iconClass} aria-hidden="true" />
                  </span>
                )}
              </LinkOrAnchor>
            ))}
          </div>
        ) : null}

        <div className={`mt-4 small ${view.copyrightClassName}`}>{view.copyright}</div>
      </div>
    </footer>
  )
}

function RenderSection({ sectionView }: { sectionView: PublicSectionView }) {
  switch (sectionView.kind) {
    case 'hero':
      return (
        <section className={sectionView.className} style={sectionView.style}>
          <div className="container">
            {sectionView.showBadge ? (
              <div className="mb-3 d-inline-flex rounded-pill px-3 py-1 small fw-semibold text-uppercase" style={sectionView.badgeStyle}>
                {sectionView.badgeText}
              </div>
            ) : null}
            <div className={sectionView.layoutClassName}>
              <div className={sectionView.imageSrc ? 'col-lg-7' : 'col-12'}>
                <h1 className={`display-5 fw-semibold ${sectionView.titleClassName}`}>{sectionView.title}</h1>
                {sectionView.subtitle ? <p className={`lead mt-3 ${sectionView.bodyClassName}`}>{sectionView.subtitle}</p> : null}
                {sectionView.description ? <p className={`mt-3 ${sectionView.bodyClassName}`}>{sectionView.description}</p> : null}
                {sectionView.ctaLabel ? (
                  <div className="mt-4">
                    <LinkOrAnchor href={sectionView.ctaHref} className="btn btn-lg rounded-pill text-white text-decoration-none" style={sectionView.ctaStyle}>
                      {sectionView.ctaLabel}
                    </LinkOrAnchor>
                  </div>
                ) : null}
              </div>
              {sectionView.imageSrc ? (
                <div className="col-lg-5">
                  <div className="overflow-hidden rounded-4 border bg-white shadow-sm">
                    <img src={sectionView.imageSrc} alt={sectionView.imageAlt} className="img-fluid w-100" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )

    case 'feature-list':
      return (
        <section className="py-5" style={sectionView.style}>
          <div className="container">
            <div className="mb-4">
              <h2 className="h1 fw-semibold text-dark">{sectionView.title}</h2>
              {sectionView.subtitle ? <p className="mt-3 text-secondary">{sectionView.subtitle}</p> : null}
            </div>
            <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: `repeat(${sectionView.columns}, minmax(0, 1fr))` }}>
              {sectionView.items.length ? (
                sectionView.items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-4 border bg-white p-4 shadow-sm"
                    style={{ borderColor: 'rgba(15, 23, 42, 0.08)', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)' }}>
                    <div className="small fw-semibold text-uppercase text-secondary" style={{ letterSpacing: '0.08em' }}>
                      {item.indexLabel}
                    </div>
                    <h3 className="h5 mt-3 fw-semibold text-dark">{item.title}</h3>
                    <p className="mt-2 mb-0 text-secondary">{item.description}</p>
                  </article>
                ))
              ) : (
                <div className="text-secondary">No feature items were provided by admin.</div>
              )}
            </div>
          </div>
        </section>
      )

    case 'gallery':
      return (
        <section className="py-5" style={sectionView.style}>
          <div className="container">
            <div className="mb-4">
              <h2 className="h1 fw-semibold text-dark">{sectionView.title}</h2>
              {sectionView.subtitle ? <p className="mt-3 text-secondary">{sectionView.subtitle}</p> : null}
            </div>
            <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: `repeat(${sectionView.columns}, minmax(0, 1fr))` }}>
              {sectionView.items.length ? (
                sectionView.items.map((item) => (
                  <div key={item.id} className="overflow-hidden border bg-white shadow-sm" style={sectionView.frameStyle}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.alt} className="h-100 w-100 object-fit-cover" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center py-5 text-secondary">{item.emptyLabel}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-secondary">No gallery images were provided by admin.</div>
              )}
            </div>
          </div>
        </section>
      )

    case 'slider':
      return (
        <section className="py-5" style={sectionView.style}>
          <div className="container">
            <div className="mb-4">
              <h2 className="h1 fw-semibold text-dark">{sectionView.title}</h2>
              {sectionView.subtitle ? <p className="mt-3 text-secondary">{sectionView.subtitle}</p> : null}
            </div>
            <div className="d-flex gap-3 overflow-auto pb-2">
              {sectionView.items.length ? (
                sectionView.items.map((item) => (
                  <article key={item.id} className="flex-shrink-0 rounded-4 border bg-white shadow-sm" style={sectionView.cardStyle}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="img-fluid rounded-top-4" /> : null}
                    <div className="p-4">
                      <h3 className="h5 fw-semibold text-dark">{item.title}</h3>
                      {item.description ? <p className="mb-0 text-secondary">{item.description}</p> : null}
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-secondary">No slider items were provided by admin.</div>
              )}
            </div>
          </div>
        </section>
      )

    case 'default':
      if (!sectionView.visible) {
        return null
      }

      return (
        <section style={sectionView.style} data-section-id={String(sectionView.id)}>
          <div style={sectionView.containerStyle}>
            {sectionView.showTitle ? (
              <div className="mb-5 text-center">
                <h2 className="position-relative m-0 pb-3 fw-semibold text-dark">
                  {sectionView.title}
                  <span style={sectionView.titleUnderlineStyle} />
                </h2>
              </div>
            ) : null}
            {typeof sectionView.content === 'string' && sectionView.content ? (
              <div className="mb-4 text-center lead text-secondary">{sectionView.content}</div>
            ) : typeof sectionView.content === 'object' && typeof (sectionView.content as any)?.content === 'string' && (sectionView.content as any).content ? (
              <div className="mb-4 text-center lead text-secondary">{(sectionView.content as any).content}</div>
            ) : null}
            {sectionView.rows.map((row) => (
              <div key={row.id} className="d-flex flex-wrap" style={{ ...row.style, alignItems: getSectionRowAlignment(row.style) }}>
                {row.columns.map((column) => (
                  <div key={column.id} style={column.style}>
                    {column.components.map((component, componentIndex) => (
                      <div key={component.id || `${column.id}-${componentIndex + 1}`} className="mb-4">
                        {renderComponent(component)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )
  }
}

export function PublicPage({
  bundle,
  pageView: providedPageView,
  children,
}: {
  bundle?: AdminPageBundle
  pageView?: PublicPageView
  children?: React.ReactNode
}) {
  const pageView = providedPageView ?? (bundle ? buildPublicPageView(bundle) : null)

  if (!pageView) {
    return reportCmsBoundaryViolation('public-page', 'Missing required public page data.')
  }

  return (
    <div className="min-vh-100 text-dark" style={pageView.shellStyle}>
      <PublicHeader view={pageView.header} />
      <PublicBanner view={pageView.banner} accent={pageView.theme.accent} />
      {children ? (
        <main>{children}</main>
      ) : pageView.sections.length ? (
        <main>
          {pageView.sections.map((sectionView) => (
            <RenderSection key={sectionView.id} sectionView={sectionView} />
          ))}
        </main>
      ) : (
        <main className="container py-5">
          <div className="rounded-4 border p-5 text-center text-secondary" style={pageView.emptyStateStyle}>
            No content available from admin. Trace ID: <code>{pageView.traceId}</code>
          </div>
        </main>
      )}
      <PublicFooter view={pageView.footer} />
    </div>
  )
}
