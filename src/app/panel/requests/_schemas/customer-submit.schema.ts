import { z } from "zod";

const optionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
});

/**
 * As with the listing form, the API describes its own fields — fourteen option
 * groups and eight numeric ones — so the form renders what it is told. Some
 * groups come back with no options at all on this installation; those are
 * skipped rather than shown as an empty select.
 */
export const customerFormOptionsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    city: z
      .object({ id: z.number().int(), name: z.string() })
      .nullable()
      .optional(),
    request_types: z.array(optionSchema).default([]),
    estate_types: z.array(optionSchema).default([]),
    statuses: z.array(optionSchema).default([]),
    genders: z.array(optionSchema).default([]),
    districts: z.array(optionSchema).default([]),
    agents: z.array(optionSchema).default([]),
    fields: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          multiple: z.boolean().default(false),
          options: z.array(optionSchema).default([]),
        }),
      )
      .default([]),
    numeric_fields: z.array(z.string()).default([]),
    permissions: z
      .object({ can_assign_agent: z.boolean().default(false) })
      .nullable()
      .optional(),
  }),
});

export const saveCustomerResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .object({
      id: z.number().int().optional(),
      guid: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const customerDuplicateResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .object({
      total: z.number().int().nonnegative().default(0),
      items: z
        .array(
          z.object({
            id: z.number().int(),
            name: z.string().nullable().optional(),
            request_type_label: z.string().nullable().optional(),
          }).loose(),
        )
        .default([]),
    })
    .nullable()
    .optional(),
});

/** Answers for the relation and status actions all share this shape. */
export const customerActionResponseSchema = z.object({
  status: z.string(),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
  message: z.string().nullable().optional(),
});

const PERSIAN_DIGITS = /[۰-۹٠-٩]/g;

function toEnglishDigits(value: string): string {
  return value.replace(PERSIAN_DIGITS, (digit) => {
    const persian = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    return String(persian >= 0 ? persian : "٠١٢٣٤٥٦٧٨٩".indexOf(digit));
  });
}

const digits = z.string().transform((value) => toEnglishDigits(value).trim());

const optionalNumber = digits.refine(
  (value) => value === "" || /^\d+(\.\d+)?$/.test(value),
  { message: "فقط عدد وارد کنید" },
);

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, "نام متقاضی را وارد کنید").max(80),
  mobile: digits.pipe(
    z.string().regex(/^09\d{9}$/, "شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود"),
  ),
  mobile2: digits.refine((value) => value === "" || /^09\d{9}$/.test(value), {
    message: "شماره دوم معتبر نیست",
  }),
  gender: z.string(),
  job: z.string().trim().max(60),
  description: z.string().trim().max(2000),
  note: z.string().trim().max(1000),
  request_type: z.string().min(1, "نوع تقاضا را انتخاب کنید"),
  estate_type: z.string(),
  price_min: optionalNumber,
  price_max: optionalNumber,
  mortgage_min: optionalNumber,
  mortgage_max: optionalNumber,
  rent_min: optionalNumber,
  rent_max: optionalNumber,
  area_min: optionalNumber,
  area_max: optionalNumber,
  districts: z.array(z.string()),
  expert_id: z.string(),
  fields: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  numbers: z.record(z.string(), z.string()),
});

export type CustomerFormOptionsResponse = z.infer<
  typeof customerFormOptionsResponseSchema
>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
