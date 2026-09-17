/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardViewModel } from "../../viewModel";
import type { AdvancedCardRenderState } from "../helpers";
import { getDescriptionHoverStyle, getSubtitleHoverStyle, getTitleHoverStyle } from "../helpers";

interface CardTextProps {
  view: AdvancedCardViewModel;
  state: AdvancedCardRenderState;
  kind: "title" | "subtitle" | "description";
  inBackground?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function CardText({
  view,
  state,
  kind,
  inBackground = false,
  onMouseEnter,
  onMouseLeave,
}: CardTextProps) {
  if (kind === "title") {
    if (!view.showTitle) {
      return null;
    }

    return (
      <h3
        className="advanced-card-title"
        style={{
          color: inBackground ? "#ffffff" : view.titleColor,
          fontSize: view.titleFontSize,
          fontFamily: view.titleFontFamily || view.fontFamily,
          fontWeight: "bold",
          lineHeight: view.lineHeight || 1.35,
          letterSpacing: view.textSpacing,
          textAlign: view.titleAlignment as any,
          margin: 0,
          marginBottom: "6px",
          overflow: "visible",
          flexShrink: 0,
          ...getTitleHoverStyle(view, state),
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {view.title}
      </h3>
    );
  }

  if (kind === "subtitle") {
    if (!view.showSubtitle) {
      return null;
    }

    return (
      <h4
        className="advanced-card-subtitle"
        style={{
          color: inBackground ? "#ffffff" : view.subtitleColor,
          fontSize: view.subtitleFontSize,
          fontFamily: view.fontFamily,
          lineHeight: view.lineHeight || 1.4,
          letterSpacing: view.textSpacing,
          textAlign: view.subtitleAlign as any,
          margin: 0,
          marginBottom: "6px",
          overflow: "visible",
          flexShrink: 0,
          ...getSubtitleHoverStyle(view, state),
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {view.subtitle}
      </h4>
    );
  }

  if (!view.showDescription) {
    return null;
  }

  return (
    <p
      className="advanced-card-description"
      style={{
        color: inBackground ? "#ffffff" : view.descriptionColor,
        fontSize: view.descriptionFontSize,
        fontFamily: view.fontFamily,
        lineHeight: view.lineHeight || 1.5,
        letterSpacing: view.textSpacing,
        textAlign: view.descriptionAlign as any,
        margin: 0,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical" as const,
        flexShrink: 0,
        ...getDescriptionHoverStyle(view, state),
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {view.description}
    </p>
  );
}
