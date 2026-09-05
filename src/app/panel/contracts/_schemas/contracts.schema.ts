import { z } from "zod";

import {
  metaSchema,
  optionSchema,
} from "@/app/panel/_admin/_schemas/admin-lists.schema";

const partySchema = z
  .object({
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    national_id: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    id_card: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const contractExpertSchema = z.object({
  id: z.number().int(),
  /** Which side of the deal this agent worked. */
  type: z.number().int().nullable().optional(),
  commission: z.number().nullable().optional(),
  expert: z
    .object({ id: z.number().int(), name: z.string().nullable().optional() })
    .nullable()
    .optional(),
});

export const contractRowSchema = z.object({
  id: z.number().int(),
  contractid: z.string().nullable().optional(),
  type: z.number().int().nullable().optional(),
  estate_type: z.number().int().nullable().optional(),
  seller: partySchema,
  buyer: partySchema,
  address: z.string().nullable().optional(),
  estate_id: z.number().int().nullable().optional(),
  amounts: z
    .object({
      price: z.number().nullable().optional(),
      mortgage: z.number().nullable().optional(),
      rent: z.number().nullable().optional(),
      commission: z.number().nullable().optional(),
    })
    .default({}),
  experts: z.array(contractExpertSchema).default([]),
  register_at: z.string().nullable().optional(),
  register_at_jalali: z.string().nullable().optional(),
});

export const contractDetailSchema = contractRowSchema.extend({
  description: z.string().nullable().optional(),
  tracking_code: z.string().nullable().optional(),
  has_vat: z.boolean().default(false),
  registry_office_date: z.string().nullable().optional(),
  delivery_date: z.string().nullable().optional(),
  registered_by: z
    .object({ id: z.number().int(), name: z.string().nullable().optional() })
    .nullable()
    .optional(),
  documents: z
    .array(
      z.object({
        id: z.number().int(),
        url: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
      }),
    )
    .default([]),
  /** The commission split, as the backend worked it out. */
  earnings: z.array(z.record(z.string(), z.unknown())).default([]),
  earning_totals: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).default([]),
});

export const contractsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(contractRowSchema).default([]),
    meta: metaSchema,
  }),
});

export const contractResponseSchema = z.object({
  status: z.literal("success"),
  result: contractDetailSchema,
});

export const contractFiltersResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    agents: z.array(optionSchema).default([]),
    estate_types: z.array(optionSchema).default([]),
    deal_types: z.array(optionSchema).default([]),
  }),
});

export const contractSavedResponseSchema = z
  .object({ status: z.string() })
  .passthrough();

export const contractDocumentResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    url: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
  }),
});

export type ContractRow = z.infer<typeof contractRowSchema>;
export type ContractDetail = z.infer<typeof contractDetailSchema>;

export type ContractFilters = {
  contractid: string;
  type: string;
  estate_type: string;
  estate_name: string;
  customer_name: string;
  expert: string;
  create_date_of: string;
  create_date_to: string;
};

export const defaultContractFilters: ContractFilters = {
  contractid: "",
  type: "",
  estate_type: "",
  estate_name: "",
  customer_name: "",
  expert: "",
  create_date_of: "",
  create_date_to: "",
};

/* --------------------------------------------------------------------- form */

export const contractFormSchema = z.object({
  contractid: z.string().trim().max(60),
  type: z.string(),
  estate_type: z.string(),
  estate_id: z.string().trim(),
  estate_name: z.string().trim().max(120),
  estate_phone: z.string().trim().max(30),
  estate_fatherName: z.string().trim().max(120),
  estate_idCard: z.string().trim().max(40),
  estate_nationalId: z.string().trim().max(20),
  estate_address: z.string().trim().max(500),
  customer_id: z.string().trim(),
  customer_name: z.string().trim().max(120),
  customer_phone: z.string().trim().max(30),
  customer_fatherName: z.string().trim().max(120),
  customer_idCard: z.string().trim().max(40),
  customer_nationalId: z.string().trim().max(20),
  total_price: z.string().trim(),
  total_mortgage: z.string().trim(),
  total_rent: z.string().trim(),
  total_commission: z.string().trim(),
  has_vat: z.boolean(),
  description: z.string().trim().max(2000),
  tracking_code: z.string().trim().max(60),
  register_date: z.string().trim(),
  registryofficedate: z.string().trim(),
  deliverydate: z.string().trim(),
  /** One row per agent on the deal: who, which side, what share. */
  experts: z.array(
    z.object({
      expert_id: z.string(),
      type: z.string(),
      commission: z.string(),
    }),
  ),
  documents: z.array(z.number().int()),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;
