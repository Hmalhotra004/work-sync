"use client";

import AlertError from "@/components/alert-error";

interface Props {
  error: Error;
}

const PageError = ({ error }: Props) => {
  return (
    <div className="flex mx-auto">
      <AlertError error={error.message} />
    </div>
  );
};

export default PageError;
