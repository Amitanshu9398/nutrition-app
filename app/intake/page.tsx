"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/form/progress-bar";
import { QuestionField } from "@/components/form/question-field";
import { INTAKE_SECTIONS } from "@/lib/intake-sections";
import { clientInfoSchema, buildAnswersSchema, type ClientInfoInput } from "@/lib/validation";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { Answers } from "@/types";

type WizardView = "entry" | "form" | "success";

const answersSchema = buildAnswersSchema();
type AnswersInput = z.infer<typeof answersSchema>;

export default function IntakePage() {
  const [view, setView] = useState<WizardView>("entry");
  const [clientInfo, setClientInfo] = useState<ClientInfoInput | null>(null);
  const [step, setStep] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const entryForm = useForm<ClientInfoInput>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  const answersForm = useForm<AnswersInput>({
    resolver: zodResolver(answersSchema),
    defaultValues: {},
    mode: "onSubmit",
  });

  const section = INTAKE_SECTIONS[step];
  const isLastStep = step === INTAKE_SECTIONS.length - 1;

  // ── Autosave: debounced write to /api/intake/draft whenever answers change ──
  const persistDraft = useDebouncedCallback(async (answers: Answers) => {
    if (!clientInfo) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/intake/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: sessionToken || undefined,
          answers,
          currentStep: step,
          clientName: clientInfo.name,
          clientPhone: clientInfo.phone,
          clientEmail: clientInfo.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        setSessionToken(data.sessionToken);
        setSaveState("saved");
      }
    } catch {
      // Autosave is best-effort — a failure here should never block the user.
    }
  }, 900);

  const watchedAnswers = answersForm.watch();
  useEffect(() => {
    if (view === "form") persistDraft(watchedAnswers as Answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedAnswers), view]);

  function onEntrySubmit(data: ClientInfoInput) {
    setClientInfo(data);
    setView("form");
  }

  function goNext() {
    // Validate only the current section's fields before advancing.
    const ids = section.questions.map((q) => q.id);
    answersForm.trigger(ids).then((valid) => {
      if (!valid) return;
      if (isLastStep) {
        void submitAll();
      } else {
        setStep((s) => s + 1);
      }
    });
  }

  function goBack() {
    if (step === 0) {
      setView("entry");
    } else {
      setStep((s) => s - 1);
    }
  }

  async function submitAll() {
    if (!clientInfo) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientInfo,
          answers: answersForm.getValues(),
          sessionToken: sessionToken || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      setView("success");
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Keyboard: Enter advances (not inside textareas), Escape does nothing destructive.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault();
        goNext();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, section]
  );

  if (view === "entry") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 to-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card w-full max-w-md p-8"
        >
          <h1 className="mb-1 text-2xl font-semibold">Let's get started</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            A few details so your nutritionist can find your responses.
          </p>
          <form onSubmit={entryForm.handleSubmit(onEntrySubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Full name
              </label>
              <Input id="name" placeholder="Jordan Lee" {...entryForm.register("name")} error={!!entryForm.formState.errors.name} />
              {entryForm.formState.errors.name && (
                <p className="text-xs text-destructive">{entryForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone number
              </label>
              <Input id="phone" placeholder="+1 555 123 4567" {...entryForm.register("phone")} error={!!entryForm.formState.errors.phone} />
              {entryForm.formState.errors.phone && (
                <p className="text-xs text-destructive">{entryForm.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input id="email" placeholder="jordan@email.com" {...entryForm.register("email")} error={!!entryForm.formState.errors.email} />
              {entryForm.formState.errors.email && (
                <p className="text-xs text-destructive">{entryForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 to-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card w-full max-w-md p-10 text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-primary" />
          <h1 className="mb-2 text-2xl font-semibold">You're all set, {clientInfo?.name.split(" ")[0]}!</h1>
          <p className="text-sm text-muted-foreground">
            Your intake form has been submitted. Your nutritionist will review your answers before
            your session.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background px-4 py-10" onKeyDown={onKeyDown}>
      <div className="mx-auto max-w-2xl">
        <ProgressBar sections={INTAKE_SECTIONS} currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-card mt-8 p-6 sm:p-8"
          >
            <h2 className="mb-1 text-xl font-semibold">{section.fullTitle}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Section {step + 1} of {INTAKE_SECTIONS.length}
            </p>

            <div className="space-y-6">
              {section.questions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  control={answersForm.control}
                  error={answersForm.formState.errors[q.id]?.message as string | undefined}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={submitting}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <span className="text-xs text-muted-foreground" aria-live="polite">
            {saveState === "saving" && "Saving..."}
            {saveState === "saved" && "All changes saved"}
          </span>

          <Button onClick={goNext} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : isLastStep ? (
              "Submit"
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
