'use client'

import React from 'react'

type State = {
  hasError: boolean
  errorMessage: string
}

export class PageEditorErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {
    hasError: false,
    errorMessage: '',
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected editor error',
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PageEditor crashed:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">Editor Error</div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">The page editor hit a problem.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{this.state.errorMessage || 'Something went wrong while rendering the editor.'}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              Reload Editor
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
