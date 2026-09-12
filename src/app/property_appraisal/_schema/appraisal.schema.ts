import { z } from "zod";

export const appraisalSchema = z.object({
  district: z.string().min(1, "محله را انتخاب کنید"),
  propertyType: z.enum(["apartment", "villa", "commercial", "land"]),
  area: z.number().min(20, "متراژ باید حداقل ۲۰ متر باشد").max(5000),
  buildingAge: z.number().min(0).max(100),
  rooms: z.number().min(0).max(10),
  parking: z.boolean(),
  elevator: z.boolean(),
});
export type AppraisalValues = z.infer<typeof appraisalSchema>;
