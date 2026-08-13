import { z } from "zod";

const optionalNumber = z
  .string()
  .refine(
    (value) => value === "" || Number(value) >= 0,
    "مقدار واردشده معتبر نیست",
  );

export const customerRequestSchema = z
  .object({
    gender: z.enum(["female", "male"], "جنسیت را انتخاب کنید"),
    name: z.string().trim().min(2, "نام متقاضی را وارد کنید"),
    mobile: z
      .string()
      .trim()
      .regex(/^0?9\d{9}$/, "شماره همراه معتبر نیست"),
    mobile2: z.string().trim(),
    requestType: z.enum(["buy", "rent"], "نوع درخواست را انتخاب کنید"),
    usageType: z.string().min(1, "نوع کاربری را انتخاب کنید"),
    estateType: z.string().min(1, "نوع ملک را انتخاب کنید"),
    status: z.string(),
    grade: z.string().min(1, "درجه متقاضی را انتخاب کنید"),
    country: z.string(),
    language: z.string().min(1, "زبان را انتخاب کنید"),
    city: z.string().min(1, "شهر را انتخاب کنید"),
    areas: z.array(z.string()),
    districts: z.array(z.string()),
    street: z.string(),
    areaMin: z
      .string()
      .min(1, "حداقل متراژ را وارد کنید")
      .refine((value) => Number(value) > 0, "حداقل متراژ معتبر نیست"),
    areaMax: optionalNumber,
    minFloorArea: optionalNumber,
    rentMin: optionalNumber,
    rentMax: optionalNumber,
    priceMin: optionalNumber,
    priceMax: optionalNumber,
    compensation: z.boolean(),
    maxRoomCount: z.string(),
    maxBuildingAge: z.string(),
    condition: z.string(),
    completionDate: z.string(),
    propertyCondition: z.string(),
    purchaseReason: z.string(),
    nearbyFeature: z.boolean(),
    liquidity: z.enum(["full", "partial", "nonCash"]),
    acquaintanceType: z.string(),
    acquaintance: z.string(),
    label: z.string(),
    note: z.string().trim().min(10, "یادداشت درخواست حداقل ۱۰ حرف باشد"),
    resendDate: z.string(),
    resendEnabled: z.boolean(),
    smsCount: z.string(),
    expert: z.string(),
  })
  .refine(
    (data) =>
      data.areaMax === "" || Number(data.areaMax) >= Number(data.areaMin),
    { path: ["areaMax"], message: "حداکثر متراژ باید از حداقل بیشتر باشد" },
  );

export type CustomerRequestValues = z.infer<typeof customerRequestSchema>;

export const customerRequestDefaults: CustomerRequestValues = {
  gender: "male",
  name: "",
  mobile: "",
  mobile2: "",
  requestType: "buy",
  usageType: "residential",
  estateType: "",
  status: "new",
  grade: "normal",
  country: "iran",
  language: "fa",
  city: "qom",
  areas: [],
  districts: [],
  street: "",
  areaMin: "",
  areaMax: "",
  minFloorArea: "",
  rentMin: "",
  rentMax: "",
  priceMin: "",
  priceMax: "",
  compensation: false,
  maxRoomCount: "",
  maxBuildingAge: "",
  condition: "",
  completionDate: "",
  propertyCondition: "",
  purchaseReason: "investment",
  nearbyFeature: false,
  liquidity: "full",
  acquaintanceType: "website",
  acquaintance: "",
  label: "0",
  note: "",
  resendDate: "",
  resendEnabled: false,
  smsCount: "",
  expert: "",
};
