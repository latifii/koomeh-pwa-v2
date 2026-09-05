"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FileSignature,
  Paperclip,
  Plus,
  Save,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import {
  createContract,
  deleteContractDocument,
  updateContract,
  uploadContractDocument,
} from "@/app/panel/contracts/_api/contracts.service";
import { contractFiltersQueryOptions } from "@/app/panel/contracts/_queries/contracts.query";
import {
  contractFormSchema,
  type ContractDetail,
  type ContractFormValues,
} from "@/app/panel/contracts/_schemas/contracts.schema";
import {
  FormBooleanField,
  FormDateField,
  FormTextField,
  FormTextareaField,
  LookupSelect,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

/** Which side of the deal an agent worked, as the old form numbered them. */
const EXPERT_SIDES = [
  { value: "1", title: "سمت فروشنده" },
  { value: "2", title: "سمت خریدار" },
];

const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const EMPTY: ContractFormValues = {
  contractid: "",
  type: "1",
  estate_type: "",
  estate_id: "",
  estate_name: "",
  estate_phone: "",
  estate_fatherName: "",
  estate_idCard: "",
  estate_nationalId: "",
  estate_address: "",
  customer_id: "",
  customer_name: "",
  customer_phone: "",
  customer_fatherName: "",
  customer_idCard: "",
  customer_nationalId: "",
  total_price: "",
  total_mortgage: "",
  total_rent: "",
  total_commission: "",
  has_vat: false,
  description: "",
  tracking_code: "",
  register_date: "",
  registryofficedate: "",
  deliverydate: "",
  experts: [],
  documents: [],
};

function defaultsFrom(contract: ContractDetail): ContractFormValues {
  const money = (value?: number | null) =>
    value === null || value === undefined || value === 0 ? "" : String(value);

  return {
    ...EMPTY,
    contractid: text(contract.contractid),
    type: text(contract.type) || "1",
    estate_type: text(contract.estate_type),
    estate_id: text(contract.estate_id),
    estate_name: text(contract.seller?.name),
    estate_phone: text(contract.seller?.phone),
    estate_fatherName: text(contract.seller?.father_name),
    estate_idCard: text(contract.seller?.id_card),
    estate_nationalId: text(contract.seller?.national_id),
    estate_address: text(contract.address),
    customer_name: text(contract.buyer?.name),
    customer_phone: text(contract.buyer?.phone),
    customer_fatherName: text(contract.buyer?.father_name),
    customer_idCard: text(contract.buyer?.id_card),
    customer_nationalId: text(contract.buyer?.national_id),
    total_price: money(contract.amounts.price),
    total_mortgage: money(contract.amounts.mortgage),
    total_rent: money(contract.amounts.rent),
    total_commission: money(contract.amounts.commission),
    has_vat: contract.has_vat,
    description: text(contract.description),
    tracking_code: text(contract.tracking_code),
    experts: contract.experts.map((expert) => ({
      expert_id: text(expert.expert?.id),
      type: text(expert.type) || "1",
      commission: text(expert.commission),
    })),
    documents: contract.documents.map((document) => document.id),
  };
}

/**
 * The contract form.
 *
 * Amounts go as typed. The API accepts them with commas and Persian digits and
 * normalises them itself, which is what the paper form does too — reformatting
 * them here would only be a second opinion about the same string.
 */
export function ContractForm({ contract }: { contract?: ContractDetail }) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const [documents, setDocuments] = useState(contract?.documents ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const options = useQuery(contractFiltersQueryOptions());

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: contract ? defaultsFrom(contract) : EMPTY,
  });

  const experts = useFieldArray({ control: form.control, name: "experts" });

  const mutation = useMutation({
    mutationFn: (values: ContractFormValues) => {
      const body: Record<string, unknown> = {
        contractid: values.contractid || null,
        type: values.type ? Number(values.type) : null,
        estate_type: values.estate_type ? Number(values.estate_type) : null,
        estate_id: values.estate_id ? Number(values.estate_id) : null,
        estate_name: values.estate_name || null,
        estate_phone: values.estate_phone || null,
        estate_fatherName: values.estate_fatherName || null,
        estate_idCard: values.estate_idCard || null,
        estate_nationalId: values.estate_nationalId || null,
        estate_address: values.estate_address || null,
        customer_id: values.customer_id ? Number(values.customer_id) : null,
        customer_name: values.customer_name || null,
        customer_phone: values.customer_phone || null,
        customer_fatherName: values.customer_fatherName || null,
        customer_idCard: values.customer_idCard || null,
        customer_nationalId: values.customer_nationalId || null,
        total_price: values.total_price || null,
        total_mortgage: values.total_mortgage || null,
        total_rent: values.total_rent || null,
        total_commission: values.total_commission || null,
        has_vat: values.has_vat,
        description: values.description || null,
        tracking_code: values.tracking_code || null,
        register_date: values.register_date || null,
        registryofficedate: values.registryofficedate || null,
        deliverydate: values.deliverydate || null,
        // The whole list replaces what is on record, so a row taken off here
        // is taken off there.
        experts: values.experts
          .filter((row) => row.expert_id)
          .map((row) => ({
            expert_id: Number(row.expert_id),
            type: Number(row.type || 1),
            commission: Number(row.commission || 0),
          })),
        documents: documents.map((document) => document.id),
      };

      return contract ? updateContract(contract.id, body) : createContract(body);
    },
    onSuccess: () => {
      toast.success(contract ? "قولنامه ذخیره شد." : "قولنامه ثبت شد.");
      startNavigation(() => {
        router.push(routes.panel.contracts);
        router.refresh();
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const attach = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadContractDocument(file);
      setDocuments((current) => [...current, uploaded]);
      toast.success("سند پیوست شد.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const detach = async (id: number) => {
    try {
      await deleteContractDocument(id);
      setDocuments((current) => current.filter((document) => document.id !== id));
      toast.success("سند حذف شد.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const context: FormContext<ContractFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid grid-cols-1 gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="size-4 text-brand" />
            قولنامه
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormTextField {...context} name="contractid" label="شماره قولنامه" />
            <LookupSelect
              control={form.control}
              name="type"
              label="نوع معامله"
              options={options.data?.deal_types ?? []}
            />
            <LookupSelect
              control={form.control}
              name="estate_type"
              label="نوع ملک"
              options={options.data?.estate_types ?? []}
              allowEmpty
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormDateField
              {...context}
              name="register_date"
              label="تاریخ ثبت"
            />
            <FormDateField
              {...context}
              name="registryofficedate"
              label="تاریخ دفترخانه"
            />
            <FormDateField
              {...context}
              name="deliverydate"
              label="تاریخ تحویل"
            />
          </div>

          <FormTextField {...context} name="estate_address" label="نشانی ملک" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-brand" />
            طرفین
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <Typography variant="small">فروشنده / موجر</Typography>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormTextField {...context} name="estate_name" label="نام" />
            <FormTextField {...context} name="estate_phone" label="تلفن" type="tel" />
            <FormTextField {...context} name="estate_nationalId" label="کد ملی" />
            <FormTextField {...context} name="estate_fatherName" label="نام پدر" />
            <FormTextField {...context} name="estate_idCard" label="شماره شناسنامه" />
            <FormTextField {...context} name="estate_id" label="کد ملک" />
          </div>

          <Typography variant="small">خریدار / مستاجر</Typography>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormTextField {...context} name="customer_name" label="نام" />
            <FormTextField {...context} name="customer_phone" label="تلفن" type="tel" />
            <FormTextField {...context} name="customer_nationalId" label="کد ملی" />
            <FormTextField {...context} name="customer_fatherName" label="نام پدر" />
            <FormTextField {...context} name="customer_idCard" label="شماره شناسنامه" />
            <FormTextField {...context} name="customer_id" label="کد تقاضا" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-4 text-brand" />
            مبالغ و کمیسیون
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <FormTextField {...context} name="total_price" label="مبلغ کل" />
            <FormTextField {...context} name="total_mortgage" label="ودیعه" />
            <FormTextField {...context} name="total_rent" label="اجاره" />
            <FormTextField {...context} name="total_commission" label="کمیسیون" />
          </div>

          <FormBooleanField {...context} name="has_vat" label="ارزش افزوده دارد" />

          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography variant="small">مشاوران معامله</Typography>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  experts.append({ expert_id: "", type: "1", commission: "" })
                }
              >
                <Plus />
                افزودن مشاور
              </Button>
            </div>

            {experts.fields.length === 0 && (
              <Typography variant="small">هنوز مشاوری اضافه نشده است.</Typography>
            )}

            {experts.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-end gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <LookupSelect
                  control={form.control}
                  name={`experts.${index}.expert_id`}
                  label="مشاور"
                  options={options.data?.agents ?? []}
                  allowEmpty
                />
                <LookupSelect
                  control={form.control}
                  name={`experts.${index}.type`}
                  label="سمت"
                  options={EXPERT_SIDES}
                />
                <FormTextField
                  {...context}
                  name={`experts.${index}.commission`}
                  label="سهم (درصد)"
                  inputMode="numeric"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => experts.remove(index)}
                >
                  <Trash2 />
                  حذف
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="size-4 text-brand" />
            اسناد پیوست
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          {documents.length === 0 && (
            <Typography variant="small">سندی پیوست نشده است.</Typography>
          )}

          {documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5"
            >
              <Typography variant="small" className="min-w-0">
                {document.url ? (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand"
                  >
                    {document.name?.trim() || `سند ${document.id}`}
                  </a>
                ) : (
                  document.name?.trim() || `سند ${document.id}`
                )}
              </Typography>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => void detach(document.id)}
              >
                <Trash2 />
                حذف
              </Button>
            </div>
          ))}

          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? <Spinner /> : <Paperclip />}
              پیوست سند
            </Button>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(event) => void attach(event.target.files?.[0] ?? null)}
            />
          </div>

          <FormTextareaField
            {...context}
            name="description"
            label="توضیحات"
            rows={3}
          />
          <FormTextField {...context} name="tracking_code" label="کد رهگیری" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || isNavigating}
        >
          {mutation.isPending || isNavigating ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {contract ? "ذخیره تغییرها" : "ثبت قولنامه"}
        </Button>
        <Typography variant="small">
          فهرست مشاوران جایگزین می‌شود؛ هرکس اینجا نباشد از قولنامه برداشته
          می‌شود.
        </Typography>
      </div>
    </form>
  );
}
