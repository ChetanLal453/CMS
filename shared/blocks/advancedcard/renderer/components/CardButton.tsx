/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardViewModel } from "../../viewModel";
import type { AdvancedCardRenderState } from "../helpers";
import { getButtonStyles } from "../helpers";

interface CardButtonProps {
  view: AdvancedCardViewModel;
  state: AdvancedCardRenderState;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function CardButton({ view, state, onMouseEnter, onMouseLeave }: CardButtonProps) {
  if (!view.showButton) {
    return null;
  }

  const isFullWidth = Boolean(
    view.buttonFullWidth || view.buttonAlignment === "full-width" || view.buttonAlignment === "full"
  );

  return (
    <a
      href={view.buttonLink || "#"}
      style={{
        ...getButtonStyles(view, state),
        ...(isFullWidth
          ? {
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box" as const,
            }
          : {}),
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(event) => event.stopPropagation()}
    >
      {view.buttonIcon ? <span>{view.buttonIcon}</span> : null}
      <span>{view.buttonText}</span>
    </a>
  );
}
