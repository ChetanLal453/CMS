import {
  extractFieldValue,
  mergeFieldValue,
  updateComponentFieldSafely,
} from '@uadmin/shared/page/clientContentHelpers'

describe('clientContentHelpers', () => {
  describe('mergeFieldValue', () => {
    it('updates the specified key on an object while preserving other keys', () => {
      const existing = { text: 'Old Title', visible: true, extra: 123 }
      const merged = mergeFieldValue(existing, 'text', 'New Title')

      expect(merged).toEqual({
        text: 'New Title',
        visible: true,
        extra: 123,
      })
      // Ensure visible is strictly preserved
      expect(merged.visible).toBe(true)
    })

    it('returns the new value directly if existing is a primitive or null', () => {
      expect(mergeFieldValue('old string', 'text', 'new string')).toBe('new string')
      expect(mergeFieldValue(null, 'text', 'new string')).toBe('new string')
      expect(mergeFieldValue(undefined, 'text', 'new string')).toBe('new string')
    })
  })

  describe('extractFieldValue', () => {
    it('safely extracts text from an object without returning [object Object]', () => {
      const cardTitleObj = { text: 'Elegant Modern Design', visible: true }
      expect(extractFieldValue(cardTitleObj, 'text')).toBe('Elegant Modern Design')
      expect(extractFieldValue(cardTitleObj, 'text')).not.toBe('[object Object]')
    })

    it('safely extracts src from an image object without returning [object Object]', () => {
      const cardImageObj = { src: '/uploads/sample.jpg', alt: 'Card Image', visible: true }
      expect(extractFieldValue(cardImageObj, 'src')).toBe('/uploads/sample.jpg')
      expect(extractFieldValue(cardImageObj, 'src')).not.toBe('[object Object]')
    })

    it('safely extracts label from a button object', () => {
      const cardButtonObj = { label: 'Learn More', href: '#', visible: true }
      expect(extractFieldValue(cardButtonObj, 'label')).toBe('Learn More')
    })

    it('returns empty string for null or undefined', () => {
      expect(extractFieldValue(null)).toBe('')
      expect(extractFieldValue(undefined)).toBe('')
    })

    it('returns string representation for primitive values', () => {
      expect(extractFieldValue('Plain Heading')).toBe('Plain Heading')
      expect(extractFieldValue(42)).toBe('42')
    })
  })

  describe('updateComponentFieldSafely', () => {
    it('preserves "visible" and nested properties when updating Card Title', () => {
      const cardComp = {
        id: 'card-1',
        type: 'advancedcard',
        props: {
          content: {
            title: {
              text: 'Old Card Title',
              visible: true,
            },
            subtitle: {
              text: 'Old Subtitle',
              visible: true,
            },
          },
        },
      }

      updateComponentFieldSafely(cardComp, 'title', 'Updated Card Title')

      // Assert text was updated
      expect(cardComp.props.content.title.text).toBe('Updated Card Title')
      // Specifically verify that "visible" is preserved and not lost
      expect(cardComp.props.content.title.visible).toBe(true)
      // Verify subtitle was untouched
      expect(cardComp.props.content.subtitle).toEqual({ text: 'Old Subtitle', visible: true })
    })

    it('preserves "alt" and "visible" when updating Card Image src', () => {
      const cardComp = {
        id: 'card-1',
        type: 'advancedcard',
        props: {
          content: {
            image: {
              src: '/uploads/old.jpg',
              alt: 'Important Logo',
              visible: true,
            },
          },
        },
      }

      updateComponentFieldSafely(cardComp, 'src', '/uploads/new.jpg')

      expect(cardComp.props.content.image.src).toBe('/uploads/new.jpg')
      expect(cardComp.props.content.image.alt).toBe('Important Logo')
      expect(cardComp.props.content.image.visible).toBe(true)
    })

    it('preserves "visible" when updating Badge text', () => {
      const cardComp = {
        id: 'card-1',
        type: 'advancedcard',
        props: {
          content: {
            badge: {
              text: 'Old Badge',
              visible: true,
            },
          },
        },
      }

      updateComponentFieldSafely(cardComp, 'badge', 'Trending')

      expect(cardComp.props.content.badge.text).toBe('Trending')
      expect(cardComp.props.content.badge.visible).toBe(true)
    })

    it('preserves "label" and "visible" when updating Button link', () => {
      const cardComp = {
        id: 'card-1',
        type: 'advancedcard',
        props: {
          content: {
            button: {
              label: 'Explore',
              href: '/old-link',
              icon: 'arrow-right',
              visible: true,
            },
          },
        },
      }

      updateComponentFieldSafely(cardComp, 'buttonLink', '/new-service')

      expect(cardComp.props.content.button.href).toBe('/new-service')
      expect(cardComp.props.content.button.label).toBe('Explore')
      expect(cardComp.props.content.button.icon).toBe('arrow-right')
      expect(cardComp.props.content.button.visible).toBe(true)
    })

    it('updates standard primitive heading without corrupting structure', () => {
      const headingComp = {
        id: 'heading-1',
        type: 'advancedheading',
        props: {
          content: {
            text: 'Original Heading',
          },
        },
      }

      updateComponentFieldSafely(headingComp, 'text', 'New Headline')

      expect(headingComp.props.content.text).toBe('New Headline')
      expect((headingComp.props as any).text).toBe('New Headline')
    })
  })
})
