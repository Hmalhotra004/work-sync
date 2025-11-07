import DottedSeparator from "@/components/ui/dotted-separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AnalyticsType } from "@/types";
import AnalyticsCard from "./AnalyticsCard";

interface Props {
  data: AnalyticsType;
}

const Analytics = ({ data }: Props) => {
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total Tasks"
            value={data.taskCount}
            variant={data.taskDifference > 0 ? "UP" : "DOWN"}
            increaseValue={data.taskDifference}
          />

          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskDifference > 0 ? "UP" : "DOWN"}
            increaseValue={data.assignedTaskDifference}
          />

          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.overdueTaskCount}
            variant={data.overdueTaskDifference > 0 ? "UP" : "DOWN"}
            increaseValue={data.overdueTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskDifference > 0 ? "UP" : "DOWN"}
            increaseValue={data.incompleteTaskDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>

        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed Tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskDifference > 0 ? "UP" : "DOWN"}
            increaseValue={data.completedTaskDifference}
          />
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default Analytics;
