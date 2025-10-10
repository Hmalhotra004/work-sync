"use client";

import PageError from "@/components/fallbacks/PageError";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: React.ReactNode;
}

export const ErrorBoundaryWrapper = ({ children }: Props) => {
  return (
    <ErrorBoundary FallbackComponent={PageError}>{children}</ErrorBoundary>
  );
};
