'use client'

import CollectionManagerPage from '@/components/admin/CollectionManagerPage'

const TeamPage = () => (
  <CollectionManagerPage
    title="Team"
    subtitle="Manage team members, bios, profile photos, and LinkedIn links."
    endpoint="/api/team"
    listKey="team"
    itemLabel="Member"
    emptyItem={() => ({
      name: '',
      role: '',
      bio: '',
      image: '',
      email: '',
      linkedin_url: '',
      order_index: 0,
      is_active: true,
    })}
    fields={[
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]}
    titleField="name"
    descriptionField="role"
  />
)

export default TeamPage
