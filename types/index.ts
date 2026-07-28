export type QuestionType = "text" | "textarea" | "radio" | "checkbox";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
}

export interface IntakeSection {
  id: number;
  key: string;
  title: string;
  fullTitle: string;
  icon: string;
  color: string;
  questions: Question[];
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export type ClientStatus = "new" | "active" | "in_progress" | "completed" | "archived";

export interface Client {
  id: string;
  nutritionist_id: string;
  name: string;
  phone: string;
  email: string | null;
  status: ClientStatus;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntakeResponseRow {
  id: string;
  client_id: string;
  section_id: string;
  question_id: string;
  question_label: string;
  answer: AnswerValue;
  created_at: string;
}
