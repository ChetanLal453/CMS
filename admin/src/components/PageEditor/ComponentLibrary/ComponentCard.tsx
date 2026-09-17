'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ComponentDefinition } from '@/types/page-editor'

interface ComponentCardProps {
  component: ComponentDefinition
  index: number
  onClick?: () => void
  displayName?: string
  glyphKey?: string
}

const iconMap: Record<string, React.ReactNode> = {
  section: <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />,
  spacer: <rect x="3" y="8" width="18" height="8" rx="1" />,
  container: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </>
  ),
  flex: (
    <>
      <rect x="3" y="3" width="8" height="18" rx="1" />
      <rect x="13" y="3" width="8" height="18" rx="1" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  form: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  heading: (
    <>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </>
  ),
  paragraph: (
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="15" y2="18" />
    </>
  ),
  list: (
    <>
      <circle cx="5" cy="6" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="5" cy="18" r="1.2" />
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
    </>
  ),
  media: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polygon points="10 9 15 12 10 15 10 9" />
    </>
  ),
  button: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
    </>
  ),
  filter: (
    <>
      <path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" />
    </>
  ),
  accordion: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  carousel: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="7" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="17" y2="12" />
    </>
  ),
  chart: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
}

const getGlyph = (component: ComponentDefinition, glyphKey?: string) => {
  const value = [glyphKey, component.id, component.type, component.name, component.category, component.icon].join(' ').toLowerCase()

  if (value.includes('spacer')) return iconMap.spacer
  if (value.includes('container')) return iconMap.container
  if (value.includes('flex')) return iconMap.flex
  if (value.includes('grid')) return iconMap.grid
  if (value.includes('divider')) return iconMap.section
  if (value.includes('form')) return iconMap.form
  if (value.includes('heading')) return iconMap.heading
  if (value.includes('list')) return iconMap.list
  if (value.includes('paragraph') || value.includes('quote') || value.includes('richtext')) return iconMap.paragraph
  if (value.includes('image') || value.includes('icon')) return iconMap.media
  if (value.includes('video')) return iconMap.video
  if (value.includes('button')) return iconMap.button
  if (value.includes('filter')) return iconMap.filter
  if (value.includes('accordion')) return iconMap.accordion
  if (value.includes('carousel') || value.includes('swiper') || value.includes('slider')) return iconMap.carousel
  if (value.includes('chart')) return iconMap.chart
  if (value.includes('section')) return iconMap.container

  return iconMap.section
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component, onClick, displayName, glyphKey }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component:${component.id}`,
    data: {
      type: 'component',
      component,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      draggable="true"
      className={`comp-item cc ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="comp-icon cc-i">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          {getGlyph(component, glyphKey)}
        </svg>
      </div>
      <div className="comp-name cc-n">{displayName || component.name}</div>
    </div>
  )
}
