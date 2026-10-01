'use client'
import type { ChildrenType } from '@/types/component-props'
import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { TitleProvider } from '@/context/useTitleContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { Provider } from 'react-redux'
import store from '@/lib/store'
const LayoutProvider = dynamic(() => import('@/context/useLayoutContext').then((mod) => mod.LayoutProvider), { ssr: false })

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <Provider store={store}>
      <SessionProvider>
        <LayoutProvider>
          <TitleProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </TitleProvider>
        </LayoutProvider>
      </SessionProvider>
    </Provider>
  )
}
export default AppProvidersWrapper
