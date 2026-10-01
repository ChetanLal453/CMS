/** @jsxRuntime classic */
"use client";

import React from "react";
import type { ComponentProps } from "react";
import DefaultCard from "./DefaultCard";

export default function FeatureCard(props: ComponentProps<typeof DefaultCard>) {
  return <DefaultCard {...props} />;
}
