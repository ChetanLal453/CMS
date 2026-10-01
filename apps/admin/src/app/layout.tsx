import type { Metadata } from 'next'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'
import 'nouislider/distribute/nouislider.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/free-mode'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-flip'
import 'swiper/css/effect-cards'

import '@/assets/scss/app.scss'
import './globals.css'
import './page-editor-exact.css'
import NextTopLoader from 'nextjs-toploader'
import AppProvidersWrapper from '@/components/wrappers/AppProvidersWrapper'

export const metadata: Metadata = {
  title: {
    template: '%s |Techmin - Bootstrap 5 Admin & Dashboard Template',
    default: DEFAULT_PAGE_TITLE,
  },
  description: 'A fully responsive admin theme which can be used to build CRM, CMS,ERP etc.',
}

const splashScreenStyles = `
body {
  font-family: "DM Sans", system-ui, sans-serif;
}
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style suppressHydrationWarning>{splashScreenStyles}</style>
        
        {/* ✅ ADD FONTAWESOME CDN HERE - RIGHT AFTER THE STYLE TAG */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {/* END OF FONTAWESOME CDN */}
      </head>
      <body suppressHydrationWarning>
        <NextTopLoader color="#1e84c4" showSpinner={false} />
        <div id="__next_splash">
          <AppProvidersWrapper>{children}</AppProvidersWrapper>
        </div>
      </body>
    </html>
  )
}
