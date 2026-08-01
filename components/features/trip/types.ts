import type { Season, TravelCompanion } from "@/lib/tripOptions";
import type { DiaryOutfitItem } from "@/components/features/calendar/types";

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
