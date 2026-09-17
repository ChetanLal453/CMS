/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardRendererSharedProps } from "../helpers";
import { getBadgeBorderRadius, getBadgeHoverStyle, getImageShadow, getVisualPosition } from "../helpers";
import CardButton from "./CardButton";
import CardMedia from "./CardMedia";
import CardText from "./CardText";

export default function DefaultCard({
  view,
  state,
  setImageError,
  setImageHovered,
  setBadgeHovered,
  setIconHovered,
  setButtonHovered,
  setTitleHovered,
  setSubtitleHovered,
  setDescriptionHovered,
}: AdvancedCardRendererSharedProps) {
  const actualPosition = getVisualPosition(view, state.imageError);
  const shouldShowVisualContent = (view.showImage && view.image && !state.imageError) || view.showIcon;
  const isBackgroundMode = actualPosition === "background";

  return (
    <>
      {isBackgroundMode && view.showImage && view.image && !state.imageError ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${view.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: `${view.borderRadius}px`,
            filter: state.isHovered ? "brightness(1.05)" : "brightness(1)",
            transition: "filter 0.3s ease",
            zIndex: 0,
          }}
        />
      ) : null}

      {isBackgroundMode ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: view.overlayColor,
            opacity: view.overlayOpacity,
            zIndex: 1,
            borderRadius: `${view.borderRadius}px`,
            transition: "opacity 0.3s ease",
            ...(state.isHovered ? { opacity: view.overlayOpacity * 0.8 } : {}),
          }}
        />
      ) : null}

      {view.showBadge ? (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: view.badgePosition === "top-left" ? "12px" : "auto",
            right: view.badgePosition === "top-right" ? "12px" : "auto",
            backgroundColor: view.badgeColor,
            color: view.badgeTextColor,
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
            borderRadius: getBadgeBorderRadius(view),
            zIndex: 20,
            transition: "transform 0.2s ease",
            ...getBadgeHoverStyle(view, state),
          }}
          onMouseEnter={() => setBadgeHovered(true)}
          onMouseLeave={() => setBadgeHovered(false)}
        >
          {view.badgeText}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: actualPosition === "left" ? "row" : actualPosition === "right" ? "row-reverse" : "column",
          flexWrap: "nowrap",
          gap: "16px",
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box" as const,
        }}
      >
        {shouldShowVisualContent && !isBackgroundMode ? (
          <div
            style={{
              width: actualPosition === "left" || actualPosition === "right" ? `${view.imageWidth}px` : "100%",
              minWidth: "100px",
              height: `${view.imageHeight}px`,
              borderRadius: `${view.imageBorderRadius}px`,
              overflow: "hidden",
              boxShadow: getImageShadow(view),
              position: "relative",
              transition: `all ${view.transitionDuration}s ease`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CardMedia
              view={view}
              state={state}
              onImageError={() => setImageError(true)}
              onImageMouseEnter={() => setImageHovered(true)}
              onImageMouseLeave={() => setImageHovered(false)}
              onIconMouseEnter={() => setIconHovered(true)}
              onIconMouseLeave={() => setIconHovered(false)}
            />
          </div>
        ) : null}

        {!shouldShowVisualContent && !isBackgroundMode ? (
          <div
            style={{
              width: actualPosition === "left" || actualPosition === "right" ? `${view.imageWidth}px` : "100%",
              minWidth: "100px",
              height: `${view.imageHeight}px`,
              backgroundColor: "#f3f4f6",
              borderRadius: `${view.imageBorderRadius}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              flexShrink: 0,
              transition: "all 0.3s ease",
              ...(state.isHovered ? { backgroundColor: "#e5e7eb" } : {}),
            }}
          >
            <span>No Visual Content</span>
          </div>
        ) : null}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column" as const,
            gap: "12px",
            color: isBackgroundMode ? "#ffffff" : "inherit",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <CardText
            view={view}
            state={state}
            kind="title"
            inBackground={isBackgroundMode}
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          />
          <CardText
            view={view}
            state={state}
            kind="subtitle"
            inBackground={isBackgroundMode}
            onMouseEnter={() => setSubtitleHovered(true)}
            onMouseLeave={() => setSubtitleHovered(false)}
          />
          <CardText
            view={view}
            state={state}
            kind="description"
            inBackground={isBackgroundMode}
            onMouseEnter={() => setDescriptionHovered(true)}
            onMouseLeave={() => setDescriptionHovered(false)}
          />

          {view.showButton ? (
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: view.buttonAlignment as any,
                flexWrap: "wrap" as const,
              }}
            >
              <CardButton
                view={view}
                state={state}
                onMouseEnter={() => setButtonHovered(true)}
                onMouseLeave={() => setButtonHovered(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
