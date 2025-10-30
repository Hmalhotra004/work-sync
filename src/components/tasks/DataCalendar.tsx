"use client";
import { TaskGetManyType } from "@/types";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import {
  addMonths,
  format,
  getDay,
  parse,
  startOfWeek,
  subMonths,
} from "date-fns";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";
import EventCard from "./EventCard";

interface Props {
  data: TaskGetManyType[];
}

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DataCalendar = ({ data }: Props) => {
  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    id: task.id,
    title: task.name,
    project: {
      id: task.projectId,
      name: task.projectName,
      image: task.projectImage,
    },
    assignee: {
      id: task.assigneeId,
      name: task.assigneeName,
      image: task.assigneeImage,
    },
    status: task.status,
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };

  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      components={{ eventWrapper: ({ event }) => <EventCard data={event} /> }}
    />
  );
};

export default DataCalendar;
