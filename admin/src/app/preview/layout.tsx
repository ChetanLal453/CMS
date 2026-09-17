'use client'

import { useEffect, type ReactNode } from 'react'

export default function PreviewLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const splash = document.getElementById('__next_splash')

    const previous = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyBackground: body.style.background,
      bodyColor: body.style.color,
      splashHeight: splash?.style.height ?? '',
      splashOverflow: splash?.style.overflow ?? '',
    }

    html.style.overflow = 'auto'
    html.style.height = 'auto'
    body.style.overflow = 'auto'
    body.style.height = 'auto'
    body.style.background = 'radial-gradient(circle at top, #18324a 0%, #0d1522 42%, #070d16 100%)'
    body.style.color = '#e5eefc'

    if (splash) {
      splash.style.height = 'auto'
      splash.style.overflow = 'visible'
    }

    return () => {
      html.style.overflow = previous.htmlOverflow
      html.style.height = previous.htmlHeight
      body.style.overflow = previous.bodyOverflow
      body.style.height = previous.bodyHeight
      body.style.background = previous.bodyBackground
      body.style.color = previous.bodyColor

      if (splash) {
        splash.style.height = previous.splashHeight
        splash.style.overflow = previous.splashOverflow
      }
    }
  }, [])

  return (
    <>
      <style>{`
        html, body, #__next_splash {
          height: auto !important;
          overflow: auto !important;
        }

        body {
          margin: 0;
        }

        .admin-preview-shell {
          min-height: 100vh;
          padding: 32px 20px 56px;
          background:
            radial-gradient(circle at top, rgba(76, 139, 245, 0.16), transparent 30%),
            linear-gradient(180deg, rgba(9, 17, 30, 0.92) 0%, rgba(5, 10, 18, 0.98) 100%);
        }

        .admin-preview-stage {
          width: min(100%, 1520px);
          margin: 0 auto;
        }

        .admin-preview-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px 20px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 22px;
          background: rgba(8, 15, 27, 0.78);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(16px);
        }

        .admin-preview-toolbar__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          color: #8ab4ff;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .admin-preview-toolbar__title {
          margin: 0;
          color: #f8fbff;
          font-size: clamp(1.1rem, 1rem + 0.4vw, 1.4rem);
          font-weight: 700;
        }

        .admin-preview-toolbar__meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }

        .admin-preview-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 999px;
          color: #d7e6ff;
          background: rgba(148, 163, 184, 0.08);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .admin-preview-chip--live {
          color: #b8ffd9;
          background: rgba(24, 180, 104, 0.14);
          border-color: rgba(24, 180, 104, 0.28);
        }

        .admin-preview-canvas {
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 30px;
          background: #ffffff;
          box-shadow:
            0 28px 90px rgba(0, 0, 0, 0.32),
            0 0 0 1px rgba(255, 255, 255, 0.04) inset;
        }

        @media (max-width: 768px) {
          .admin-preview-shell {
            padding: 20px 12px 32px;
          }

          .admin-preview-toolbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-preview-toolbar__meta {
            justify-content: flex-start;
          }

          .admin-preview-canvas {
            border-radius: 22px;
          }
        }
      `}</style>
      <div
        style={{
          minHeight: '100vh',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </>
  )
}
