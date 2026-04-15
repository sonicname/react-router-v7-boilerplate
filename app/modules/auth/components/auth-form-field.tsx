import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type AuthFormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
  errors?: string[];
  autoComplete?: string;
};

export function AuthFormField({
  id,
  name,
  label,
  type = "text",
  required,
  minLength,
  defaultValue,
  errors,
  autoComplete,
}: AuthFormFieldProps) {
  const hasError = Boolean(errors?.length);
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError && (
        <p id={errorId} className="text-sm text-destructive">
          {errors?.[0]}
        </p>
      )}
    </div>
  );
}
