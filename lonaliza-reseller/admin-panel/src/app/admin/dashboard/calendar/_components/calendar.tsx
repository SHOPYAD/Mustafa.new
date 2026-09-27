"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoEvents } from "./events-data";

export function Calendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const days = React.useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  const handlePrev = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          <CardTitle className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="size-4" />
          </Button>
          <Button size="sm" className="gap-1 bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-border text-center text-xs font-semibold leading-6">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-muted py-2 text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const dayEvents = (demoEvents || []).filter((e: any) => {
              const d = new Date(e.start);
              return isSameDay(d, day);
            });
            const isCurrent = isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[90px] cursor-pointer bg-card p-2 text-left transition-colors hover:bg-muted/50 ${
                  isCurrent ? "ring-1 ring-primary" : ""
                }`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                    today
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  {dayEvents.slice(0, 2).map((ev: any, i: number) => (
                    <div
                      key={i}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
export default Calendar;
