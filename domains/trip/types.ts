import type { Season, TravelCompanion } from "@/lib/tripOptions";
import type { DiaryOutfitItem } from "@/domains/calendar/types";

export type Trip = {
  id: string;
  name: string | null;
  start_date: string;
  end_date: string;
  season: Season | null;
  travel_companion: TravelCompanion | null;
};

export type TripDayOutfit = {
  wearLogId: string;
  outfitId: string;
  items: DiaryOutfitItem[];
};

export type TripDetail = {
  trip: Trip;
  days: string[];
  outfitsByDay: Record<string, TripDayOutfit[]>;
};
