"use client";

import React from "react";
import * as FaIcons from "react-icons/fa";
import type { AdvancedCardComponentProps } from "./cardModel";
import type { AdvancedCard } from "@uadmin/shared/blocks/advancedcard/types";
import type { AdvancedCardViewModel } from "@uadmin/shared/blocks/advancedcard/viewModel";
import AdvancedCardRenderer from "@uadmin/shared/blocks/advancedcard/renderer/AdvancedCardRenderer";
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

const AdvancedCardInner: React.FC<{
  sharedViewModel: {
    card: AdvancedCard;
    view: AdvancedCardViewModel;
  };
  onClick?: AdvancedCardComponentProps['onClick'];
  onMouseEnter?: AdvancedCardComponentProps['onMouseEnter'];
  onMouseLeave?: AdvancedCardComponentProps['onMouseLeave'];
}> = ({ sharedViewModel, onClick, onMouseEnter, onMouseLeave }) => {
  const card = React.useMemo(() => sharedViewModel.card, [sharedViewModel.card]);
  const view = React.useMemo(
    () => ({
      ...sharedViewModel.view,
      onClick,
      onMouseEnter,
      onMouseLeave,
    }),
    [onClick, onMouseEnter, onMouseLeave, sharedViewModel.view],
  );

  return <AdvancedCardRenderer card={card} view={view} iconSet={FaIcons} />;
};

const AdvancedCardComponent: React.FC<FrontendAdvancedCardProps> = (props) => {
  const sharedViewModel = props.__sharedViewModel ?? null;

  if (!sharedViewModel) {
    return reportCmsBoundaryViolation("advancedcard", "Missing required shared view model.");
  }

  return (
    <AdvancedCardInner
      sharedViewModel={sharedViewModel}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    />
  );
};

export default AdvancedCardComponent;
