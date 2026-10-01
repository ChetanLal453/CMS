'use client'

import React from 'react'

interface AddContainerButtonProps {
  onAddSection: () => void
}

export const AddContainerButton: React.FC<AddContainerButtonProps> = ({ onAddSection }) => {
  return (
    <button
      onClick={onAddSection}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Add Container
    </button>
  )
}

export default AddContainerButton
