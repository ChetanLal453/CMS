'use client'

import React, { createContext, useContext, useMemo } from 'react'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export interface DeviceModeContextValue {
  deviceMode: DeviceMode
  setDeviceMode?: (mode: DeviceMode) => void
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const defaultContextValue: DeviceModeContextValue = {
  deviceMode: 'desktop',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
}

export const DeviceModeContext = createContext<DeviceModeContextValue>(defaultContextValue)

export const DeviceModeProvider: React.FC<{
  deviceMode: DeviceMode
  onDeviceModeChange?: (mode: DeviceMode) => void
  children: React.ReactNode
}> = ({ deviceMode, onDeviceModeChange, children }) => {
  const value = useMemo<DeviceModeContextValue>(
    () => ({
      deviceMode,
      setDeviceMode: onDeviceModeChange,
      isMobile: deviceMode === 'mobile',
      isTablet: deviceMode === 'tablet',
      isDesktop: deviceMode === 'desktop',
    }),
    [deviceMode, onDeviceModeChange],
  )

  return <DeviceModeContext.Provider value={value}>{children}</DeviceModeContext.Provider>
}

export const useDeviceMode = (): DeviceModeContextValue => {
  return useContext(DeviceModeContext)
}
