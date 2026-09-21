'use client'

import React from 'react'
import Link from 'next/link'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value?: string) {
  return value && value !== '' ? value : undefined
}

function isExternalUrl(href?: string) {
  return typeof href === 'string' && /^https?:\/\//i.test(href.trim())
}

const ButtonInner: React.FC<{ viewModel: Record<string, any> }> = ({ viewModel }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPressed, setIsPressed] = React.useState(false)
  const label = String(viewModel.label).trim()

  if (!label) {
    return reportCmsBoundaryViolation('button', 'Missing required button label.')
  }

  const content = (
    <>
      {viewModel.showIcon && viewModel.iconPosition === 'left' ? (
        <span style={viewModel.iconStyle} aria-hidden="true">
          {viewModel.iconName}
        </span>
      ) : null}
      <span>{label}</span>
      {viewModel.showIcon && viewModel.iconPosition === 'right' ? (
        <span style={viewModel.iconStyle} aria-hidden="true">
          {viewModel.iconName}
        </span>
      ) : null}
    </>
  )
  const interactiveStyle = {
    ...viewModel.buttonStyle,
    ...(isHovered ? viewModel.hoverStyle : null),
    ...(isPressed ? viewModel.activeStyle : null),
  }

  return (
    <div style={viewModel.containerStyle}>
      {viewModel.hasLink ? (
        isExternalUrl(viewModel.link) ? (
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
