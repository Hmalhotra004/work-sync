"use client";

import KanbanCard from "@/components/kanban/KanbanCard";
import KanbanColumnHeader from "@/components/kanban/KanbanColumnHeader";
import { TaskGetManyType, TaskStatusEnum, TaskStatusType } from "@/types";
import { useCallback, useState } from "react";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

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

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceStatus = source.droppableId as TaskStatusType;
    const destinationStatus = destination.droppableId as TaskStatusType;

    let updatesPayload: {
      id: string;
      status: TaskStatusType;
      position: number;
    }[];

    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };

      // Safely remove the task from source column
      const sourceColumn = [...newTasks[sourceStatus]];
      const [movedTask] = sourceColumn.splice(source.index, 1);

      // If there is not moved task ,return the previous state
      if (!movedTask) {
        console.error("No task found at the source index");
        return prevTasks;
      }

      // create new task with potentially updated status
      const updatedMovedTask =
        sourceStatus !== destinationStatus
          ? { ...movedTask, status: destinationStatus }
          : movedTask;

      // update the column
      newTasks[sourceStatus] = sourceColumn;

      // add the task to destination column
      const destColumn = [...newTasks[destinationStatus]];
      destColumn.splice(destination.index, 0, updatedMovedTask);
      newTasks[destinationStatus] = destColumn;

      // prepare minimal update payloads
      updatesPayload = [];

      // always update the moved task
      updatesPayload.push({
        id: updatedMovedTask.id,
        status: destinationStatus,
        position: Math.min((destination.index + 1) * 1000, 1_000_000),
      });

      // update positions for affected destination column
      newTasks[destinationStatus].forEach((task, idx) => {
        if (task && task.id !== updatedMovedTask.id) {
          const newPosition = Math.min((idx + 1) * 1000, 1_000_000);

          if (task.position !== newPosition) {
            updatesPayload.push({
              id: task.id,
              status: destinationStatus,
              position: newPosition,
            });
          }
        }
      });

      // If the task  moved between columns, update positions in the source column
      if (sourceStatus !== destinationStatus) {
        newTasks[sourceStatus].forEach((task, idx) => {
          if (task) {
            const newPosition = Math.min((idx + 1) * 1000, 1_000_000);

            if (task.position !== newPosition) {
              updatesPayload.push({
                id: task.id,
                status: sourceStatus,
                position: newPosition,
              });
            }
          }
        });
      }

      return newTasks;
    });
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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

              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    className="min-h-[250px] p-y-1.5"
                    {...provided.droppableProps}
                  >
                    {tasks[board].map((task, idx) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={idx}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default DataKanban;
