import { notFound } from 'next/navigation'
import { PublicPage } from '@/components/public/PublicPage'
import { getPublicPageBundle } from '@/lib/public-pages.js'

export default async function HomePage() {
  const bundle = await getPublicPageBundle('home')

  if (!bundle) {
    notFound()
  }

  return <PublicPage bundle={bundle} />
}
