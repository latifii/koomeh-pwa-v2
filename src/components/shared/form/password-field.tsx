"use client";

import { useState } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

import { FieldMessage, type FormContext } from "./form-controls";

/**
 * A password field with the eye — the same control the sign-in form built by
 * hand, as a form field so every password box in the app has it. The toggle
 * is a real button with a pressed state, so a screen reader hears what it
 * does and whether the text is currently in the clear.
 */
export function FormPasswordField<TValues extends FieldValues>({
  register,
  errors,
  name,
  label,
  required = false,
  hint,
  placeholder,
  autoComplete = "new-password",
}: FormContext<TValues> & {
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  autoComplete?: "new-password" | "current-password";
}) {
  const [visible, setVisible] = useState(false);
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && (
          <Typography as="span" variant="small" className="text-destructive">
            {" *"}
          </Typography>
        )}
      </Label>
      <InputGroup className="h-9 px-1" aria-invalid={Boolean(error)}>
        <InputGroupInput
          id={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          // Passwords read left to right whatever the page direction.
          dir="ltr"
          className="text-start"
          {...register(name)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {hint && !error && <Typography variant="small">{hint}</Typography>}
      <FieldMessage message={error} />
    </div>
  );
}
