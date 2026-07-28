"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntakeSection } from "@/types";

export function ProgressBar({
  sections,
  currentStep,
}: {
  sections: IntakeSection[];
  currentStep: number;
}) {
  const pct = ((currentStep + 1) / sections.length) * 100;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Step {currentStep + 1} of {sections.length}
        </span>
        <span>{Math.round(pct)}% complete</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="mt-4 hidden items-center justify-between sm:flex">
        {sections.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold transition-colors",
                  i < currentStep && "border-primary bg-primary text-primary-foreground",
                  i === currentStep && "border-primary text-primary",
                  i > currentStep && "border-border text-muted-foreground"
                )}
              >
                {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px]",
                  i === currentStep ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
            {i < sections.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded",
                  i < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
