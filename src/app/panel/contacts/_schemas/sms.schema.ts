import { z } from "zod";

/**
 * The phone book and the SMS log behind it.
 *
 * Sending is admin-only and reaches real phones, so the send form is deliberate
 * about it: the mode is explicit, and a group send reports how many numbers it
 * actually went to rather than implying one message.
 */

export const smsGroupsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string(),
          contacts_count: z.number().int().nonnegative().default(0),
        }),
      )
      .default([]),
  }),
});

export const smsContactsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    limit: z.number().int().positive().default(30),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string().nullable().optional(),
          phone: z.string().nullable().optional(),
          mobile: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const smsTemplatesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z
      .array(
        z.object({
          name: z.string(),
          comment: z.string().nullable().optional(),
          text: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const smsHistoryResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative().default(0),
    page: z.number().int().positive().default(1),
    per_page: z.number().int().positive().default(20),
    last_page: z.number().int().nonnegative().default(1),
    has_more: z.boolean().default(false),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          mobile: z.string().nullable().optional(),
          text: z.string().nullable().optional(),
          type: z.number().int().nullable().optional(),
          type_label: z.string().nullable().optional(),
          created_at: z.string().nullable().optional(),
          created_at_jalali: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export const smsSendResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    sent: z.number().int().nonnegative().default(0),
    /** Contacts in the group that had no usable mobile number. */
    skipped: z.array(z.string()).default([]),
    message: z.string().nullable().optional(),
  }),
});

export const smsFormSchema = z
  .object({
    mode: z.enum(["person", "group"]),
    mobile: z.string().trim().optional(),
    groups: z.array(z.number().int()),
    text: z.string().trim().min(1, "متن پیامک را بنویسید."),
  })
  .refine(
    (values) => values.mode !== "person" || /^09\d{9}$/.test(values.mobile ?? ""),
    { path: ["mobile"], message: "شماره موبایل معتبر نیست." },
  )
  .refine((values) => values.mode !== "group" || values.groups.length > 0, {
    path: ["groups"],
    message: "دست‌کم یک گروه را انتخاب کنید.",
  });

export type SmsFormValues = z.infer<typeof smsFormSchema>;
export type SmsGroup = z.infer<
  typeof smsGroupsResponseSchema
>["result"]["items"][number];
export type SmsTemplate = z.infer<
  typeof smsTemplatesResponseSchema
>["result"]["items"][number];
