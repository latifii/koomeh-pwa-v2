"use client";

import {
  Controller,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type FormOption = {
  value: string;
  label: string;
};

type FormChoiceOption = FormOption | readonly [string, string];

export type FormContext<TValues extends FieldValues> = Pick<
  UseFormReturn<TValues>,
  "control" | "register"
> & {
  errors: UseFormReturn<TValues>["formState"]["errors"];
};

type BaseFieldProps<TValues extends FieldValues> = FormContext<TValues> & {
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
};

export function FieldMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <Typography variant="small" className="mt-1 text-destructive">
      {message}
    </Typography>
  );
}

export function FormTextField<TValues extends FieldValues>({
  register,
  errors,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  hint,
  inputMode,
  autoComplete,
}: BaseFieldProps<TValues> & {
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  hint?: string;
  /** Phone/number fields need the right on-screen keyboard. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Credential fields need this for password managers to work. */
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}) {
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <FormLabel label={label} required={required} htmlFor={name} />
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />
      {hint && !error && <Typography variant="small">{hint}</Typography>}
      <FieldMessage message={error} />
    </div>
  );
}

export function FormSelectField<TValues extends FieldValues>({
  control,
  errors,
  name,
  label,
  options,
  placeholder,
  required = false,
}: BaseFieldProps<TValues> & {
  options: FormOption[];
  placeholder: string;
}) {
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <FormLabel label={label} required={required} htmlFor={name} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={(field.value as string) || null}
            items={options}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger
              id={name}
              className={cn("w-full", error && "border-destructive")}
              aria-invalid={Boolean(error)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldMessage message={error} />
    </div>
  );
}

export function FormBooleanField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
}: Omit<BaseFieldProps<TValues>, "required"> & {
  description?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
            field.value && "border-brand bg-brand/5",
          )}
        >
          <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
          />
          <div>
            <Typography variant="body" className="font-medium">
              {label}
            </Typography>
            {description && (
              <Typography variant="small">{description}</Typography>
            )}
          </div>
        </Label>
      )}
    />
  );
}

export function FormCheckboxGroup<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
}: Omit<BaseFieldProps<TValues>, "required"> & {
  options: readonly FormChoiceOption[];
}) {
  return (
    <div className="space-y-3">
      <Typography variant="h4">{label}</Typography>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const value = isOptionTuple(option) ? option[0] : option.value;
          const optionLabel = isOptionTuple(option) ? option[1] : option.label;

          return (
            <Controller
              key={value}
              name={name}
              control={control}
              render={({ field }) => {
                const currentValue: string[] = Array.isArray(field.value)
                  ? (field.value as string[])
                  : [];
                const checked = currentValue.includes(value);

                return (
                  <Label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                      checked && "border-brand bg-brand/5 text-brand",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        field.onChange(
                          nextChecked
                            ? [...currentValue, value]
                            : currentValue.filter((item) => item !== value),
                        )
                      }
                    />
                    {optionLabel}
                  </Label>
                );
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function FormTextareaField<TValues extends FieldValues>({
  register,
  errors,
  name,
  label,
  placeholder,
  required = false,
  rows = 6,
}: BaseFieldProps<TValues> & {
  placeholder?: string;
  rows?: number;
}) {
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <FormLabel label={label} required={required} htmlFor={name} />
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />
      <FieldMessage message={error} />
    </div>
  );
}

function FormLabel({
  label,
  required,
  htmlFor,
}: {
  label: string;
  required: boolean;
  htmlFor: string;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {label}
      {required && (
        <Typography as="span" variant="small" className="text-destructive">
          {" *"}
        </Typography>
      )}
    </Label>
  );
}

function isOptionTuple(
  option: FormChoiceOption,
): option is readonly [string, string] {
  return Array.isArray(option);
}
