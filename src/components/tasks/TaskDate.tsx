import { cn } from "@/lib/utils";
import { TaskStatusType } from "@/types";
import { ClassValue } from "clsx";
import { differenceInDays, format, startOfDay } from "date-fns";

interface Props {
  date: string;
  status?: TaskStatusType;
  className?: ClassValue;
  hideDetails?: boolean;
}

const TaskDate = ({ date, className, status, hideDetails = false }: Props) => {
  const today = startOfDay(new Date());
  const endDate = startOfDay(new Date(date));
  const diffInDaysValue = differenceInDays(endDate, today);

  function overdue(value: number) {
    const absoluteValue = Math.abs(value);
    return absoluteValue === 1
      ? `${absoluteValue} day overdue`
      : `${absoluteValue} days overdue`;
  }

  function days(value: number) {
    if (value === 0) return "Submission today";
    if (value === 1) return "Submission tomorrow";
    return `${value} days left`;
  }

  if (status === "Done") {
    return (
      <div className="flex flex-col text-emerald-500 font-medium">
        <span className={cn("truncate", className)}>
          {format(endDate, "PPP")}
        </span>
        {!hideDetails && (
          <span className="text-xs">Completed on {format(endDate, "PPP")}</span>
        )}
      </div>
    );
  }

  const colorClass = cn(
    "flex flex-col text-muted-foreground font-normal",
    diffInDaysValue <= 14 && "text-yellow-500 font-medium",
    diffInDaysValue <= 7 && "text-orange-500 font-medium",
    diffInDaysValue <= 3 && "text-red-600 font-medium",
    diffInDaysValue === 1 && "text-red-600 font-semibold", // tomorrow
    diffInDaysValue === 0 && "text-red-600 font-semibold", // today
    diffInDaysValue < 0 && "text-rose-700 font-semibold" // overdue
  );

  return (
    <div className={colorClass}>
      <span className={cn("truncate", className)}>
        {format(endDate, "PPP")}
      </span>
      {!hideDetails && (
        <span className="text-xs">
          {diffInDaysValue < 0
            ? overdue(diffInDaysValue)
            : days(diffInDaysValue)}
        </span>
      )}
    </div>
  );
};

export default TaskDate;
