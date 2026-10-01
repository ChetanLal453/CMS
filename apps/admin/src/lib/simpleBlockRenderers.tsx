import React from 'react'
import { createBlockViewModel, type BlockTypeKey } from '@uadmin/shared/blocks/registry'

export function renderSimpleAdminBlock(type: BlockTypeKey, props: Record<string, unknown>): React.ReactElement {
  const viewModel = createBlockViewModel(type, props) as Record<string, unknown>
  const shellStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '10px',
    border: '0.5px solid #2e3450',
    background: '#1e2235',
    overflow: 'hidden',
  }
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 14px 8px',
    borderBottom: '0.5px solid #2e3450',
  }
  const eyebrowStyle: React.CSSProperties = {
    display: 'inline-block',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#a89cf5',
  }
  const titleStyle: React.CSSProperties = {
    marginTop: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#c8cce6',
  }
  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '2px 7px',
    borderRadius: '999px',
    border: '0.5px solid #3d3870',
    background: '#2a2f4a',
    color: '#a89cf5',
    fontSize: '10px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  }
  const bodyStyle: React.CSSProperties = {
    padding: '14px',
  }
  const footerStyle: React.CSSProperties = {
    padding: '6px 14px',
    borderTop: '0.5px solid #2e3450',
    display: 'flex',
    justifyContent: 'center',
  }
  const footerLabelStyle: React.CSSProperties = {
    fontSize: '9px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#4a5070',
  }

  const renderShell = (title: string, chip: string, content: React.ReactNode, footerLabel?: string) =>
    React.createElement(
      'div',
      { style: shellStyle },
      React.createElement(
        'div',
        { style: headerStyle },
        React.createElement(
          'div',
          null,
          React.createElement('div', { style: eyebrowStyle }, 'Preview'),
          React.createElement('div', { style: titleStyle }, title),
        ),
        React.createElement('div', { style: chipStyle }, chip),
      ),
      React.createElement('div', { style: bodyStyle }, content),
      footerLabel ? React.createElement('div', { style: footerStyle }, React.createElement('span', { style: footerLabelStyle }, footerLabel)) : null,
    )

  switch (type) {
    case 'spacer':
      return React.createElement('div', {
        style: {
          width: '100%',
          height: String(viewModel.height || '32px'),
          backgroundColor: String(viewModel.editorBackgroundColor || 'transparent'),
        },
      })
    case 'container':
      return renderShell(
        'Container',
        `${String(viewModel.maxWidth || '100%')}`,
        React.createElement(
          'div',
          {
            style: {
              minHeight: '72px',
              borderRadius: '8px',
              border: '1.5px dashed #3d4460',
              background: '#252a40',
              padding: String(viewModel.padding || '12px'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c8cce6',
              textAlign: 'center',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                width: '100%',
                border: '1.5px dashed #4a5070',
                borderRadius: '6px',
                padding: '10px',
              },
            },
            React.createElement('div', { style: { fontSize: '12px', fontWeight: 500, color: '#c8cce6' } }, 'Content Container'),
            React.createElement(
              'div',
              { style: { marginTop: '2px', fontSize: '10px', color: '#6b7299' } },
              `Padding ${String(viewModel.padding || '20px')} • Margin ${String(viewModel.margin || '0 auto')}`,
            ),
          ),
        ),
        'Container (Container)',
      )
    case 'flexbox':
      return renderShell(
        'Flex Layout',
        `${String(viewModel.direction || 'row')}`,
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: String(viewModel.direction || 'row') as React.CSSProperties['flexDirection'],
              justifyContent: String(viewModel.justifyContent || 'flex-start') as React.CSSProperties['justifyContent'],
              alignItems: String(viewModel.alignItems || 'stretch') as React.CSSProperties['alignItems'],
              gap: '10px',
              minHeight: '52px',
              padding: '10px',
              border: '1.5px dashed #3d4460',
              borderRadius: '8px',
              background: '#252a40',
            },
          },
          [0, 1].map((index) =>
            React.createElement('div', {
              key: index,
              style: {
                flex: index === 0 ? 1 : '0 0 120px',
                minHeight: '32px',
                borderRadius: '6px',
                border: index === 0 ? '1.5px dashed #3d4460' : '0',
                background: index === 1 ? '#3a3a60' : 'transparent',
                opacity: index === 1 ? 0.5 : 1,
              },
            }),
          ),
        ),
        'Flex (Flexbox)',
      )
    case 'button': {
      const showIcon = Boolean(viewModel.showIcon && viewModel.iconName)
      const rawIcon = String(viewModel.iconName || '').trim()
      let iconGlyph: React.ReactNode = rawIcon
      if (rawIcon === 'phone') iconGlyph = '📞'
      else if (rawIcon === 'calendar-check' || rawIcon === 'calendar') iconGlyph = '📅'
      else if (rawIcon === 'wrench') iconGlyph = '🔧'
      else if (rawIcon === 'shield-check') iconGlyph = '🛡️'
      else if (rawIcon === 'clock') iconGlyph = '⏱️'
      else if (rawIcon === 'check-circle' || rawIcon === 'check') iconGlyph = '✓'
      else if (rawIcon === 'arrow-right') iconGlyph = '➔'
      else if (rawIcon === 'arrow-left') iconGlyph = '←'
      else if (rawIcon === 'star') iconGlyph = '⭐'
      else if (rawIcon === 'mail' || rawIcon === 'envelope') iconGlyph = '✉️'

      const iconElement = showIcon
        ? React.createElement(
            'span',
            {
              style: (viewModel.iconStyle as React.CSSProperties) || {
                marginRight: viewModel.iconPosition === 'right' ? 0 : '8px',
                marginLeft: viewModel.iconPosition === 'right' ? '8px' : 0,
                display: 'inline-flex',
                alignItems: 'center',
              },
            },
            iconGlyph,
          )
        : null

      return React.createElement(
        'div',
        {
          style: (viewModel.containerStyle as React.CSSProperties) || {},
        },
        React.createElement(
          'button',
          {
            type: 'button',
            style: (viewModel.buttonStyle as React.CSSProperties) || {},
          },
          viewModel.iconPosition === 'right' ? null : iconElement,
          React.createElement('span', null, String(viewModel.label || viewModel.text || 'Click Me')),
          viewModel.iconPosition === 'right' ? iconElement : null,
        ),
      )
    }
    case 'quote':
      return React.createElement(
        'blockquote',
        {
          style: {
            margin: String(viewModel.margin || '0'),
            color: String(viewModel.color || 'inherit'),
            borderRadius: '8px',
            padding: '16px 20px',
            background: 'rgba(124, 109, 250, 0.06)',
            borderLeft: '4px solid #7c6dfa',
          },
        },
        [
          React.createElement(
            'p',
            {
              key: 'text',
              style: {
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.6',
                fontStyle: 'italic',
              },
            },
            `"${String(viewModel.text || 'Quote text goes here...')}"`,
          ),
          viewModel.author
            ? React.createElement(
                'cite',
                { key: 'author', style: { display: 'block', marginTop: '8px', fontSize: '13px', fontStyle: 'normal', opacity: 0.8 } },
                `— ${String(viewModel.author || '')}`,
              )
            : null,
        ].filter(Boolean),
      )
    case 'video':
      return React.createElement(
        'div',
        {
          style: {
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#0f172a',
            color: '#fff',
          },
        },
        String(viewModel.title || viewModel.src || ''),
      )
    case 'icon': {
      const raw = String(viewModel.iconName || viewModel.name || '').trim()
      let glyph = raw || '★'
      if (raw === 'phone') glyph = '📞'
      else if (raw === 'calendar-check' || raw === 'calendar') glyph = '📅'
      else if (raw === 'wrench') glyph = '🔧'
      else if (raw === 'shield-check') glyph = '🛡️'
      else if (raw === 'clock') glyph = '⏱️'
      else if (raw === 'check-circle' || raw === 'check') glyph = '✓'
      else if (raw === 'arrow-right') glyph = '➔'
      else if (raw === 'arrow-left') glyph = '←'
      else if (raw === 'star') glyph = '⭐'
      else if (raw === 'mail' || raw === 'envelope') glyph = '✉️'

      const rawColor = String(viewModel.color || '').trim()
      const resolvedColor = !rawColor || rawColor === '#000000' || rawColor === 'black' ? '#a594ff' : rawColor

      return React.createElement(
        'div',
        {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: String(viewModel.size || 'auto'),
            height: String(viewModel.size || 'auto'),
            color: resolvedColor,
            fontSize: String(viewModel.size || '16px'),
            lineHeight: 1,
          },
        },
        glyph,
      )
    }
    case 'divider':
      return React.createElement('hr', {
        style: {
          border: 'none',
          borderTop: `${String(viewModel.thickness || '1px')} solid ${String(viewModel.color || '#cbd5e1')}`,
          width: String(viewModel.width || '100%'),
          margin: String(viewModel.margin || '16px 0'),
        },
      })
    default:
      return React.createElement(
        'div',
        {
          style: {
            padding: '12px',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
          },
        },
        type,
      )
  }
}

export const simpleBlockRenderers: Record<string, (props: Record<string, unknown>) => React.ReactElement> = {
  spacer: (props) => renderSimpleAdminBlock('spacer', props),
  container: (props) => renderSimpleAdminBlock('container', props),
  flexbox: (props) => renderSimpleAdminBlock('flexbox', props),
  button: (props) => renderSimpleAdminBlock('button', props),
  quote: (props) => renderSimpleAdminBlock('quote', props),
  video: (props) => renderSimpleAdminBlock('video', props),
  icon: (props) => renderSimpleAdminBlock('icon', props),
  divider: (props) => renderSimpleAdminBlock('divider', props),
}
