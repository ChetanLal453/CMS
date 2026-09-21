'use client'

import React, { useState } from 'react'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { collectNodes } from '../PublicBlocks/shared'
import type { TabItem, TabsViewModel } from '../../../../../shared/blocks/tabs'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value: string) {
  return value === '' ? undefined : value
}

type TabsRendererProps = PublicBlockProps & {
  __sharedViewModel?: TabsViewModel
}

function TabsInner({ viewModel, renderComponent }: { viewModel: TabsViewModel; renderComponent: TabsRendererProps['renderComponent'] }) {
  const tabs = viewModel.tabs
  const [activeIndex, setActiveIndex] = useState(viewModel.activeIndex)

  if (!tabs.length) {
    return reportCmsBoundaryViolation('tabs', 'No tabs were provided for rendering.')
  }

  const safeActiveIndex = Math.max(0, Math.min(activeIndex, tabs.length - 1))
  const activeTab: TabItem = tabs[safeActiveIndex]
  const tabContentNodes = collectNodes(activeTab.components, renderComponent, `tabs-${safeActiveIndex}`)
  const content = activeTab.content.trim()

  return (
    <div className={viewModel.className} style={viewModel.containerStyle} id={optionalString(viewModel.customId)}>
      <div
        role="tablist"
        aria-label={optionalString(viewModel.resolvedAriaLabel)}
        style={viewModel.tabListStyle}>
        {tabs.map((tab: TabItem, index: number) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            disabled={Boolean(tab.disabled)}
            style={activeIndex === index ? { ...viewModel.tabButtonStyle, ...viewModel.activeTabButtonStyle } : viewModel.tabButtonStyle}>
            {tab.title}
          </button>
        ))}
      </div>

      <div style={viewModel.contentStyle}>
        {content ? <div style={{ marginBottom: tabContentNodes.length ? '16px' : 0 }}>{content}</div> : null}
        {tabContentNodes}
      </div>
    </div>
  )
}

export default function PublicTabs(props: TabsRendererProps) {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('tabs', 'Missing required shared view model.')
  }

  return <TabsInner viewModel={viewModel} renderComponent={props.renderComponent} />
}
