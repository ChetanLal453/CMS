import type { AdvancedAccordion } from './types'

export const defaultAdvancedAccordionProps: AdvancedAccordion = {
  version: 1,
  type: 'advancedaccordion',
  schemaVersion: 1,
  content: {
    items: [
      {
        id: '1',
        title: 'What is CurveMetrics?',
        content:
          'CurveMetrics is a unified analytics platform that helps teams track their most important metrics across channels — all in one dashboard.',
        visible: true,
      },
      {
        id: '2',
        title: 'How does pricing work?',
        content: 'Choose a plan based on monthly tracked events and active workspaces, then scale as your team grows.',
        visible: true,
      },
      {
        id: '3',
        title: 'Can I export my data?',
        content: 'Yes, you can export reports and dashboards in CSV and JSON formats with role-based access controls.',
        visible: true,
      },
    ],
  },
  responsive: {
    desktop: {},
    tablet: {},
    mobile: {},
  },
  items: [
    {
      id: '1',
      title: 'What is CurveMetrics?',
      content:
        'CurveMetrics is a unified analytics platform that helps teams track their most important metrics across channels — all in one dashboard.',
      visible: true,
    },
    {
      id: '2',
      title: 'How does pricing work?',
      content: 'Choose a plan based on monthly tracked events and active workspaces, then scale as your team grows.',
      visible: true,
    },
    {
      id: '3',
      title: 'Can I export my data?',
      content: 'Yes, you can export reports and dashboards in CSV and JSON formats with role-based access controls.',
      visible: true,
    },
  ],
  style: {
    itemSpacing: '8px',
    padding: '0px',
    margin: '0px',
    titleFontSize: '13px',
    titleFontWeight: '500',
    contentFontSize: '13px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    lineHeight: '1.65',
    titleColor: '#e8eaf0',
    titleBackground: '#1a1d28',
    contentColor: '#8b90a8',
    contentBackground: '#13161e',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px',
    activeTitleColor: '#a594ff',
    activeTitleBackground: 'rgba(124,109,250,0.12)',
  },
  interaction: {
    behavior: 'single',
    allowAllClosed: false,
    iconPosition: 'right',
    icon: 'chevron',
    activeIcon: 'chevron',
    animation: 'slide',
    animationDuration: 200,
  },
}
