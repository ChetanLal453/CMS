'use client'

import { useMemo } from 'react'
import { Badge, Card, CardBody, Col, Row } from 'react-bootstrap'

import { FilterClearButton, FilterPanel } from '@/components/filters'
import FilterComponent, { FilterProvider, useFilterState } from '@/components/PageEditor/components/Filter'

type CatalogItem = {
  id: string
  name: string
  industry: string
  style: string
  format: string
  tags: string[]
  premium: boolean
  price: number
  updatedAt: string
  description: string
}

const catalogItems: CatalogItem[] = [
  {
    id: 'item-1',
    name: 'Aurora Dashboard Kit',
    industry: 'saas',
    style: 'dark',
    format: 'dashboard',
    tags: ['featured', 'premium'],
    premium: true,
    price: 96,
    updatedAt: '2026-03-26T12:30:00Z',
    description: 'A polished dashboard system for analytics teams and product ops.',
  },
  {
    id: 'item-2',
    name: 'Northstar Agency Landing',
    industry: 'agency',
    style: 'minimal',
    format: 'landing',
    tags: ['verified'],
    premium: false,
    price: 42,
    updatedAt: '2026-03-30T08:10:00Z',
    description: 'A clean, conversion-focused landing page for service businesses.',
  },
  {
    id: 'item-3',
    name: 'Commerce Pulse',
    industry: 'ecommerce',
    style: 'bold',
    format: 'mobile',
    tags: ['featured', 'hot'],
    premium: true,
    price: 74,
    updatedAt: '2026-03-18T09:00:00Z',
    description: 'Mobile commerce layouts with strong calls to action and product focus.',
  },
  {
    id: 'item-4',
    name: 'FinFlow Pro',
    industry: 'fintech',
    style: 'dark',
    format: 'dashboard',
    tags: ['premium'],
    premium: true,
    price: 88,
    updatedAt: '2026-03-21T14:45:00Z',
    description: 'A finance-oriented interface with reporting, charts, and clean hierarchy.',
  },
  {
    id: 'item-5',
    name: 'Growth Studio',
    industry: 'marketing',
    style: 'minimal',
    format: 'landing',
    tags: ['verified', 'recommended'],
    premium: false,
    price: 38,
    updatedAt: '2026-03-14T18:00:00Z',
    description: 'A lightweight growth page for campaigns and product launches.',
  },
  {
    id: 'item-6',
    name: 'Ops Center',
    industry: 'saas',
    style: 'bold',
    format: 'dashboard',
    tags: ['hot'],
    premium: false,
    price: 56,
    updatedAt: '2026-03-28T16:20:00Z',
    description: 'An operations dashboard with high-contrast controls and quick summaries.',
  },
]

const styleOptions = [
  { value: 'dark', label: 'Dark' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
]

const formatOptions = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'landing', label: 'Landing' },
  { value: 'mobile', label: 'Mobile' },
]

const tagOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'premium', label: 'Premium' },
  { value: 'verified', label: 'Verified' },
  { value: 'hot', label: 'Hot' },
  { value: 'recommended', label: 'Recommended' },
]

const sortOptions = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price low to high' },
  { value: 'price-desc', label: 'Price high to low' },
]

const getActiveList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}

const getRange = (value: unknown): [number, number] => {
  if (!Array.isArray(value) || value.length < 2) return [0, 100]
  return [Number(value[0]) || 0, Number(value[1]) || 0]
}

const FiltersShowcaseContent = () => {
  const filterContext = useFilterState()

  if (!filterContext) return null

  const { state, clearAll } = filterContext

  const filteredItems = useMemo(() => {
    const search = String(state.search || '').toLowerCase().trim()
    const industries = getActiveList(state.industry)
    const styles = getActiveList(state.style)
    const formats = String(state.format || '')
    const selectedTags = getActiveList(state.tags)
    const premiumOnly = Boolean(state.premiumOnly)
    const [minPrice, maxPrice] = getRange(state.priceRange)
    const sortBy = String(state.sortBy || 'popular')

    const nextItems = catalogItems.filter((item) => {
      const matchesSearch =
        !search ||
        [item.name, item.description, item.industry, item.style, item.format, ...item.tags].some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(search),
        )
      const matchesIndustry = !industries.length || industries.includes(item.industry)
      const matchesStyle = !styles.length || styles.includes(item.style)
      const matchesFormat = !formats || item.format === formats
      const matchesPremium = !premiumOnly || item.premium
      const matchesTags = !selectedTags.length || selectedTags.some((tag) => item.tags.includes(tag))
      const matchesPrice = item.price >= minPrice && item.price <= maxPrice

      return matchesSearch && matchesIndustry && matchesStyle && matchesFormat && matchesPremium && matchesTags && matchesPrice
    })

    return nextItems.sort((left, right) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()
        case 'price-asc':
          return left.price - right.price
        case 'price-desc':
          return right.price - left.price
        case 'newest':
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        default:
          return right.tags.length - left.tags.length
      }
    })
  }, [state])

  const stateSnapshot = useMemo(() => JSON.stringify(state, null, 2), [state])

  return (
    <Row className="g-3">
      <Col xxl={8}>
        <FilterPanel
          title="Universal filter consumer"
          description="These filters write into one shared state object and drive a real results list below."
          actions={<FilterClearButton onClick={clearAll} />}
          bodyClassName="gap-4">
          <div
            className="d-grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}>
            <FilterComponent
              filterType="searchInput"
              filterKey="search"
              label="Search"
              placeholder="Search catalog items..."
              clearable
              showClearButton={false}
              autoApply
            />
            <FilterComponent
              filterType="multiselect"
              filterKey="industry"
              label="Industry"
              sourceType="preset"
              presetKey="industry"
              searchable
              clearable
              showSelectedCount
              showClearButton={false}
            />
            <FilterComponent
              filterType="checkboxGroup"
              filterKey="style"
              label="Style"
              options={styleOptions}
              columns={3}
              showClearButton={false}
            />
            <FilterComponent
              filterType="radioGroup"
              filterKey="format"
              label="Format"
              options={formatOptions}
              inline
              showClearButton={false}
            />
            <FilterComponent
              filterType="toggle"
              filterKey="premiumOnly"
              label="Premium only"
              onLabel="Premium"
              offLabel="All items"
              showStateLabel
              showClearButton={false}
            />
            <FilterComponent
              filterType="sortDropdown"
              filterKey="sortBy"
              label="Sort by"
              options={sortOptions}
              defaultSort="popular"
              showClearButton={false}
            />
            <FilterComponent
              filterType="tagChips"
              filterKey="tags"
              label="Tags"
              options={tagOptions}
              showClearButton={false}
            />
            <FilterComponent
              filterType="rangeSlider"
              filterKey="priceRange"
              label="Price range"
              min={0}
              max={100}
              step={5}
              defaultValue={[0, 100]}
              prefix="$"
              suffix="k"
              showClearButton={false}
            />
          </div>
        </FilterPanel>

        <Card className="bg-transparent border border-white border-opacity-10 shadow-sm mt-3">
          <CardBody className="d-flex flex-column gap-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h4 className="card-title mb-1">Filtered results</h4>
                <div className="text-muted small">{filteredItems.length} items match the current filter state.</div>
              </div>
              <Badge bg="secondary" className="rounded-pill">
                {filteredItems.length} visible
              </Badge>
            </div>

            <div
              className="d-grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}>
              {filteredItems.map((item) => (
                <Card key={item.id} className="bg-transparent border border-white border-opacity-10">
                  <CardBody className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <h5 className="mb-1">{item.name}</h5>
                        <div className="text-muted small">{item.description}</div>
                      </div>
                      {item.premium ? <Badge bg="warning" text="dark" className="rounded-pill">Premium</Badge> : null}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="info" className="rounded-pill">
                        {item.industry}
                      </Badge>
                      <Badge bg="secondary" className="rounded-pill">
                        {item.style}
                      </Badge>
                      <Badge bg="dark" className="rounded-pill">
                        {item.format}
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} bg="light" text="dark" className="rounded-pill">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center small text-muted">
                      <span>${item.price}k</span>
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {!filteredItems.length ? <div className="text-center text-muted py-4">No items match the current filter setup.</div> : null}
          </CardBody>
        </Card>
      </Col>

      <Col xxl={4}>
        <Card className="bg-transparent border border-white border-opacity-10 shadow-sm h-100">
          <CardBody className="d-flex flex-column gap-3">
            <div>
              <h4 className="card-title mb-1">Normalized state</h4>
              <p className="text-muted small mb-0">This is the exact page-level filter object that drives the results above.</p>
            </div>
            <pre className="mb-0 small text-light" style={{ whiteSpace: 'pre-wrap' }}>
              {stateSnapshot}
            </pre>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

const FiltersShowcase = () => {
  return (
    <FilterProvider initialState={{}}>
      <FiltersShowcaseContent />
    </FilterProvider>
  )
}

export default FiltersShowcase
