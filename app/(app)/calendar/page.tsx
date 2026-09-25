import { Suspense } from "react";
import { CalendarContent } from "@/components/features/calendar/calendar-content";
import { CalendarFallback } from "@/components/features/calendar/calendar-fallback";

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarFallback />}>
      <CalendarContent />
    </Suspense>
  );
}
