import Head from 'next/head'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { PublicPage } from '@/components/public/PublicPage'
import { fetchPageBundleForPath } from '@/lib/admin-pages'
import { resolveAdminMediaUrl } from '@uadmin/shared/page/adminUrls'
import type { SeoContract } from '@uadmin/shared/page/seo'
import { buildPublicPageView, type PublicPageView } from '@uadmin/shared/page/viewHelpers'

type PageProps = {
  pageView: PublicPageView
  seo: {
    title: string
    description: string
    image: string
    canonicalUrl: string
    robots: string
    keywords: string[]
  }
}

function toSerializablePageView(pageView: PublicPageView): PublicPageView {
  return JSON.parse(JSON.stringify(pageView)) as PublicPageView
}

function toSerializableSeo(seo: SeoContract): PageProps['seo'] {
  return {
    title: seo.title,
    description: seo.description,
    image: seo.image ? resolveAdminMediaUrl(seo.image) : '',
    canonicalUrl: seo.canonicalUrl,
    robots: seo.robots,
    keywords: seo.keywords,
  }
}

function getRequestedPath(slug?: string[] | string) {
  if (!slug) {
    return ''
  }

  if (Array.isArray(slug)) {
    return slug.filter(Boolean).join('/')
  }

  return String(slug || '').trim()
}

function isNonPageRequestPath(requestedPath: string) {
  const normalizedPath = String(requestedPath || '').trim().replace(/^\/+/, '').toLowerCase()

  if (!normalizedPath) {
    return false
  }

  if (normalizedPath.startsWith('_next') || normalizedPath.startsWith('api') || normalizedPath.startsWith('uploads')) {
    return true
  }

  const lastSegment = normalizedPath.split('/').pop() || ''
  return /\.[a-z0-9]+$/i.test(lastSegment)
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const requestedPath = getRequestedPath(context.params?.slug)

  if (isNonPageRequestPath(requestedPath)) {
    return { notFound: true }
  }

  const rawHost =
    (context.req.headers['x-forwarded-host'] as string) ||
    (context.req.headers.host as string) ||
    ''

  try {
    const bundle = await fetchPageBundleForPath(
      requestedPath ? requestedPath.split('/').filter(Boolean) : [],
      { host: rawHost },
    )

    if (!bundle?.page?.slug) {
      return { notFound: true }
    }

    const page = bundle.page

    return {
      props: {
        pageView: toSerializablePageView(buildPublicPageView(bundle)),
        seo: toSerializableSeo(page.seo),
      },
    }
  } catch (error) {
    console.error('Failed to load page bundle:', error)
    return { notFound: true }
  }
}

export default function CatchAllPage({
  pageView,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        {seo.title ? <title>{seo.title}</title> : null}
        {seo.description ? <meta name="description" content={seo.description} /> : null}
        {seo.robots ? <meta name="robots" content={seo.robots} /> : null}
        {seo.keywords.length ? <meta name="keywords" content={seo.keywords.join(', ')} /> : null}
        {seo.canonicalUrl ? <link rel="canonical" href={seo.canonicalUrl} /> : null}
        <meta property="og:type" content="website" />
        {seo.title ? <meta property="og:title" content={seo.title} /> : null}
        {seo.description ? <meta property="og:description" content={seo.description} /> : null}
        {seo.image ? <meta property="og:image" content={seo.image} /> : null}
        <meta name="twitter:card" content={seo.image ? 'summary_large_image' : 'summary'} />
        {seo.title ? <meta name="twitter:title" content={seo.title} /> : null}
        {seo.description ? <meta name="twitter:description" content={seo.description} /> : null}
        {seo.image ? <meta name="twitter:image" content={seo.image} /> : null}
      </Head>
      <PublicPage pageView={pageView} />
    </>
  )
}
