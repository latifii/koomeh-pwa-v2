import type {
  MemberDetail,
  MemberFormValues,
} from "@/app/panel/members/_schemas/members.schema";

const text = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

/** Blank when a member is being written from scratch. */
export const emptyMemberForm: MemberFormValues = {
  mode: "create",
  name: "",
  last_name: "",
  username: "",
  password: "",
  roles: [],
  phone: "",
  other_phones: "",
  email: "",
  gender: "",
  branch_id: "",
  city_id: "",
  status: "1",
  title: "",
  description: "",
  districts: [],
  activity_estate_type: [],
};

export function memberFormDefaults(member: MemberDetail): MemberFormValues {
  return {
    mode: "edit",
    name: text(member.name),
    last_name: text(member.last_name),
    username: member.username,
    // Always blank. An empty box is the API's own way of saying "leave the
    // password alone", so anything pre-filled here would change it on save.
    password: "",
    roles: member.roles,
    phone: text(member.phone),
    other_phones: member.other_phones.join("، "),
    email: text(member.email),
    gender: text(member.gender),
    branch_id: text(member.branch_id),
    city_id: text(member.city_id),
    status: text(member.status) || "1",
    title: text(member.title),
    description: text(member.description),
    districts: member.districts.map(String),
    activity_estate_type: member.activity_estate_type.map(String),
  };
}

/** Accepts either comma, since one of them is on the Persian keyboard. */
function phoneList(value: string): string[] {
  return value
    .split(/[،,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * The body for both `POST /admin/users` and `PUT /admin/users/{id}`.
 *
 * Roles go back as the latin slugs the API knows — the Persian titles are only
 * ever a label on this side. Password is the one field that is left out rather
 * than nulled: on an edit its absence means "unchanged", and sending an empty
 * string would be a change.
 */
export function memberRequestBody(
  values: MemberFormValues,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: values.name || null,
    last_name: values.last_name || null,
    username: values.username,
    role: values.roles,
    phone: values.phone || null,
    other_phones: phoneList(values.other_phones),
    email: values.email || null,
    gender: values.gender || null,
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    city_id: values.city_id ? Number(values.city_id) : null,
    status: values.status || null,
    title: values.title || null,
    description: values.description || null,
    districts: values.districts.map(Number),
    activity_estate_type: values.activity_estate_type.map(Number),
  };

  if (values.password) body.password = values.password;

  return body;
}
