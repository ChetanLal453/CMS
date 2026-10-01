'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const StatsPage = () => (
  <CollectionManagerPage
    title="Stats"
    subtitle="Manage statistic counters displayed across the site."
    endpoint="/api/stats"
    listKey="stats"
    itemLabel="Stat"
    emptyItem={() => ({
      label: '',
      value: '',
      icon: '',
      order_index: 0,
    })}
    fields={[
      { key: 'label', label: 'Label' },
      { key: 'value', label: 'Value' },
      { key: 'icon', label: 'Icon' },
      { key: 'order_index', label: 'Order' },
    ]}
    titleField="label"
    descriptionField="value"
    reorderable
  />
)

export default StatsPage
