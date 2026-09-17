"use client";

import React from "react";
import * as FaIcons from "react-icons/fa";
import type { AdvancedCardComponentProps } from "./cardModel";
import type { AdvancedCard } from "../../../../../shared/blocks/advancedcard/types";
import type { AdvancedCardViewModel } from "../../../../../shared/blocks/advancedcard/viewModel";
import AdvancedCardRenderer from "../../../../../shared/blocks/advancedcard/renderer/AdvancedCardRenderer";
import { reportCmsBoundaryViolation } from "../../../lib/cmsBoundary";

type FrontendAdvancedCardProps = AdvancedCard & Pick<
  AdvancedCardComponentProps,
  "onClick" | "onMouseEnter" | "onMouseLeave"
> & {
  __sharedViewModel?: {
    card: AdvancedCard;
    view: AdvancedCardViewModel;
  };
} & Record<string, unknown>;

const AdvancedCardComponent: React.FC<FrontendAdvancedCardProps> = (props) => {
  const sharedViewModel = props.__sharedViewModel ?? null;

  if (!sharedViewModel) {
    return reportCmsBoundaryViolation("advancedcard", "Missing required shared view model.");
  }

  const card = React.useMemo(() => sharedViewModel.card, [sharedViewModel.card]);
  const view = React.useMemo(
    () => ({
      ...sharedViewModel.view,
      onClick: props.onClick,
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
    }),
    [props.onClick, props.onMouseEnter, props.onMouseLeave, sharedViewModel.view],
  );

  return <AdvancedCardRenderer card={card} view={view} iconSet={FaIcons} />;
};

export default AdvancedCardComponent;
