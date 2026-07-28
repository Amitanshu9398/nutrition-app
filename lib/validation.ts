import { z } from "zod";
import { INTAKE_SECTIONS } from "./intake-sections";

export const clientInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+()\d\s-]+$/, "Only digits, spaces, +, -, and () are allowed"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
});

export type ClientInfoInput = z.infer<typeof clientInfoSchema>;

// Build a permissive answers schema: required questions must be non-empty,
// optional questions may be omitted. Values are sanitized (trimmed) at the
// API boundary in addition to this shape check.
const answerValueSchema = z.union([z.string(), z.array(z.string())]);

export function buildAnswersSchema() {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const section of INTAKE_SECTIONS) {
    for (const q of section.questions) {
      shape[q.id] = q.optional
        ? answerValueSchema.optional()
        : answerValueSchema.refine(
            (v) => (Array.isArray(v) ? v.length > 0 : v.trim().length > 0),
            { message: "This field is required" }
          );
    }
  }
  return z.object(shape);
}

export const intakeSubmitSchema = z.object({
  clientInfo: clientInfoSchema,
  answers: z.record(z.string(), answerValueSchema),
  sessionToken: z.string().uuid().optional(),
});

export type IntakeSubmitInput = z.infer<typeof intakeSubmitSchema>;
