'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const GalleryPage = () => (
  <CollectionManagerPage
    title="Gallery"
    subtitle="Manage gallery items, images, captions, and categories."
    endpoint="/api/gallery"
    listKey="gallery"
    itemLabel="Image"
    emptyItem={() => ({
      title: '',
      image: '',
      alt_text: '',
      category: '',
      order_index: 0,
    })}
    fields={[
      { key: 'title', label: 'Title' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'alt_text', label: 'Alt Text' },
      { key: 'category', label: 'Category' },
      { key: 'order_index', label: 'Order' },
    ]}
    titleField="title"
    descriptionField="category"
    reorderable
  />
)

export default GalleryPage
