import type { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'Main',
    isTitle: true,
  },
  {
    key: 'dashboard',
    icon: 'ri:dashboard-line',
    label: 'Dashboard',
    url: '/dashboard',
  },
  {
    key: 'page-editor',
    icon: 'ri:layout-line',
    label: 'Page Editor',
    url: '/page-editor',
  },
  {
    key: 'navigation',
    icon: 'ri:route-line',
    label: 'Navigation',
    children: [
      {
        key: 'navigation-header',
        label: 'Header Editor',
        url: '/layout/header',
        parentKey: 'navigation',
      },
      {
        key: 'navigation-footer',
        label: 'Footer Editor',
        url: '/layout/footer',
        parentKey: 'navigation',
      },
    ],
  },
  {
    key: 'content',
    icon: 'ri:file-list-3-line',
    label: 'Content',
    children: [
      {
        key: 'content-services',
        label: 'Services',
        url: '/content/services',
        parentKey: 'content',
      },
      {
        key: 'content-team',
        label: 'Team',
        url: '/content/team',
        parentKey: 'content',
      },
      {
        key: 'content-blog',
        label: 'Blog',
        url: '/content/blog',
        parentKey: 'content',
      },
      {
        key: 'content-faqs',
        label: 'FAQs',
        url: '/content/faqs',
        parentKey: 'content',
      },
    ],
  },
  {
    key: 'leads',
    icon: 'ri:inbox-line',
    label: 'Leads',
    url: '/leads',
  },
]
