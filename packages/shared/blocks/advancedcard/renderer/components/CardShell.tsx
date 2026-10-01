/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardViewModel } from "../../viewModel";
import type { AdvancedCardRenderState } from "../helpers";
import { getAnimationStyles, getBaseCardStyles } from "../helpers";

interface CardShellProps {
  view: AdvancedCardViewModel;
  state: AdvancedCardRenderState;
  children: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function CardShell({
  view,
  state,
  children,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: CardShellProps) {
  return (
    <div
      id={view.id}
      className={`advanced-card ${view.customClass}`}
      style={{ ...getBaseCardStyles(view, state), ...getAnimationStyles(view) }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
