import { lazy, Suspense } from 'react'
import FallbackLoading from '@/components/FallbackLoading'
import type { ChildrenType } from '@/types/component-props'
import AuthProtectionWrapper from '@/components/wrappers/AuthProtectionWrapper'

const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar'))

const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <AuthProtectionWrapper>
      <div className="cm-admin-shell">
        <Suspense fallback={<FallbackLoading />}>
          <TopNavigationBar />
        </Suspense>
        <div className="body">
          <div className="main-panel active">
            <Suspense>{children}</Suspense>
          </div>
        </div>
      </div>
    </AuthProtectionWrapper>
  )
}

export default AdminLayout
