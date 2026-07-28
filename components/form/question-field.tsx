"use client";

import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

export function QuestionField({
  question,
  control,
  error,
}: {
  question: Question;
  control: Control<any>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={question.id} className="block text-sm font-medium text-foreground">
        {question.label}
        {!question.optional && <span className="ml-1 text-destructive">*</span>}
        {question.optional && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </label>

      <Controller
        name={question.id}
        control={control}
        render={({ field }) => {
          if (question.type === "text") {
            return (
              <Input
                id={question.id}
                placeholder={question.placeholder}
                error={!!error}
                aria-describedby={error ? `${question.id}-error` : undefined}
                {...field}
              />
            );
          }
          if (question.type === "textarea") {
            return (
              <Textarea
                id={question.id}
                placeholder={question.placeholder}
                error={!!error}
                aria-describedby={error ? `${question.id}-error` : undefined}
                {...field}
              />
            );
          }
          if (question.type === "radio") {
            return (
              <div role="radiogroup" aria-labelledby={question.id} className="grid gap-2 sm:grid-cols-2">
                {question.options?.map((opt) => {
                  const checked = field.value === opt;
                  return (
                    <label
                      key={opt}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                        checked
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:bg-secondary"
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={opt}
                        checked={checked}
                        onChange={() => field.onChange(opt)}
                        className="h-4 w-4 accent-primary"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            );
          }
          if (question.type === "checkbox") {
            const values: string[] = Array.isArray(field.value) ? field.value : [];
            return (
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options?.map((opt) => {
                  const checked = values.includes(opt);
                  return (
                    <label
                      key={opt}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                        checked
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:bg-secondary"
                      )}
                    >
                      <input
                        type="checkbox"
                        value={opt}
                        checked={checked}
                        onChange={() => {
                          field.onChange(
                            checked ? values.filter((v) => v !== opt) : [...values, opt]
                          );
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            );
          }
          return <></>;
        }}
      />

      {error && (
        <p id={`${question.id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
