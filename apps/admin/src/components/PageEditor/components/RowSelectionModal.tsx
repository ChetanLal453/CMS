'use client'

import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'

interface RowSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (numColumns: number) => void
}

export const RowSelectionModal: React.FC<RowSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [selectedColumns, setSelectedColumns] = useState<number>(1)

  useEffect(() => {
    Modal.setAppElement(document.body)
  }, [])

  const handleConfirm = () => {
    onConfirm(selectedColumns)
    onClose()
    setSelectedColumns(1) // Reset for next time
  }

  const columnOptions = [
    { value: 1, label: '1 Column', description: 'Single column layout' },
    { value: 2, label: '2 Columns', description: 'Two column layout' },
    { value: 3, label: '3 Columns', description: 'Three column layout' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">Add New Section</h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">Choose the number of columns for your new section:</p>
          <div className="space-y-3">
            {columnOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedColumns === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="columns"
                  value={option.value}
                  checked={selectedColumns === option.value}
                  onChange={() => setSelectedColumns(option.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Add Section
          </button>
        </div>
      </div>
    </Modal>
  )
}
