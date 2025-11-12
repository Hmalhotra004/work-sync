import { TaskStatusEnum } from "@/types";
import { parseAsBoolean, parseAsStringEnum, useQueryState } from "nuqs";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [formStatus, setStatus] = useQueryState(
    "form-status",
    parseAsStringEnum([
      TaskStatusEnum.Backlog,
      TaskStatusEnum.Todo,
      TaskStatusEnum.In_Progress,
      TaskStatusEnum.In_Review,
      TaskStatusEnum.Done,
    ])
      .withDefault(TaskStatusEnum.Todo)
      .withOptions({ clearOnDefault: true })
  );

  const open = (status?: TaskStatusEnum) => {
    if (status) setStatus(status);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setStatus(null);
  };

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    setStatus,
    formStatus,
  };
};
