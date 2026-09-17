'use client'

import React from 'react'

interface AnimationControlProps {
  animation: Record<string, any>
  onChange: (property: string, value: any) => void
}

export const AnimationControl: React.FC<AnimationControlProps> = ({
  animation,
  onChange
}) => {
  const entranceAnimations = [
    { value: 'none', label: 'None' },
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'slideInUp', label: 'Slide In Up' },
    { value: 'slideInDown', label: 'Slide In Down' },
    { value: 'slideInLeft', label: 'Slide In Left' },
    { value: 'slideInRight', label: 'Slide In Right' },
    { value: 'zoomIn', label: 'Zoom In' },
    { value: 'bounceIn', label: 'Bounce In' },
    { value: 'rotateIn', label: 'Rotate In' }
  ]

  const scrollAnimations = [
    { value: 'none', label: 'None' },
    { value: 'fadeInOnScroll', label: 'Fade In on Scroll' },
    { value: 'slideUpOnScroll', label: 'Slide Up on Scroll' },
    { value: 'zoomInOnScroll', label: 'Zoom In on Scroll' },
    { value: 'bounceOnScroll', label: 'Bounce on Scroll' }
  ]

  const hoverEffects = [
    { value: 'none', label: 'None' },
    { value: 'scale', label: 'Scale' },
    { value: 'lift', label: 'Lift' },
    { value: 'glow', label: 'Glow' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'colorChange', label: 'Color Change' }
  ]

  const easingFunctions = [
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
    { value: 'linear', label: 'Linear' },
    { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: 'Bounce' },
    { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: 'Back' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Entrance Animation
        </label>
        <select
          value={animation.entranceAnimation || 'none'}
          onChange={(e) => onChange('entranceAnimation', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {entranceAnimations.map(anim => (
            <option key={anim.value} value={anim.value}>
              {anim.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Scroll Animation
        </label>
        <select
          value={animation.scrollAnimation || 'none'}
          onChange={(e) => onChange('scrollAnimation', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {scrollAnimations.map(anim => (
            <option key={anim.value} value={anim.value}>
              {anim.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Hover Effect
        </label>
        <select
          value={animation.hoverEffect || 'none'}
          onChange={(e) => onChange('hoverEffect', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {hoverEffects.map(effect => (
            <option key={effect.value} value={effect.value}>
              {effect.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Duration
          </label>
          <input
            type="text"
            value={animation.animationDuration || '0.3s'}
            onChange={(e) => onChange('animationDuration', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0.3s"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Delay
          </label>
          <input
            type="text"
            value={animation.animationDelay || '0s'}
            onChange={(e) => onChange('animationDelay', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0s"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Easing Function
        </label>
        <select
          value={animation.animationTiming || 'ease'}
          onChange={(e) => onChange('animationTiming', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {easingFunctions.map(easing => (
            <option key={easing.value} value={easing.value}>
              {easing.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Animation Iteration
        </label>
        <select
          value={animation.animationIteration || '1'}
          onChange={(e) => onChange('animationIteration', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="1">Once</option>
          <option value="infinite">Infinite</option>
          <option value="2">Twice</option>
          <option value="3">Three times</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Animation Fill Mode
        </label>
        <select
          value={animation.animationFillMode || 'none'}
          onChange={(e) => onChange('animationFillMode', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="none">None</option>
          <option value="forwards">Forwards</option>
          <option value="backwards">Backwards</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
  )
}
