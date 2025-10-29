"use client";

import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface Props {
  value: string | undefined;
  onChange: (date: string) => void;
  className?: ClassValue;
  placeholder?: string;
  disabled: boolean;
}

const DatePicker = ({
  disabled,
  onChange,
  value,
  className,
  placeholder,
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger
        asChild
        disabled={disabled}
      >
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => {
            if (date) onChange(date?.toISOString());
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
