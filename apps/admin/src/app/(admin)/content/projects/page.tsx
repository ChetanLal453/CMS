'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const ProjectsPage = () => (
  <CollectionManagerPage
    title="Projects"
    subtitle="Manage portfolio projects, images, client names, and publish status."
    endpoint="/api/projects"
    listKey="projects"
    itemLabel="Project"
    emptyItem={() => ({
      title: '',
      description: '',
      image: '',
      category: '',
      client: '',
      url: '',
      order_index: 0,
      is_active: true,
    })}
    fields={[
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'client', label: 'Client' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]}
    titleField="title"
    descriptionField="category"
    reorderable
  />
)

export default ProjectsPage
