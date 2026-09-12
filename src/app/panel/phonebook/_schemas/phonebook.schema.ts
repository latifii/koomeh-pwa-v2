import { z } from "zod";

/**
 * The agent's phonebook — the old site's `/profile/phonebook`.
 *
 * Four sources behind one search box, as the old page had four tabs: the
 * office's own contacts, the owners of listed files, customers, and colleagues.
 * The API returns every source in the same row shape, so one list renders all
 * four; only `phonebook` rows can be edited or deleted, and only by whoever
 * made them (or an administrator).
 *
 * Not the SMS module: that is `/panel/contacts`, administrators only. This is
 * the book itself.
 */

export const PHONEBOOK_SOURCES = ["phonebook", "estate", "customer", "user"] as const;
export type PhonebookSource = (typeof PHONEBOOK_SOURCES)[number];

export const PHONEBOOK_SOURCE_LABELS: Record<PhonebookSource, string> = {
  phonebook: "مخاطبان",
  estate: "مالکان فایل‌ها",
  customer: "مشتریان",
  user: "همکاران",
};

const groupSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  color: z.string().default("#1f3352"),
});

export const phonebookEntrySchema = z.object({
  id: z.number().int(),
  source: z.enum(PHONEBOOK_SOURCES),
  name: z.string(),
  /** Null when the file's access rule keeps the owner's number from this user. */
  phone: z.string().nullable().optional(),
  other_phones: z.array(z.string()).default([]),
  subtitle: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  private: z.boolean().default(false),
  mine: z.boolean().default(false),
  can_edit: z.boolean().default(false),
  /** Jalali `Y-m-d`. */
  birthdate: z.string().nullable().optional(),
  groups: z.array(groupSchema).default([]),
  /** The old site's path; this app builds its own link from source + id. */
  url: z.string().nullable().optional(),
});

export const phonebookResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    source: z.enum(PHONEBOOK_SOURCES),
    items: z.array(phonebookEntrySchema).default([]),
    meta: z
      .object({
        page: z.number().int().default(1),
        per_page: z.number().int().default(20),
        total: z.number().int().nonnegative().default(0),
        last_page: z.number().int().nonnegative().default(1),
      })
      .default({ page: 1, per_page: 20, total: 0, last_page: 1 }),
    /** Every source's count for the same search — the tab badges. */
    counts: z.record(z.string(), z.number().int().nonnegative()).default({}),
    can_manage_groups: z.boolean().default(false),
  }),
});

export const phonebookGroupsResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .array(groupSchema.extend({ members_count: z.number().int().nonnegative().default(0) }))
    .default([]),
});

export const phonebookEntryResponseSchema = z.object({
  status: z.literal("success"),
  result: phonebookEntrySchema,
});

export type PhonebookEntry = z.infer<typeof phonebookEntrySchema>;
export type PhonebookGroup = z.infer<typeof phonebookGroupsResponseSchema>["result"][number];

export type PhonebookFilters = {
  source: PhonebookSource;
  q: string;
  /** «فقط مخاطبان خصوصی من» — only meaningful on the phonebook source. */
  private: boolean;
  group: string;
};

export const defaultPhonebookFilters: PhonebookFilters = {
  source: "phonebook",
  q: "",
  private: false,
  group: "",
};

/** Digits, spaces, dashes, parentheses and a leading plus — what people type. */
const PHONE_INPUT = /^\+?[\d\s\-()۰-۹٠-٩]{3,25}$/;

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "برای این مخاطب نامی بنویسید").max(255, "نام بیش از حد بلند است"),
  phone: z
    .string()
    .trim()
    .min(1, "شماره تلفن را وارد کنید")
    .regex(PHONE_INPUT, "شماره تلفن معتبر نیست"),
  /** One per line; the service splits them. */
  other_phones: z.string().trim().max(300, "شماره‌های اضافه بیش از حد است"),
  description: z.string().trim().max(1000, "توضیحات بیش از حد بلند است"),
  private: z.boolean(),
  birthdate: z.string().trim(),
  group_ids: z.array(z.string()),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const emptyContactForm: ContactFormValues = {
  name: "",
  phone: "",
  other_phones: "",
  description: "",
  private: false,
  birthdate: "",
  group_ids: [],
};
