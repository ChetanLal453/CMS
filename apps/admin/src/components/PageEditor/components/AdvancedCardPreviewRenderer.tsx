'use client'

import React from 'react'
import * as FaIcons from 'react-icons/fa'
import { normalizeAdvancedCard } from '@uadmin/shared/blocks/advancedcard/normalize'
import type { AdvancedCardInput } from '@uadmin/shared/blocks/advancedcard/types'
import { resolveAdminMediaUrl } from '@uadmin/shared/page/adminUrls'
import {
  createAdvancedCardView,
  type AdvancedCardComponentProps,
} from './advancedCard-preview/cardModel'
import AdvancedCardRenderer from '@uadmin/shared/blocks/advancedcard/renderer/AdvancedCardRenderer'

function AdminAdvancedCardPreview({
  card,
  view,
}: {
  card: ReturnType<typeof normalizeAdvancedCard>
  view: ReturnType<typeof createAdvancedCardView>
}) {
  const [isEditor, setIsEditor] = React.useState(false)

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsEditor(Boolean(document.querySelector('.cm-page-editor')))
    }
  }, [])
  const baseCardNode = <AdvancedCardRenderer card={card} view={view} iconSet={FaIcons} />

  return baseCardNode
}

const AdvancedCardPreviewRenderer: React.FC<AdvancedCardComponentProps> = (props) => {
  const card = React.useMemo(() => normalizeAdvancedCard(props as AdvancedCardInput), [props])
  const imageSrc = card.content?.image?.src || ''
  const resolvedImage = React.useMemo(() => resolveAdminMediaUrl(imageSrc), [imageSrc])
  const view = React.useMemo(() => createAdvancedCardView(card, props, resolvedImage), [card, props, resolvedImage])

  return <AdminAdvancedCardPreview card={card} view={view} />
}

export default AdvancedCardPreviewRenderer
