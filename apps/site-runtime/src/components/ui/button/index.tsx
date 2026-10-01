'use client'

import React from 'react'
import Link from 'next/link'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'
import { resolveIconComponent } from '../PublicBlocks/shared'

function optionalString(value?: string) {
  return value && value !== '' ? value : undefined
}

function isExternalUrl(href?: string) {
  return typeof href === 'string' && /^https?:\/\//i.test(href.trim())
}

function isDirectAnchorProtocol(href?: string) {
  if (typeof href !== 'string') return false
  const trimmed = href.trim()
  return (
    isExternalUrl(trimmed) ||
    /^tel:/i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    trimmed.startsWith('#')
  )
}

function renderButtonIcon(iconName: string) {
  const trimmed = String(iconName || '').trim()
  if (!trimmed) return null

  // Non-alphanumeric symbol or emoji: render as text
  if (!/[a-zA-Z0-9_-]/.test(trimmed)) {
    return trimmed
  }

  const IconComp = resolveIconComponent(trimmed)
  if (IconComp) {
    return <IconComp size="1em" />
  }

  return trimmed
}

const ButtonInner: React.FC<{ viewModel: Record<string, any> }> = ({ viewModel }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPressed, setIsPressed] = React.useState(false)
  const label = String(viewModel.label).trim()

  if (!label) {
    return reportCmsBoundaryViolation('button', 'Missing required button label.')
  }

  const iconElement = viewModel.showIcon && viewModel.iconName ? renderButtonIcon(viewModel.iconName) : null

  const content = (
    <>
      {viewModel.showIcon && viewModel.iconPosition === 'left' && iconElement ? (
        <span style={viewModel.iconStyle} aria-hidden="true">
          {iconElement}
        </span>
      ) : null}
      <span>{label}</span>
      {viewModel.showIcon && viewModel.iconPosition === 'right' && iconElement ? (
        <span style={viewModel.iconStyle} aria-hidden="true">
          {iconElement}
        </span>
      ) : null}
    </>
  )
  const interactiveStyle = {
    ...viewModel.buttonStyle,
    ...(isHovered ? viewModel.hoverStyle : null),
    ...(isPressed ? viewModel.activeStyle : null),
  }

  const useDirectAnchor =
    Boolean(viewModel.resolvedAction?.isNativeProtocol) ||
    Boolean(viewModel.resolvedAction?.isExternal) ||
    isDirectAnchorProtocol(viewModel.link)

  return (
    <div style={viewModel.containerStyle}>
      {viewModel.hasLink ? (
        useDirectAnchor ? (
          <a
            href={viewModel.link}
            target={viewModel.target}
            rel={viewModel.rel}
            style={interactiveStyle}
            id={optionalString(viewModel.customId)}
            className={`public-button ${viewModel.resolvedClassName}`.trim()}
            aria-label={optionalString(viewModel.ariaLabel)}
            data-tracking={optionalString(viewModel.dataTracking)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false)
              setIsPressed(false)
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}>
            {content}
          </a>
        ) : (
          <Link
            href={viewModel.link}
            target={viewModel.target}
            rel={viewModel.rel}
            style={interactiveStyle}
            id={optionalString(viewModel.customId)}
            className={`public-button ${viewModel.resolvedClassName}`.trim()}
            aria-label={optionalString(viewModel.ariaLabel)}
            data-tracking={optionalString(viewModel.dataTracking)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false)
              setIsPressed(false)
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}>
            {content}
          </Link>
        )
      ) : (
        <button
          type="button"
          disabled={viewModel.disabled}
          style={interactiveStyle}
          id={optionalString(viewModel.customId)}
          className={`public-button ${viewModel.resolvedClassName}`.trim()}
          aria-label={optionalString(viewModel.ariaLabel)}
          data-tracking={optionalString(viewModel.dataTracking)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            setIsPressed(false)
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}>
          {content}
        </button>
      )}
    </div>
  )
}

const PublicButton: React.FC<Record<string, any>> = (props) => {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('button', 'Missing required shared view model.')
  }

  return <ButtonInner viewModel={viewModel} />
}

export default PublicButton
