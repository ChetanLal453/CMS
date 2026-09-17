import type { Metadata } from 'next'

import PageTitle from '@/components/PageTitle'
import FiltersShowcase from './components/FiltersShowcase'

export const metadata: Metadata = { title: 'Filters' }

const FiltersPage = () => {
  return (
    <>
      <PageTitle title="Filters" />
      <FiltersShowcase />
    </>
  )
}

export default FiltersPage
