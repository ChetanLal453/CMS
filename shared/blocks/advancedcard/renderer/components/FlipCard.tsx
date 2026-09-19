/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardRendererSharedProps } from "../helpers";
import { getAlignmentStyle, getBackSideStyles, getBadgeBorderRadius, getBadgeHoverStyle, getFlipContainerStyles, getFrontSideStyles } from "../helpers";
import CardButton from "./CardButton";
import CardMedia from "./CardMedia";

export default function FlipCard({
  view,
  state,
  iconSet,
  setImageError,
  setImageHovered,
  setBadgeHovered,
  setIconHovered,
  setButtonHovered,
  setTitleHovered,
  setSubtitleHovered,
  setDescriptionHovered,
}: AdvancedCardRendererSharedProps) {
  const EyeIcon = iconSet?.FaEye;
  const SyncIcon = iconSet?.FaSyncAlt;

  return (
    <div style={getFlipContainerStyles(view, state)}>
      <div style={getFrontSideStyles(view)}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              view.showImage && view.image && !state.imageError
                ? "transparent"
                : `linear-gradient(135deg, ${view.backgroundColor} 0%, ${view.cardHoverGlowColor || "#3b82f6"}15 100%)`,
            borderRadius: `${view.borderRadius}px`,
            transition: `all ${view.flipDuration}s ease`,
          }}
        />

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
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {view.showImage || view.showIcon ? (
            <CardMedia
              view={view}
              state={state}
              onImageError={() => setImageError(true)}
              onImageMouseEnter={() => setImageHovered(true)}
              onImageMouseLeave={() => setImageHovered(false)}
              onIconMouseEnter={() => setIconHovered(true)}
              onIconMouseLeave={() => setIconHovered(false)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(243, 244, 246, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                borderRadius: "12px",
                flexDirection: "column" as const,
                gap: "12px",
                padding: "20px",
                backdropFilter: "blur(2px)",
                border: "2px dashed rgba(107, 114, 128, 0.2)",
              }}
            >
              {EyeIcon ? <EyeIcon size={48} color="#9ca3af" /> : null}
              <span style={{ fontSize: "14px", fontWeight: 500, textAlign: "center" }}>
                Flip to see content
              </span>
              <span style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
                {view.flipOn === "hover" ? "Hover to flip" : "Click to flip"}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 500,
            zIndex: 15,
            opacity: state.isHovered ? 0.9 : 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {SyncIcon ? <SyncIcon size={10} color="white" /> : null}
          <span>{view.flipOn === "hover" ? "Hover to flip" : "Click to flip"}</span>
        </div>
      </div>

      <div style={getBackSideStyles(view)}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${view.backgroundColor} 0%, ${view.cardHoverGlowColor || "#3b82f6"}08 100%)`,
            borderRadius: `${view.borderRadius}px`,
            zIndex: 0,
            transition: `all ${view.flipDuration}s ease`,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60px",
            height: "60px",
            background: `linear-gradient(135deg, transparent 50%, ${view.cardHoverGlowColor || "#3b82f6"}20 50%)`,
            borderTopRightRadius: `${view.borderRadius}px`,
            zIndex: 1,
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "center",
            gap: "12px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {view.showTitle ? (
            <h3
              style={{
                color: view.titleColor,
                fontSize: view.titleFontSize,
                fontFamily: view.titleFontFamily || view.fontFamily,
                fontWeight: "bold",
                lineHeight: view.lineHeight,
                letterSpacing: view.textSpacing,
                margin: 0,
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                ...getAlignmentStyle((view.titleAlignment || view.textAlignment || "left") as any),
              }}
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
            >
              {view.title}
            </h3>
          ) : null}

          {view.showSubtitle ? (
            <h4
              style={{
                color: view.subtitleColor,
                fontSize: view.subtitleFontSize,
                fontFamily: view.fontFamily,
                lineHeight: view.lineHeight,
                letterSpacing: view.textSpacing,
                margin: 0,
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                ...getAlignmentStyle((view.subtitleAlign || view.textAlignment || "left") as any),
              }}
              onMouseEnter={() => setSubtitleHovered(true)}
              onMouseLeave={() => setSubtitleHovered(false)}
            >
              {view.subtitle}
            </h4>
          ) : null}

          {view.showDescription ? (
            <p
              style={{
                color: view.descriptionColor,
                fontSize: view.descriptionFontSize,
                fontFamily: view.fontFamily,
                lineHeight: view.lineHeight,
                letterSpacing: view.textSpacing,
                margin: 0,
                width: "100%",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical" as const,
                ...getAlignmentStyle((view.descriptionAlign || view.textAlignment || "left") as any),
              }}
              onMouseEnter={() => setDescriptionHovered(true)}
              onMouseLeave={() => setDescriptionHovered(false)}
            >
              {view.description}
            </p>
          ) : null}

          {view.showButton ? (
            <div
              style={{
                marginTop: "16px",
                width: "100%",
                display: "flex",
                justifyContent:
                  view.buttonFullWidth || view.buttonAlignment === "full-width" || view.buttonAlignment === "full"
                    ? "stretch"
                    : view.buttonAlignment === "right" || view.buttonAlignment === "flex-end"
                    ? "flex-end"
                    : view.buttonAlignment === "center"
                    ? "center"
                    : "flex-start",
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
    </div>
  );
}
