/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCardViewModel } from "../viewModel";

export type AdvancedCardIconComponent = React.ComponentType<{
  size?: string | number;
  color?: string;
}>;

export type AdvancedCardIconSet = Record<string, AdvancedCardIconComponent>;

export interface AdvancedCardRenderState {
  isHovered: boolean;
  isFlipped: boolean;
  imageError: boolean;
  imageHovered: boolean;
  badgeHovered: boolean;
  iconHovered: boolean;
  buttonHovered: boolean;
  titleHovered: boolean;
  subtitleHovered: boolean;
  descriptionHovered: boolean;
}

export interface AdvancedCardRendererSharedProps {
  view: AdvancedCardViewModel;
  state: AdvancedCardRenderState;
  iconSet?: AdvancedCardIconSet;
  setImageError: (value: boolean) => void;
  setImageHovered: (value: boolean) => void;
  setBadgeHovered: (value: boolean) => void;
  setIconHovered: (value: boolean) => void;
  setButtonHovered: (value: boolean) => void;
  setTitleHovered: (value: boolean) => void;
  setSubtitleHovered: (value: boolean) => void;
  setDescriptionHovered: (value: boolean) => void;
}

export const ADVANCED_CARD_STYLES = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor; }
}

@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.advanced-card {
  box-sizing: border-box;
}

.advanced-card * {
  box-sizing: border-box;
}
`;

export function ensureAdvancedCardStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById("advanced-card-styles")) {
    return;
  }

  const styleSheet = document.createElement("style");
  styleSheet.id = "advanced-card-styles";
  styleSheet.innerText = ADVANCED_CARD_STYLES;
  document.head.appendChild(styleSheet);
}

export function getIconComponent(view: AdvancedCardViewModel, iconSet?: AdvancedCardIconSet) {
  let iconName = view.icon || "FaStar";

  if (!iconName.startsWith("Fa")) {
    iconName = "Fa" + iconName.charAt(0).toUpperCase() + iconName.slice(1);
  }

  const IconComponent = iconSet?.[iconName];
  const FallbackIcon = iconSet?.FaStar;

  if (!IconComponent) {
    return FallbackIcon ? <FallbackIcon size={view.iconSize} color={view.iconColor} /> : null;
  }

  return <IconComponent size={view.iconSize} color={view.iconColor} />;
}

export function getAlignmentStyle(alignmentProp: "left" | "center" | "right") {
  switch (alignmentProp) {
    case "center":
      return { textAlign: "center" as const };
    case "right":
      return { textAlign: "right" as const };
    default:
      return { textAlign: "left" as const };
  }
}

export function getIconShapeStyle(view: AdvancedCardViewModel) {
  switch (view.iconShape) {
    case "circle":
      return { borderRadius: "50%" };
    case "square":
      return { borderRadius: "0px" };
    case "rounded":
      return { borderRadius: `${view.iconBorderRadius}px` };
    default:
      return { borderRadius: "50%" };
  }
}

export function getIconShadow(view: AdvancedCardViewModel) {
  switch (view.iconShadow) {
    case "none":
      return "none";
    case "sm":
      return "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    case "md":
      return "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    case "lg":
      return "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
    default:
      return "none";
  }
}

export function getCardHoverShadow(view: AdvancedCardViewModel) {
  switch (view.cardHoverShadow) {
    case "none":
      return "none";
    case "sm":
      return "0 4px 12px rgba(0,0,0,0.15)";
    case "md":
      return "0 8px 24px rgba(0,0,0,0.15)";
    case "lg":
      return "0 12px 36px rgba(0,0,0,0.15)";
    case "xl":
      return "0 20px 48px rgba(0,0,0,0.15)";
    default:
      return "0 8px 24px rgba(0,0,0,0.15)";
  }
}

export function getCardHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.isHovered || view.cardHoverEffect === "none") {
    return {};
  }

  const baseTransition = `all ${view.cardHoverDuration}s ease`;

  switch (view.cardHoverEffect) {
    case "scale":
      return {
        transform: `scale(${view.cardHoverScale})`,
        transition: baseTransition,
        zIndex: 10,
      };
    case "lift":
      return {
        transform: "translateY(-8px)",
        boxShadow: getCardHoverShadow(view),
        transition: baseTransition,
        zIndex: 10,
      };
    case "shadow":
      return {
        boxShadow: getCardHoverShadow(view),
        transition: baseTransition,
      };
    case "glow": {
      const opacity = Math.round(view.cardHoverGlowIntensity * 255).toString(16).padStart(2, "0");
      return {
        boxShadow: `0 0 20px ${view.cardHoverGlowColor}${opacity}`,
        transition: baseTransition,
      };
    }
    case "border-glow": {
      const opacity = Math.round(view.cardHoverGlowIntensity * 255).toString(16).padStart(2, "0");
      return {
        boxShadow: `0 0 0 2px ${view.cardHoverGlowColor}${opacity}`,
        transition: baseTransition,
      };
    }
    case "tilt":
      return {
        transform: `perspective(1000px) rotateX(${view.cardHoverTilt}deg) rotateY(${view.cardHoverTilt}deg)`,
        transition: baseTransition,
        zIndex: 10,
      };
    default:
      return {};
  }
}

export function getImageHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.imageHovered || view.imageHoverEffect === "none") {
    return {};
  }

  switch (view.imageHoverEffect) {
    case "zoom":
      return {
        transform: `scale(${view.imageHoverZoom})`,
        transition: `transform ${view.imageHoverDuration}s ease`,
      };
    case "fade":
      return {
        opacity: 0.7,
        transition: `opacity ${view.imageHoverDuration}s ease`,
      };
    case "grayscale":
      return {
        filter: `grayscale(${view.imageHoverGrayscale}%)`,
        transition: `filter ${view.imageHoverDuration}s ease`,
      };
    case "brighten":
      return {
        filter: `brightness(${view.imageHoverBrightness})`,
        transition: `filter ${view.imageHoverDuration}s ease`,
      };
    default:
      return {};
  }
}

export function getIconHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.iconHovered || view.iconHoverEffect === "none") {
    return {};
  }

  switch (view.iconHoverEffect) {
    case "scale":
      return {
        transform: `scale(${view.iconHoverScale})`,
        transition: `transform ${view.iconHoverDuration}s ease`,
      };
    case "color":
      return {
        color: view.iconHoverColor,
        backgroundColor: view.iconBgHoverColor,
        transition: `all ${view.iconHoverDuration}s ease`,
      };
    case "bounce":
      return {
        animation: `bounce ${view.iconHoverDuration}s ease infinite`,
      };
    case "rotate":
      return {
        transform: "rotate(360deg)",
        transition: `transform ${view.iconHoverDuration}s ease`,
      };
    default:
      return {};
  }
}

export function getButtonHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.buttonHovered || view.buttonHoverEffect === "none") {
    return {};
  }

  switch (view.buttonHoverEffect) {
    case "scale":
      return {
        transform: "scale(1.05)",
        transition: "transform 0.2s ease",
      };
    case "glow":
      return {
        boxShadow: `0 0 15px ${view.buttonHoverColor || view.buttonColor}80`,
        transition: "box-shadow 0.2s ease",
      };
    case "slide":
      return {
        transform: "translateX(5px)",
        transition: "transform 0.2s ease",
      };
    case "bounce":
      return {
        transform: "translateY(-2px)",
        transition: "transform 0.2s ease",
      };
    case "shine":
      return {
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        backgroundSize: "200% 100%",
        animation: "shine 1.5s ease",
      };
    default:
      return {};
  }
}

export function getTitleHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.titleHovered || view.titleHoverEffect === "none") {
    return {};
  }

  switch (view.titleHoverEffect) {
    case "color":
      return {
        color: view.cardHoverGlowColor || "#3b82f6",
        transition: "color 0.3s ease",
      };
    case "underline":
      return {
        textDecoration: "underline",
        transition: "text-decoration 0.3s ease",
      };
    case "scale":
      return {
        transform: "scale(1.02)",
        transition: "transform 0.3s ease",
      };
    default:
      return {};
  }
}

export function getSubtitleHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.subtitleHovered || view.subtitleHoverEffect === "none") {
    return {};
  }

  switch (view.subtitleHoverEffect) {
    case "color":
      return {
        color: view.cardHoverGlowColor || "#3b82f6",
        transition: "color 0.3s ease",
      };
    case "italic":
      return {
        fontStyle: "italic",
        transition: "font-style 0.3s ease",
      };
    default:
      return {};
  }
}

export function getDescriptionHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.descriptionHovered || view.descriptionHoverEffect === "none") {
    return {};
  }

  switch (view.descriptionHoverEffect) {
    case "color":
      return {
        color: view.cardHoverGlowColor || "#3b82f6",
        transition: "color 0.3s ease",
      };
    case "opacity":
      return {
        opacity: 0.8,
        transition: "opacity 0.3s ease",
      };
    default:
      return {};
  }
}

export function getBadgeHoverStyle(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  if (!state.badgeHovered || view.badgeHoverEffect === "none") {
    return {};
  }

  switch (view.badgeHoverEffect) {
    case "scale":
      return {
        transform: "scale(1.1)",
        transition: "transform 0.2s ease",
      };
    case "glow":
      return {
        boxShadow: `0 0 10px ${view.badgeColor}80`,
        transition: "box-shadow 0.2s ease",
      };
    default:
      return {};
  }
}

export function getShadowValue(view: AdvancedCardViewModel, state: AdvancedCardRenderState) {
  if (state.isHovered && view.cardHoverShadow !== "none") {
    return getCardHoverShadow(view);
  }

  switch (view.shadow) {
    case "none":
      return "none";
    case "sm":
      return "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    case "md":
      return "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    case "lg":
      return "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    case "xl":
      return "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    default:
      return "none";
  }
}

export function getImageShadow(view: AdvancedCardViewModel) {
  switch (view.imageShadow) {
    case "none":
      return "none";
    case "sm":
      return "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    case "md":
      return "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    case "lg":
      return "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
    default:
      return "none";
  }
}

export function getBadgeBorderRadius(view: AdvancedCardViewModel) {
  switch (view.badgeShape) {
    case "pill":
      return "9999px";
    case "rounded":
      return "8px";
    case "square":
      return "0px";
    default:
      return "8px";
  }
}

export function getButtonStyles(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    transition: `all ${view.transitionDuration}s ease`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    border: "none",
    fontWeight: "600",
    textDecoration: "none",
    fontFamily: "inherit",
    ...getButtonHoverStyle(view, state),
  };

  switch (view.buttonSize) {
    case "sm":
      baseStyle.padding = "6px 12px";
      baseStyle.fontSize = "14px";
      break;
    case "md":
      baseStyle.padding = "10px 20px";
      baseStyle.fontSize = "16px";
      break;
    case "lg":
      baseStyle.padding = "14px 28px";
      baseStyle.fontSize = "18px";
      break;
    case "xl":
      baseStyle.padding = "18px 36px";
      baseStyle.fontSize = "20px";
      break;
  }

  switch (view.buttonStyle) {
    case "primary":
      baseStyle.backgroundColor = view.buttonColor;
      baseStyle.color = view.buttonTextColor;
      break;
    case "secondary":
      baseStyle.backgroundColor = "#6b7280";
      baseStyle.color = "#ffffff";
      break;
    case "outline":
      baseStyle.backgroundColor = "transparent";
      baseStyle.color = view.buttonColor;
      baseStyle.border = `2px solid ${view.buttonColor}`;
      break;
    case "ghost":
      baseStyle.backgroundColor = "transparent";
      baseStyle.color = view.buttonColor;
      break;
    case "gradient":
      baseStyle.background = `linear-gradient(135deg, ${view.buttonColor}, ${view.buttonHoverColor || "#2563eb"})`;
      baseStyle.color = view.buttonTextColor;
      break;
    case "glass":
      baseStyle.backgroundColor = "rgba(255, 255, 255, 0.1)";
      baseStyle.color = view.buttonTextColor || view.buttonColor;
      baseStyle.backdropFilter = "blur(10px)";
      baseStyle.border = "1px solid rgba(255, 255, 255, 0.2)";
      break;
    case "3d":
      baseStyle.backgroundColor = view.buttonColor;
      baseStyle.color = view.buttonTextColor;
      baseStyle.boxShadow = `0 4px 0 ${view.buttonHoverColor || "#2563eb"}, 0 6px 10px rgba(0,0,0,0.2)`;
      baseStyle.transform = "translateY(0)";
      break;
    case "rounded-full":
      baseStyle.backgroundColor = view.buttonColor;
      baseStyle.color = view.buttonTextColor;
      baseStyle.borderRadius = "9999px";
      break;
  }

  if (view.buttonFullWidth || view.buttonAlignment === "full-width") {
    baseStyle.width = "100%";
    baseStyle.display = "block";
    baseStyle.textAlign = "center";
  }

  if (view.buttonStyle !== "rounded-full") {
    baseStyle.borderRadius = `${view.buttonRadius}px`;
  }

  return baseStyle;
}

export function getVisualPosition(view: AdvancedCardViewModel, imageError: boolean) {
  if (view.showImage && view.image && !imageError) {
    return view.imagePosition;
  }

  if (view.showIcon) {
    return view.iconPosition;
  }

  return "top";
}

export function getFlipContainerStyles(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  return {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transition: `transform ${view.flipDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: state.isFlipped
      ? view.flipDirection === "horizontal"
        ? "rotateY(180deg)"
        : "rotateX(180deg)"
      : "none",
  };
}

export function getFrontSideStyles(view: AdvancedCardViewModel): React.CSSProperties {
  return {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    backgroundColor: view.backgroundColor,
    borderRadius: `${view.borderRadius}px`,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: `background-color ${view.flipDuration}s ease, transform ${view.flipDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
  };
}

export function getBackSideStyles(view: AdvancedCardViewModel): React.CSSProperties {
  return {
    width: "100%",
    height: "100%",
    position: "absolute",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    backgroundColor: view.backgroundColor,
    borderRadius: `${view.borderRadius}px`,
    transform: view.flipDirection === "horizontal" ? "rotateY(180deg)" : "rotateX(180deg)",
    overflow: "auto",
    padding: `${view.padding}px`,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: `background-color ${view.flipDuration}s ease, transform ${view.flipDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
  };
}

export function getBaseCardStyles(view: AdvancedCardViewModel, state: AdvancedCardRenderState): React.CSSProperties {
  return {
    backgroundColor: view.enableFlip ? "transparent" : view.backgroundColor,
    border: view.enableFlip && state.isFlipped ? "none" : `${view.borderWidth}px solid ${view.borderColor}`,
    borderRadius: `${view.borderRadius}px`,
    padding: view.enableFlip ? "0px" : `${view.padding}px`,
    margin: view.margin,
    width: "100%",
    maxWidth: "100%",
    height: view.enableFlip ? "300px" : view.height === "auto" ? "auto" : view.height,
    minHeight: view.enableFlip ? "300px" : undefined,
    boxShadow: getShadowValue(view, state),
    transition: `all ${view.transitionDuration}s ease`,
    opacity: view.visible ? 1 : 0.5,
    cursor: view.onClick || (view.enableFlip && view.flipOn === "click") ? "pointer" : "default",
    position: "relative",
    overflow: "hidden",
    perspective: view.enableFlip ? `${view.flipPerspective}px` : "none",
    ...getCardHoverStyle(view, state),
  };
}

export function getAnimationStyles(view: AdvancedCardViewModel): React.CSSProperties {
  const animationStyles: React.CSSProperties = {};

  if (view.animationType !== "none") {
    animationStyles.animation = `${view.animationType} ${view.transitionDuration}s ease ${view.animationDelay}ms`;
  }

  return animationStyles;
}
