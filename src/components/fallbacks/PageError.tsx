"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";

interface Props {
  error: Error;
}

const PageError = ({ error }: Props) => {
  return (
    <div className="flex mx-auto">
      <Alert className="bg-destructive/10 border-none">
        <OctagonAlertIcon className="size-4 !text-destructive" />
        <AlertTitle>{error.message}</AlertTitle>
      </Alert>
    </div>
  );
};

export default PageError;
