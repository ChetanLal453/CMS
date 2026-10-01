import { getPageLayoutRecord } from '../../../lib/layout-sync.js'
import { tableExists } from '../_utils/crud.js'

export async function GET() {
  try {
    if (!(await tableExists('pages'))) {
      return Response.json([])
    }

    const record = await getPageLayoutRecord({ slug: 'home' })
    const layout = record?.layout ?? { sections: [] }
    const sections = Array.isArray(layout.sections) ? layout.sections : []
    const chooseSection = sections.find((section) => String(section.type || '').toLowerCase() === 'choose')
    const source = chooseSection?.props ?? chooseSection?.content ?? {}

    return Response.json(Array.isArray(source.services) ? source.services : Array.isArray(source.items) ? source.items : [])
  } catch (error) {
    console.error(error)
    return Response.json([])
  }
}
