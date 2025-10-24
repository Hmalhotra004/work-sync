import DottedSeparator from "@/components/DottedSeparator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTaskModal } from "@/hooks/useCreateTaskModal";
import { PlusIcon } from "lucide-react";

const TasksSwitcher = () => {
  const { open } = useCreateTaskModal();

  const tabs = [
    {
      label: "Table",
      value: "table",
    },
    {
      label: "Kanban",
      value: "kanban",
    },
    {
      label: "Calender",
      value: "calender",
    },
  ];

  return (
    <Tabs
      className="flex-1 w-full border rounded-lg"
      defaultValue="table"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            {tabs.map((t, idx) => (
              <TabsTrigger
                key={idx}
                className="h-8 w-full lg:w-auto"
                value={t.value}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="sm"
            className="w-full lg:w-auto"
            onClick={open}
          >
            <PlusIcon className="size-4" /> New
          </Button>
        </div>

        <DottedSeparator className="my-4" />

        <h1>filters</h1>

        <DottedSeparator className="my-4" />

        <>
          <TabsContent
            value="table"
            className="mt-0"
          >
            Tabel
          </TabsContent>

          <TabsContent
            value="kanban"
            className="mt-0"
          >
            kanban
          </TabsContent>

          <TabsContent
            value="calender"
            className="mt-0"
          >
            Ch
          </TabsContent>
        </>
      </div>
    </Tabs>
  );
};

export default TasksSwitcher;
