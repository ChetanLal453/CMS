import type { ComponentType } from 'react'
import {
  assertWebsiteRenderersRegistered,
  blockDefinitions,
  getWebsiteRenderer,
  registerWebsiteRenderers,
  resolveBlockType,
  type BlockTypeKey,
} from '../../../shared/blocks/registry'
import PublicAccordion from './ui/Accordion'
import PublicAdvancedCard from './ui/AdvancedCardComponent'
import PublicAdvancedHeading from './ui/AdvancedHeadingComponent'
import PublicAdvancedList from './ui/AdvancedList'
import PublicAdvancedParagraph from './ui/AdvancedParagraphComponent'
import PublicButton from './ui/button'
import PublicContainer from './ui/container'
import PublicDivider from './ui/divider'
import PublicFilter from './ui/filter'
import PublicFlexbox from './ui/flexbox'
import PublicIcon from './ui/icon'
import PublicImage from './ui/image'
import PublicNewGrid from './ui/NewGridComponent'
import PublicQuote from './ui/quote'
import PublicSpacer from './ui/spacer'
import PublicSwiperContainer from './ui/SwiperContainer'
import PublicTabs from './ui/tabs'
import PublicVideo from './ui/video'

registerWebsiteRenderers({
  spacer: PublicSpacer,
  container: PublicContainer,
  flexbox: PublicFlexbox,
  button: PublicButton,
  image: PublicImage,
  advancedheading: PublicAdvancedHeading,
  advancedparagraph: PublicAdvancedParagraph,
  advancedcard: PublicAdvancedCard,
  advancedlist: PublicAdvancedList,
  advancedaccordion: PublicAccordion,
  swipercontainer: PublicSwiperContainer,
  newgrid: PublicNewGrid,
  quote: PublicQuote,
  filter: PublicFilter,
  video: PublicVideo,
  icon: PublicIcon,
  divider: PublicDivider,
  tabs: PublicTabs,
})

assertWebsiteRenderersRegistered()

export type ComponentTypeKey = BlockTypeKey

export function resolveComponentTypeKey(type?: string | null): ComponentTypeKey | undefined {
  return resolveBlockType(type)
}

export function getComponentRenderer(type?: string | null): ComponentType<Record<string, unknown>> {
  return getWebsiteRenderer(type)
}

export const componentRegistry = Object.fromEntries(
  blockDefinitions.map((definition) => [definition.key, getWebsiteRenderer(definition.key)]),
) as Record<ComponentTypeKey, ComponentType<Record<string, unknown>>>

export default componentRegistry
