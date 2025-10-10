"use client";

import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { useCreateWorkspaceModal } from "@/hooks/useCreateWorkspaceModal";
import WorkspaceForm from "./WorkspaceForm";

const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();

  return (
    <ResponsiveDialog
      title="Create Workspace"
      description="Create a new workspace to get started"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <WorkspaceForm
        onSuccess={close}
        onCancel={close}
      />
    </ResponsiveDialog>
  );
};

export default CreateWorkspaceModal;
