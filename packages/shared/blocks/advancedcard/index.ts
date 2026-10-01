import { advancedCardDefaultProps } from './defaults'
import { normalizeAdvancedCard } from './normalize'
import { advancedCardSchema } from './schema'
import { createAdvancedCardBlockViewModel } from './viewModel'

export type * from './types'
export { advancedCardDefaultProps } from './defaults'
export { advancedCardSchema } from './schema'
export { normalizeAdvancedCard } from './normalize'
export { createAdvancedCardBlockViewModel, createAdvancedCardView } from './viewModel'

export const advancedCardContract = {
  defaultProps: advancedCardDefaultProps,
  schema: advancedCardSchema,
  normalize: normalizeAdvancedCard,
  createViewModel: createAdvancedCardBlockViewModel,
}
