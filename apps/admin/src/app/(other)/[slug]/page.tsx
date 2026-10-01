import { notFound } from 'next/navigation'
import { PublicPage } from '@/components/public/PublicPage'
import { getPublicPageBundle } from '@/lib/public-pages.js'

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const bundle = await getPublicPageBundle(params.slug)

  if (!bundle) {
    notFound()
  }

  return <PublicPage bundle={bundle} />
}

export async function generateStaticParams() {
  return []
}
