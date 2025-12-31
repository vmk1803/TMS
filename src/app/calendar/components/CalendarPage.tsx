"use client";
import React, { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarMonthView from "./CalendarMonthView";
import CalendarWeekView from "./CalendarWeekView";
import CalendarDayView from "./CalendarDayView";
import Title from "@/components/common/Title";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");

  const goPrev = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(currentDate.getMonth() - 1);
    else if (view === "week") newDate.setDate(currentDate.getDate() - 7);
    else newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(currentDate.getMonth() + 1);
    else if (view === "week") newDate.setDate(currentDate.getDate() + 7);
    else newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-[#F9FAFB]">
        <div className="flex justify-between mb-3">
            <Title
              heading="Calendar"
              subheading="Stay on top of schedules, appointments, and important dates."
            />
            <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                view={view}
                setView={setView}
                goNext={goNext}
                goPrev={goPrev}
            />
        </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        

        <div className="">
          {view === "month" && <CalendarMonthView currentDate={currentDate} />}
          {view === "week" && <CalendarWeekView currentDate={currentDate} />}
          {view === "day" && <CalendarDayView currentDate={currentDate} />}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
