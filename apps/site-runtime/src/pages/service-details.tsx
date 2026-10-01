import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { PublicPage } from '@/components/public/PublicPage'
import { fetchPageBundle } from '@/lib/admin-pages'
import { resolveAdminBaseUrl } from '@uadmin/shared/page/adminUrls'
import { buildPublicPageView, type PublicPageView } from '@uadmin/shared/page/viewHelpers'

export type ServiceDetailItem = {
  id: number | string
  title: string
  slug?: string
  description?: string
  icon?: string
  image?: string
  url?: string
}

type PageProps = {
  pageView: PublicPageView
  currentService: ServiceDetailItem
  servicesList: ServiceDetailItem[]
}

function toSerializablePageView(pageView: PublicPageView): PublicPageView {
  return JSON.parse(JSON.stringify(pageView)) as PublicPageView
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { query } = context
  const requestedSlug = String(query.slug || query.title || '').trim().toLowerCase()
  const requestedId = query.id ? String(query.id) : null

  // 1. Fetch site bundle for header, footer & styles
  let bundle = await fetchPageBundle('services').catch(() => null)
  if (!bundle) {
    bundle = await fetchPageBundle('home').catch(() => null)
  }

  if (!bundle) {
    return { notFound: true }
  }

  // 2. Fetch services list from CMS collection API
  let servicesList: ServiceDetailItem[] = []
  try {
    const adminUrl = resolveAdminBaseUrl()
    if (adminUrl) {
      const res = await fetch(`${adminUrl}/api/services`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.success && Array.isArray(data.services)) {
        servicesList = data.services
      }
    }
  } catch {
    servicesList = []
  }

  // 3. Fallback default service items if collection is empty
  const defaultServices: ServiceDetailItem[] = [
    {
      id: 'web-dev',
      title: 'Web & Cloud Solutions',
      slug: 'web-development',
      description: 'End-to-end custom web application engineering with React, Next.js, and high-performance server architectures designed for conversion and speed.',
      image: '/uploads/e2657d9d-984b-4a05-9b33-e1ae48697420.jpg',
      icon: 'globe',
    },
    {
      id: 'ui-ux',
      title: 'Modern UI/UX Design',
      slug: 'ui-ux-design',
      description: 'Human-centric digital product interfaces, design systems, and responsive user experiences crafted to elevate brand identity and user retention.',
      image: '/uploads/4bc9c087-4de7-4b69-8221-412e941c5528.jpg',
      icon: 'palette',
    },
    {
      id: 'growth-seo',
      title: 'Growth & SEO Performance',
      slug: 'seo-growth',
      description: 'Comprehensive technical SEO auditing, Core Web Vitals optimization, and organic conversion funnels to scale organic search acquisition.',
      image: '/uploads/12ce0f6e-2da2-4ded-80ec-c8b276df87a2.jpg',
      icon: 'trending-up',
    },
  ]

  const pool = servicesList.length ? servicesList : defaultServices

  // 4. Match requested service or use query overrides or first item
  let matched = pool.find((s) => {
    if (requestedId && String(s.id) === requestedId) return true
    if (requestedSlug) {
      const sSlug = String(s.slug || s.title || '').toLowerCase()
      return sSlug === requestedSlug || sSlug.includes(requestedSlug) || requestedSlug.includes(sSlug)
    }
    return false
  })

  // If query explicitly provided title or description via URL params (from Card Link)
  const currentService: ServiceDetailItem = {
    id: matched?.id || 'custom-service',
    title: query.title ? String(query.title) : (matched?.title || 'Service Details'),
    description: query.desc ? String(query.desc) : (matched?.description || 'Comprehensive solutions tailored to elevate your business performance, scalable architectures, and seamless digital transformation.'),
    image: query.img ? String(query.img) : (matched?.image || ''),
    url: matched?.url || '/contact',
  }

  return {
    props: {
      pageView: toSerializablePageView(buildPublicPageView(bundle)),
      currentService,
      servicesList: pool,
    },
  }
}

export default function ServiceDetailsPage({
  pageView,
  currentService,
  servicesList,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>{`${currentService.title} | CurveMetrics Services`}</title>
        <meta name="description" content={currentService.description || `Explore detailed specifications and capabilities for ${currentService.title}.`} />
        <meta property="og:title" content={`${currentService.title} | CurveMetrics Services`} />
        <meta property="og:description" content={currentService.description || ''} />
      </Head>

      <PublicPage pageView={pageView}>
        <div style={{ backgroundColor: '#090b10', color: '#f1f3f9', minHeight: '80vh', padding: '60px 0 100px' }}>
          <div className="container">
            {/* Breadcrumbs */}
            <nav className="mb-4" aria-label="breadcrumb">
              <ol className="breadcrumb mb-0" style={{ fontSize: '14px' }}>
                <li className="breadcrumb-item">
                  <Link href="/" style={{ color: '#8b949e', textDecoration: 'none' }}>Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/services" style={{ color: '#8b949e', textDecoration: 'none' }}>Services</Link>
                </li>
                <li className="breadcrumb-item active" style={{ color: '#58a6ff' }} aria-current="page">
                  {currentService.title}
                </li>
              </ol>
            </nav>

            {/* Header Hero Section */}
            <div className="mb-5 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge rounded-pill" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '6px 14px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>
                  SERVICE OVERVIEW
                </span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>• Full Delivery Architecture</span>
              </div>
              <h1 className="fw-bold display-5 mb-3" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                {currentService.title}
              </h1>
              <p className="lead mb-4" style={{ color: '#94a3b8', maxWidth: '850px', fontSize: '19px', lineHeight: '1.6' }}>
                {currentService.description}
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold" style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                  Get Started With This Service →
                </Link>
                <Link href="/services" className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" style={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)' }}>
                  ← View All Services
                </Link>
              </div>
            </div>

            {/* Main Content & Sidebar Grid */}
            <div className="row g-5">
              {/* Left Column: Deep Dive */}
              <div className="col-lg-8">
                {currentService.image && (
                  <div className="mb-5 rounded-4 overflow-hidden shadow-lg border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentService.image}
                      alt={currentService.title}
                      className="img-fluid w-100"
                      style={{ maxHeight: '420px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Key Deliverables Cards */}
                <h3 className="h4 fw-bold mb-4" style={{ color: '#f8fafc' }}>What We Deliver</h3>
                <div className="row g-3 mb-5">
                  {[
                    { title: 'High Performance & Speed', desc: 'Ultra-fast loading architecture optimized for modern web standards and search ranking.' },
                    { title: 'Tailored Solution Architecture', desc: 'Custom engineered workflows that match your exact business operational requirements.' },
                    { title: 'Enterprise Security & Stability', desc: 'Rigorous data validation, API safeguards, and fault-tolerant architecture.' },
                    { title: 'Continuous Support & Iteration', desc: 'Dedicated maintenance, analytics tracking, and scalable performance monitoring.' },
                  ].map((feat, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-4 rounded-4 h-100 border" style={{ backgroundColor: '#131622', borderColor: 'rgba(255,255,255,0.07)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="text-primary fw-bold">0{idx + 1}.</span>
                          <h5 className="mb-0 fw-semibold" style={{ color: '#e2e8f0', fontSize: '16px' }}>{feat.title}</h5>
                        </div>
                        <p className="mb-0" style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Process Timeline */}
                <h3 className="h4 fw-bold mb-4" style={{ color: '#f8fafc' }}>Implementation Process</h3>
                <div className="p-4 rounded-4 border mb-5" style={{ backgroundColor: '#131622', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="row g-4">
                    {[
                      { step: 'Step 1', title: 'Discovery & Audit', desc: 'We assess requirements, technical roadblocks, and design metrics.' },
                      { step: 'Step 2', title: 'Design & Prototype', desc: 'Interactive visual layouts and architectural blueprints are crafted.' },
                      { step: 'Step 3', title: 'Build & Integration', desc: 'Agile development with continuous preview milestones.' },
                      { step: 'Step 4', title: 'Launch & Handoff', desc: 'Full production deployment, performance verification, and training.' },
                    ].map((step, sIdx) => (
                      <div key={sIdx} className="col-md-6 col-lg-3 text-center text-md-start">
                        <span className="badge mb-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>{step.step}</span>
                        <h6 className="fw-semibold mb-1" style={{ color: '#f1f5f9' }}>{step.title}</h6>
                        <p className="mb-0" style={{ color: '#94a3b8', fontSize: '13px' }}>{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Sidebar */}
              <div className="col-lg-4">
                <div className="sticky-top" style={{ top: '30px' }}>
                  {/* Quick Consultation CTA */}
                  <div className="p-4 rounded-4 border mb-4 shadow-sm" style={{ backgroundColor: '#131622', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h4 className="fw-bold mb-2" style={{ color: '#ffffff', fontSize: '18px' }}>Launch This Service</h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                      Ready to build or scale? Speak directly with our team to get a structured roadmap and quote.
                    </p>
                    <Link href="/contact" className="btn btn-primary w-100 py-2 rounded-pill fw-semibold mb-3" style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}>
                      Inquire Now
                    </Link>
                    <div className="pt-3 border-top d-flex justify-content-between" style={{ borderColor: 'rgba(255,255,255,0.08)', fontSize: '13px', color: '#94a3b8' }}>
                      <span>Typical Turnaround:</span>
                      <strong style={{ color: '#f1f5f9' }}>2 - 4 Weeks</strong>
                    </div>
                  </div>

                  {/* Other Services Navigation */}
                  {servicesList.length > 0 && (
                    <div className="p-4 rounded-4 border" style={{ backgroundColor: '#131622', borderColor: 'rgba(255,255,255,0.08)' }}>
                      <h5 className="fw-semibold mb-3" style={{ color: '#ffffff', fontSize: '16px' }}>Other Services</h5>
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        {servicesList.map((s) => (
                          <li key={s.id}>
                            <Link
                              href={`/service-details?title=${encodeURIComponent(s.title)}&slug=${encodeURIComponent(s.slug || s.title)}`}
                              className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 text-decoration-none"
                              style={{
                                backgroundColor: s.title === currentService.title ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                                color: s.title === currentService.title ? '#60a5fa' : '#cbd5e1',
                                border: s.title === currentService.title ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                fontSize: '14px',
                              }}
                            >
                              <span>{s.title}</span>
                              <span style={{ fontSize: '12px' }}>→</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PublicPage>
    </>
  )
}
