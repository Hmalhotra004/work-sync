"use client";

import ResponsiveDialog from "@/components/ui/responsive-dialog";
import { useCreateTaskModal } from "@/hooks/useCreateTaskModal";
import TaskForm from "./TaskForm";

const CreateTaskModal = () => {
  const { isOpen, setIsOpen, close } = useCreateTaskModal();

  return (
    <ResponsiveDialog
      title="Create Task"
      description="Create a new task"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <TaskForm
        onSuccess={close}
        onCancel={close}
      />
    </ResponsiveDialog>
  );
};

export default CreateTaskModal;
