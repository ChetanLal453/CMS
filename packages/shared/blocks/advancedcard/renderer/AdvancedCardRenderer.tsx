/** @jsxRuntime classic */
"use client";

import React from "react";
import type { AdvancedCard } from "../types";
import type { AdvancedCardViewModel } from "../viewModel";
import { ensureAdvancedCardStyles, type AdvancedCardIconSet, type AdvancedCardRenderState } from "./helpers";
import BlogCard from "./components/BlogCard";
import CardShell from "./components/CardShell";
import DefaultCard from "./components/DefaultCard";
import FeatureCard from "./components/FeatureCard";
import FlipCard from "./components/FlipCard";

export interface AdvancedCardRendererProps {
  card: AdvancedCard;
  view: AdvancedCardViewModel;
  iconSet?: AdvancedCardIconSet;
}

export default function AdvancedCardRenderer({ card, view, iconSet }: AdvancedCardRendererProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [buttonHovered, setButtonHovered] = React.useState(false);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [imageHovered, setImageHovered] = React.useState(false);
  const [badgeHovered, setBadgeHovered] = React.useState(false);
  const [iconHovered, setIconHovered] = React.useState(false);
  const [titleHovered, setTitleHovered] = React.useState(false);
  const [subtitleHovered, setSubtitleHovered] = React.useState(false);
  const [descriptionHovered, setDescriptionHovered] = React.useState(false);

  const state: AdvancedCardRenderState = {
    isHovered,
    imageError,
    buttonHovered,
    isFlipped,
    imageHovered,
    badgeHovered,
    iconHovered,
    titleHovered,
    subtitleHovered,
    descriptionHovered,
  };

  React.useEffect(() => {
    ensureAdvancedCardStyles();
  }, []);

  React.useEffect(() => {
    setImageError(false);
  }, [view.image]);

  const handleCardMouseEnter = () => {
    setIsHovered(true);
    view.onMouseEnter?.();

    if (view.enableFlip && view.flipOn === "hover" && !isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleCardMouseLeave = () => {
    setIsHovered(false);
    view.onMouseLeave?.();

    if (view.enableFlip && view.flipOn === "hover" && isFlipped) {
      setIsFlipped(false);
    }
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (view.enableFlip && view.flipOn === "click") {
      event.stopPropagation();
      setIsFlipped((current) => !current);
      return;
    }

    view.onClick?.();
  };

  const sharedProps = {
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
  };

  const effectiveVariant = card.interaction.flip.enabled ? "flip" : card.variant;

  let renderer: React.ReactNode;

  switch (effectiveVariant) {
    case "blog":
      renderer = <BlogCard {...sharedProps} />;
      break;
    case "feature":
      renderer = <FeatureCard {...sharedProps} />;
      break;
    case "flip":
      renderer = <FlipCard {...sharedProps} />;
      break;
    case "default":
    default:
      renderer = <DefaultCard {...sharedProps} />;
      break;
  }

  return (
    <CardShell
      view={view}
      state={state}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      onClick={handleCardClick}
    >
      {renderer}
    </CardShell>
  );
}
