import { z } from "zod";

const optionSchema = z.object({
  value: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
});

/**
 * The submit form is described by the API rather than hard-coded: eighteen
 * option fields, nine numeric ones, and the district list for the caller's
 * city. Rendering from this keeps the form in step with the backend instead of
 * drifting from it.
 */
export const formOptionsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    deal_types: z.array(optionSchema).default([]),
    estate_types: z.array(optionSchema).default([]),
    city: z
      .object({
        id: z.number().int(),
        name: z.string(),
        name_en: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    districts: z.array(optionSchema).default([]),
    streets: z.array(optionSchema).default([]),
    fields: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          /** True for the chip-style fields such as facilities. */
          multiple: z.boolean().default(false),
          options: z.array(optionSchema).default([]),
        }),
      )
      .default([]),
    numeric_fields: z.array(z.string()).default([]),
    limits: z
      .object({
        max_images: z.number().int().positive().default(30),
      })
      .nullable()
      .optional(),
  }),
});

export const checkDuplicateResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .object({
      total: z.number().int().nonnegative().default(0),
      items: z
        .array(
          z.object({
            id: z.number().int(),
            title: z.string().nullable().optional(),
            deal_type: z.number().int().nullable().optional(),
            estate_type_label: z.string().nullable().optional(),
            area: z.number().nullable().optional(),
            url: z.string().nullable().optional(),
          }),
        )
        .default([]),
    })
    .nullable()
    .optional(),
});

export const uploadMediaResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    url: z.string().nullable().optional(),
  }),
});

export const createEstateResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    /** 0 means it waits for review before appearing publicly. */
    visibility: z.number().int().default(0),
    is_public: z.boolean().default(false),
    image_count: z.number().int().nonnegative().default(0),
    url: z.string().nullable().optional(),
  }),
});

/* --------------------------------------------------------------------- form */

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

/**
 * Only what the API requires is required here. Everything else is optional so
 * a half-known file can still be filed — which is how the paper form works.
 */
export const createEstateFormSchema = z
  .object({
    type: z.string().min(1, "نوع معامله را انتخاب کنید"),
    estate_type: z.string().min(1, "نوع ملک را انتخاب کنید"),
    title: z.string().trim().max(120, "عنوان طولانی است"),
    description: z.string().trim().max(4000, "توضیحات طولانی است"),
    district_id: z.string(),
    address: z.string().trim().max(255),
    owner_name: z.string().trim().max(80),
    phone: digits.pipe(
      z.string().regex(/^09\d{9}$/, "شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود"),
    ),
    phone2: digits.refine(
      (value) => value === "" || /^09\d{9}$/.test(value),
      { message: "شماره دوم معتبر نیست" },
    ),
    area: digits.pipe(
      z.string().regex(/^\d+(\.\d+)?$/, "متراژ را وارد کنید"),
    ),
    price: optionalNumber,
    mortgage: optionalNumber,
    rent: optionalNumber,
    exchange: z.boolean(),
    exchange_comment: z.string().trim().max(255),
    /** Keyed by the field key the API sent; single fields hold one id. */
    fields: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    numbers: z.record(z.string(), z.string()),
    images: z.array(z.number().int()),
    cover_image_id: z.number().int().nullable(),
  })
  .refine(
    (data) =>
      data.type !== "1" || data.price !== "" || data.exchange,
    { path: ["price"], message: "قیمت را وارد کنید یا معاوضه را فعال کنید" },
  )
  .refine((data) => data.type !== "2" || data.mortgage !== "" || data.rent !== "", {
    path: ["mortgage"],
    message: "ودیعه یا اجاره را وارد کنید",
  });

export type FormOptionsResponse = z.infer<typeof formOptionsResponseSchema>;
export type CheckDuplicateResponse = z.infer<typeof checkDuplicateResponseSchema>;
export type CreateEstateFormValues = z.infer<typeof createEstateFormSchema>;
