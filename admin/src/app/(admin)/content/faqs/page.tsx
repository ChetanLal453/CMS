'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const FAQsPage = () => (
  <CollectionManagerPage
    title="FAQs"
    subtitle="Maintain frequently asked questions, answers, categories, and display order."
    endpoint="/api/faqs"
    listKey="faqs"
    itemLabel="FAQ"
    emptyItem={() => ({
      question: '',
      answer: '',
      category: '',
      order_index: 0,
      is_active: true,
    })}
    fields={[
      { key: 'question', label: 'Question', type: 'textarea' },
      { key: 'answer', label: 'Answer', type: 'textarea' },
      { key: 'category', label: 'Category' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]}
    titleField="question"
    descriptionField="answer"
    reorderable
  />
)

export default FAQsPage
