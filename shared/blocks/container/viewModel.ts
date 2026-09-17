import { normalizeContainer } from './normalize'

export function createContainerViewModel(props: Record<string, any> = {}) {
  return normalizeContainer(props)
}
