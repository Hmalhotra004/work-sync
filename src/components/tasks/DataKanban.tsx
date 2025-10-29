"use client";

import KanbanColumnHeader from "@/components/kanban/KanbanColumnHeader";
import { TaskGetManyType, TaskStatusEnum, TaskStatusType } from "@/types";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState } from "react";

interface Props {
  data: TaskGetManyType[];
}

const boards: TaskStatusType[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "In Review",
  "Done",
];

type TasksState = {
  [key in TaskStatusEnum]: TaskGetManyType[];
};

const DataKanban = ({ data }: Props) => {
  const [tasks, setTasks] = useState<TasksState>(() => {
    const initialTasks: TasksState = {
      [TaskStatusEnum.Backlog]: [],
      [TaskStatusEnum.Todo]: [],
      [TaskStatusEnum.In_Progress]: [],
      [TaskStatusEnum.In_Review]: [],
      [TaskStatusEnum.Done]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });

    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatusType].sort(
        (a, b) => a.position - b.position
      );
    });

    return initialTasks;
  });

  return (
    <DragDropContext onDragEnd={() => {}}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]"
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default DataKanban;
