"use client";

import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { useCreateProjectModal } from "@/hooks/useCreateProjectModal";
import ProjectForm from "./ProjectForm";

const CreateProjectModal = () => {
  const { isOpen, setIsOpen, close } = useCreateProjectModal();

  return (
    <ResponsiveDialog
      title="Create Project"
      description="Create a new project to get started"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ProjectForm
        onSuccess={close}
        onCancel={close}
      />
    </ResponsiveDialog>
  );
};

export default CreateProjectModal;
