import { z } from "zod";

export const editTripSchema = z
  .object({
    name: z.string(),
    startDate: z.string().min(1, "Please pick both a start and end date."),
    endDate: z.string().min(1, "Please pick both a start and end date."),
    season: z.string().nullable().optional(),
    companion: z.string().nullable().optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date can't be before the start date.",
      path: ["endDate"],
    },
  );

export type EditTripFormValues = z.infer<typeof editTripSchema>;
