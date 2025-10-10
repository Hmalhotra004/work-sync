import { Button, type buttonVariants } from "@/components/ui/button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { VariantProps } from "class-variance-authority";
import { useState } from "react";

export const useConfirm = (
  title: string,
  message: string,
  variant: VariantProps<typeof buttonVariants>["variant"] = "default"
): [() => React.JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

    const handleClose = () => setPromise(null);

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const confirmationDialog = () => (
    <ResponsiveDialog
      open={promise !== null}
      onOpenChange={handleClose}
      title={title}
      description={message}
    >
      <div className="pt-0 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
        <Button
          variant="outline"
          className="w-full lg:w-auto"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant={variant}
          className="w-full lg:w-auto"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </div>
    </ResponsiveDialog>
  );

  return [confirmationDialog, confirm];
};
