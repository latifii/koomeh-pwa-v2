import { z } from "zod";

const optionalNumber = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || !Number.isNaN(Number(value)),
    "مقدار واردشده معتبر نیست",
  );

export const propertyFormSchema = z
  .object({
    title: z.string().trim().min(3, "عنوان آگهی حداقل ۳ حرف باشد"),
    type: z.enum(["sale", "rent"], "نوع معامله را انتخاب کنید"),
    estateType: z.string().min(1, "نوع ملک را انتخاب کنید"),
    ownerName: z.string().trim().min(2, "نام مالک را وارد کنید"),
    phone: z
      .string()
      .trim()
      .regex(/^0?9\d{9}$/, "شماره تماس مالک معتبر نیست"),
    urgent: z.enum(["yes", "no"]),
    area: z
      .string()
      .trim()
      .min(1, "متراژ را وارد کنید")
      .refine((value) => Number(value) > 0, "متراژ باید بیشتر از صفر باشد"),
    frontArea: optionalNumber,
    builtArea: optionalNumber,
    price: optionalNumber,
    mortgage: optionalNumber,
    rent: optionalNumber,
    evacuation: z.enum(["yes", "no"]),
    evacuationDate: z.string(),
    convertible: z.enum(["yes", "no"]),
    exchange: z.enum(["yes", "no"]),
    exchangeComment: z.string(),
    city: z.string().min(1, "شهر را انتخاب کنید"),
    district: z.string().min(1, "محله را انتخاب کنید"),
    street: z.string().min(1, "خیابان را وارد کنید"),
    address: z.string().trim().min(8, "آدرس کامل را وارد کنید"),
    buildingName: z.string(),
    unitNo: z.string(),
    latitude: optionalNumber,
    longitude: optionalNumber,
    floorCount: z.string(),
    roomCount: z.string(),
    floor: z.string(),
    unitInFloor: z.string(),
    usageType: z.string(),
    documentType: z.string(),
    builtYear: z.string(),
    buildLicense: z.string(),
    geography: z.string(),
    residenceType: z.string(),
    structureType: z.string(),
    buildDensity: z.string(),
    facilities: z.array(z.string()),
    conditions: z.array(z.string()),
    kitchen: z.array(z.string()),
    heatingCooling: z.array(z.string()),
    wc: z.string(),
    description: z.string().trim().min(20, "توضیحات ملک حداقل ۲۰ حرف باشد"),
    images: z.any().optional(),
    vrhouse: z.string().url("لینک تور مجازی معتبر نیست").or(z.literal("")),
    video: z.string().url("لینک ویدئو معتبر نیست").or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.type === "sale" && data.price.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "قیمت کل را وارد کنید",
      });
    }
    if (
      data.type === "rent" &&
      data.mortgage.trim() === "" &&
      data.rent.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["rent"],
        message: "حداقل یکی از مبلغ رهن یا اجاره را وارد کنید",
      });
    }
  });

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const propertyFormDefaults: PropertyFormValues = {
  title: "",
  type: "sale",
  estateType: "",
  ownerName: "",
  phone: "",
  urgent: "no",
  area: "",
  frontArea: "",
  builtArea: "",
  price: "",
  mortgage: "",
  rent: "",
  evacuation: "no",
  evacuationDate: "",
  convertible: "no",
  exchange: "no",
  exchangeComment: "",
  city: "qom",
  district: "",
  street: "",
  address: "",
  buildingName: "",
  unitNo: "",
  latitude: "",
  longitude: "",
  floorCount: "",
  roomCount: "",
  floor: "",
  unitInFloor: "",
  usageType: "residential",
  documentType: "",
  builtYear: "",
  buildLicense: "",
  geography: "urban",
  residenceType: "vacant",
  structureType: "concrete",
  buildDensity: "",
  facilities: [],
  conditions: [],
  kitchen: [],
  heatingCooling: [],
  wc: "iranian",
  description: "",
  images: undefined,
  vrhouse: "",
  video: "",
};
