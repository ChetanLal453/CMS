import { useState, useEffect } from 'react'

export const useUIState = () => {
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(288) // w-72
  const [rightSidebarWidth, setRightSidebarWidth] = useState(384) // w-96
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true)
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setLeftSidebarVisible(false)
        setRightSidebarVisible(false)
      } else {
        setLeftSidebarVisible(true)
        setRightSidebarVisible(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      if (isResizingLeft) {
        const newWidth = Math.max(240, Math.min(480, e.clientX))
        setLeftSidebarWidth(newWidth)
      } else if (isResizingRight) {
        const newWidth = Math.max(240, Math.min(480, window.innerWidth - e.clientX))
        setRightSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      setIsResizingLeft(false)
      setIsResizingRight(false)
    }

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp, { passive: false })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingLeft, isResizingRight])

  return {
    leftSidebarWidth,
    setLeftSidebarWidth,
    rightSidebarWidth,
    setRightSidebarWidth,
    isResizingLeft,
    setIsResizingLeft,
    isResizingRight,
    setIsResizingRight,
    isMobile,
    leftSidebarVisible,
    setLeftSidebarVisible,
    rightSidebarVisible,
    setRightSidebarVisible
  }
}
