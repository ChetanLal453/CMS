import { normalizeVideo, resolveVideoSource } from '../../../../shared/blocks/video/normalize'
import { createVideoViewModel } from '../../../../shared/blocks/video/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('Video Canonical Normalizer & ViewModel', () => {
  it('normalizes video sparsely without eager style defaults', () => {
    const normalized = normalizeVideo({
      content: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.src).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(normalized.style?.width).toBeUndefined()
    expect(normalized.style?.maxWidth).toBeUndefined()
    expect(normalized.style?.aspectRatio).toBeUndefined()
    expect(normalized.style?.borderRadius).toBeUndefined()
    expect(normalized.style?.borderColor).toBeUndefined()
    expect(normalized.style?.showOverlay).toBeUndefined()
  })

  it('preserves explicitly configured content and style properties', () => {
    const normalized = normalizeVideo({
      content: {
        src: 'https://vimeo.com/76979871',
        sourceType: 'vimeo',
        title: 'Vimeo Demo',
        autoplay: true,
        muted: true,
      },
      style: {
        width: '80%',
        aspectRatio: '4 / 3',
        borderRadius: 16,
        borderColor: '#7c6dfa',
        showOverlay: false,
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.src).toBe('https://vimeo.com/76979871')
    expect(normalized.content?.sourceType).toBe('vimeo')
    expect(normalized.content?.autoplay).toBe(true)
    expect(normalized.style?.width).toBe('80%')
    expect(normalized.style?.aspectRatio).toBe('4 / 3')
    expect(normalized.style?.borderRadius).toBe(16)
    expect(normalized.style?.borderColor).toBe('#7c6dfa')
    expect(normalized.style?.showOverlay).toBe(false)
  })

  it('provides runtime defaults in createVideoViewModel and resolves embed source', () => {
    const vm = createVideoViewModel({
      content: {
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    expect(vm.resolvedTitle).toBe('Video')
    expect(vm.isMp4).toBe(false)
    expect(vm.resolvedSource.kind).toBe('youtube')
    expect(vm.resolvedSource.src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(vm.width).toBe('100%')
    expect(vm.aspectRatio).toBe('16 / 9')
  })

  it('migrates legacy flat video props to canonical version 1 structure non-destructively', () => {
    const result = migrateLayoutInput({
      id: 'test-page',
      sections: [
        {
          id: 'sec-1',
          type: 'hero',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  components: [
                    {
                      id: 'vid-1',
                      type: 'video',
                      props: {
                        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        title: 'Demo Video',
                        width: '90%',
                        borderRadius: 12,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    const comp = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(comp.props.version).toBe(1)
    expect(comp.props.content?.src).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(comp.props.content?.title).toBe('Demo Video')
    expect(comp.props.style?.width).toBe('90%')
    expect(comp.props.style?.borderRadius).toBe(12)
    expect(comp.props.src).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(comp.props.width).toBe('90%')
  })
})
