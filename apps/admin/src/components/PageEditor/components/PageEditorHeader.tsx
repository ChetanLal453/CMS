'use client'

import React from 'react'

interface PageEditorHeaderProps {
  pages: Array<{ id: string; name: string; active: boolean; disabled: boolean }>
  currentPageId: string | null
  loading: boolean
  showSaveButton?: boolean
  onSave?: () => void
  sectionCount?: number
  isSaving?: boolean
  hasPendingChanges?: boolean
  onPublish?: () => void
  onShowHistory?: () => void
}

const ToolIcon = ({ children }: { children: React.ReactNode }) => <svg viewBox="0 0 16 16">{children}</svg>

export const PageEditorHeader: React.FC<PageEditorHeaderProps> = ({
  pages,
  currentPageId,
  loading,
  showSaveButton = true,
  onSave,
  sectionCount = 0,
  isSaving = false,
  hasPendingChanges = false,
  onPublish,
  onShowHistory,
}) => {
  void pages
  void currentPageId
  void loading
  void showSaveButton
  void onSave
  void sectionCount
  void isSaving
  void hasPendingChanges
  void onPublish
  void onShowHistory

  return null
}
