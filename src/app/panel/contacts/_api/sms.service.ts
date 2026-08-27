import {
  smsContactsResponseSchema,
  smsGroupsResponseSchema,
  smsHistoryResponseSchema,
  smsSendResponseSchema,
  smsTemplatesResponseSchema,
  type SmsFormValues,
} from "@/app/panel/contacts/_schemas/sms.schema";
import { getValidated, postValidated } from "@/lib/api/http-client";
import { normalizedText, positiveInteger } from "@/lib/api/query-params";

const endpoints = {
  send: "/api/site3/sms/send",
  groups: "/api/site3/sms/groups",
  contacts: "/api/site3/sms/contacts",
  templates: "/api/site3/sms/templates",
  history: "/api/site3/sms",
} as const;

export function getSmsGroups(signal?: AbortSignal) {
  return getValidated(endpoints.groups, smsGroupsResponseSchema, { signal });
}

export function searchSmsContacts(query: string, signal?: AbortSignal) {
  return getValidated(endpoints.contacts, smsContactsResponseSchema, {
    params: { q: normalizedText(query) },
    signal,
  });
}

export function getSmsTemplates(signal?: AbortSignal) {
  return getValidated(endpoints.templates, smsTemplatesResponseSchema, { signal });
}

export function getSmsHistory(page = 1, signal?: AbortSignal) {
  return getValidated(endpoints.history, smsHistoryResponseSchema, {
    params: { page: positiveInteger(page) ?? 1 },
    signal,
  });
}

/**
 * Reaches real phones. `mode` decides which of `mobile` and `groups` the API
 * reads, so the other is sent as null rather than left over from a previous
 * choice in the form.
 */
export function sendSms(values: SmsFormValues) {
  return postValidated(endpoints.send, smsSendResponseSchema, {
    text: values.text.trim(),
    mode: values.mode,
    mobile: values.mode === "person" ? (values.mobile ?? null) : null,
    groups: values.mode === "group" ? values.groups : [],
  });
}
