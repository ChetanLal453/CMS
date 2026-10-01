'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const TestimonialsPage = () => (
  <CollectionManagerPage
    title="Testimonials"
    subtitle="Manage customer quotes, author names, and display order."
    endpoint="/api/testimonials"
    listKey="testimonials"
    itemLabel="Testimonial"
    emptyItem={() => ({
      text: '',
      author: '',
    })}
    fields={[
      { key: 'text', label: 'Testimonial Text', type: 'textarea' },
      { key: 'author', label: 'Author' },
    ]}
    titleField="author"
    descriptionField="text"
  />
)

export default TestimonialsPage
