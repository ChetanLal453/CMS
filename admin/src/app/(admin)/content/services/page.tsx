'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const ServicesPage = () => (
  <CollectionManagerPage
    title="Services"
    subtitle="List, edit, delete, and reorder service items used across the site."
    endpoint="/api/services"
    listKey="services"
    itemLabel="Service"
    emptyItem={() => ({
      title: '',
      description: '',
      icon: '',
      image: '',
      url: '',
      order_index: 0,
      is_active: true,
    })}
    fields={[
      { key: 'title', label: 'Title' },
      { key: 'icon', label: 'Icon' },
      { key: 'url', label: 'URL', type: 'url', placeholder: 'https://example.com/service' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]}
    titleField="title"
    descriptionField="description"
    reorderable
  />
)

export default ServicesPage
