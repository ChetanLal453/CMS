/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardViewModel } from "../../viewModel";
import type { AdvancedCardIconSet, AdvancedCardRenderState } from "../helpers";
import { getIconComponent, getIconHoverStyle, getIconShapeStyle, getIconShadow, getImageHoverStyle, getImageShadow } from "../helpers";

interface CardMediaProps {
  view: AdvancedCardViewModel;
  state: AdvancedCardRenderState;
  iconSet?: AdvancedCardIconSet;
  onImageError: () => void;
  onImageMouseEnter: () => void;
  onImageMouseLeave: () => void;
  onIconMouseEnter: () => void;
  onIconMouseLeave: () => void;
}

export default function CardMedia({
  view,
  state,
  iconSet,
  onImageError,
  onImageMouseEnter,
  onImageMouseLeave,
  onIconMouseEnter,
  onIconMouseLeave,
}: CardMediaProps) {
  if (view.showImage && view.resolvedImage && !state.imageError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: `${view.imageBorderRadius}px`,
          overflow: "hidden",
          boxShadow: getImageShadow(view),
          transition: `all ${view.transitionDuration}s ease`,
          ...getImageHoverStyle(view, state),
        }}
      >
        <img
          src={view.resolvedImage}
          alt={view.alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: view.objectFit,
            transition: `all ${view.transitionDuration}s ease`,
          }}
          onError={onImageError}
          onMouseEnter={onImageMouseEnter}
          onMouseLeave={onImageMouseLeave}
        />
      </div>
    );
  }

  if (view.showIcon) {
    return (
      <div
        style={{
          backgroundColor: view.iconBackgroundColor,
          padding: `${view.iconPadding}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: getIconShadow(view),
          transition: `all ${view.transitionDuration}s ease`,
          ...getIconShapeStyle(view),
          ...getIconHoverStyle(view, state),
        }}
        onMouseEnter={onIconMouseEnter}
        onMouseLeave={onIconMouseLeave}
      >
        {getIconComponent(view, iconSet)}
      </div>
    );
  }

  return null;
}
