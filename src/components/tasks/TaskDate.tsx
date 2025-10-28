import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { differenceInDays, format } from "date-fns";

interface Props {
  date: string;
  className?: ClassValue;
}

const TaskDate = ({ date, className }: Props) => {
  const today = new Date();
  const endDate = new Date(date);
  const diffInDaysValue = differenceInDays(endDate, today);

  function overdue(value: number) {
    const absoluteValue = Math.abs(value);
    return absoluteValue === 1
      ? `${absoluteValue} day overdue`
      : `${absoluteValue} days overdue`;
  }

  function days(value: number) {
    return value === 1
      ? `${value} day left`
      : value === 0
      ? `Summition Tommorow`
      : `${value} days left`;
  }

  return (
    <div
      className={cn(
        "flex flex-col text-muted-foreground font-normal",
        diffInDaysValue <= 14 && "text-yellow-500 font-medium",
        diffInDaysValue <= 7 && "text-orange-500 font-medium",
        diffInDaysValue <= 3 && "text-red-600 font-medium",
        diffInDaysValue === 0 && "text-red-600 font-semibold"
      )}
    >
      <span className={cn("truncate", className)}>
        {format(endDate, "PPP")}
      </span>
      <span className="text-xs">
        {diffInDaysValue < 0 ? overdue(diffInDaysValue) : days(diffInDaysValue)}
      </span>
    </div>
  );
};

export default TaskDate;
