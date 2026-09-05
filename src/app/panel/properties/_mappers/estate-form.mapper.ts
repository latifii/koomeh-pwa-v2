import type {
  EstateEditData,
  EstateEditValues,
  EstateFormValues,
  FormOptionsResponse,
} from "@/app/panel/properties/_schemas/estate-submit.schema";

type FormOptions = FormOptionsResponse["result"];

const text = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

/**
 * Zero is what the API stores for "no price". Shown in the field it would read
 * as a listing going for nothing rather than a question nobody answered.
 */
const money = (value: unknown): string =>
  value === 0 || value === "0" ? "" : text(value);

/**
 * Seeds the form from a listing's stored values.
 *
 * Everything the form holds is a string or an array of strings, because that is
 * what a `<select>` and a text input give back; the API's numbers and option
 * ids are converted on the way in and back again on the way out.
 */
export function estateFormDefaults(
  values: EstateEditValues,
  options: FormOptions,
  images: EstateEditData["images"],
): EstateFormValues {
  const fields: Record<string, string | string[]> = {};
  for (const field of options.fields) {
    const current = values[field.key];
    fields[field.key] = field.multiple
      ? Array.isArray(current)
        ? current.map(String)
        : []
      : text(current);
  }

  const numbers: Record<string, string> = {};
  for (const key of options.numeric_fields) {
    // `area` has a field of its own at the top of the form.
    if (key === "area") continue;
    numbers[key] = text(values[key]);
  }

  return {
    type: text(values.type) || "1",
    estate_type: text(values.estate_type),
    title: text(values.title),
    description: text(values.description),
    district_id: text(values.district_id),
    address: text(values.address),
    owner_name: text(values.owner_name),
    phone: text(values.phone),
    phone2: text(values.phone2),
    area: text(values.area),
    price: money(values.price),
    mortgage: money(values.mortgage),
    rent: money(values.rent),
    exchange: Boolean(values.exchange),
    exchange_comment: text(values.exchange_comment),
    fields,
    numbers,
    images: images.map((image) => image.id),
    // Left null when the listing has no cover of its own: picking one for it
    // would be this form quietly changing something nobody asked it to.
    cover_image_id: images.find((image) => image.is_cover)?.id ?? null,
  };
}

/**
 * The columns the form is responsible for. Everything else in the stored values
 * has to travel back untouched, because `PUT /estates/{id}` replaces the whole
 * record: a column left out of the body is emptied, so the coordinates, the
 * building name, the video and the listing's own status would all be lost by a
 * form that only sent what it happens to render.
 */
export function estatePassthrough(
  values: EstateEditValues,
  options: FormOptions,
): Record<string, unknown> {
  const owned = new Set([
    "id",
    "type",
    "estate_type",
    "title",
    "description",
    "city_id",
    "district_id",
    "address",
    "owner_name",
    "phone",
    "phone2",
    "area",
    "price",
    "mortgage",
    "rent",
    "exchange",
    "exchange_comment",
    ...options.fields.map((field) => field.key),
    ...options.numeric_fields,
  ]);

  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !owned.has(key)),
  );
}
