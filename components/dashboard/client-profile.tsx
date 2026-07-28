"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, initials, cn } from "@/lib/utils";
import { exportClientToPDF, exportClientToCSV } from "@/lib/export";
import { INTAKE_SECTIONS } from "@/lib/intake-sections";
import type { Client, IntakeResponseRow, ClientStatus } from "@/types";

const STATUSES: ClientStatus[] = ["new", "active", "in_progress", "completed", "archived"];

export function ClientProfile({
  client: initialClient,
  responses: initialResponses,
}: {
  client: Client;
  responses: IntakeResponseRow[];
}) {
  const router = useRouter();
  const [client, setClient] = useState(initialClient);
  const [responses, setResponses] = useState(initialResponses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [notesDraft, setNotesDraft] = useState(client.notes || "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(client.tags || []);

  const grouped = useMemo(() => {
    return INTAKE_SECTIONS.map((section) => ({
      section,
      rows: responses.filter((r) => r.section_id === section.key),
    }));
  }, [responses]);

  async function updateClient(payload: Partial<{ status: ClientStatus; tags: string[]; notes: string }>) {
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      setClient(data);
    }
    return res.ok;
  }

  async function onStatusChange(status: ClientStatus) {
    setSavingStatus(true);
    await updateClient({ status });
    setSavingStatus(false);
  }

  async function saveNotes() {
    setNotesSaving(true);
    await updateClient({ notes: notesDraft });
    setNotesSaving(false);
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    setTagInput("");
    void updateClient({ tags: next });
  }

  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    void updateClient({ tags: next });
  }

  function startEdit(row: IntakeResponseRow) {
    setEditingId(row.id);
    setDraftValue(Array.isArray(row.answer) ? row.answer.join(", ") : row.answer);
  }

  async function saveEdit(row: IntakeResponseRow) {
    const res = await fetch(`/api/clients/${client.id}/responses/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: draftValue }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResponses((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
    }
    setEditingId(null);
  }

  async function deleteResponse(row: IntakeResponseRow) {
    const res = await fetch(`/api/clients/${client.id}/responses/${row.id}`, { method: "DELETE" });
    if (res.ok) setResponses((prev) => prev.filter((r) => r.id !== row.id));
  }

  async function deleteClient() {
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/clients");
  }

  return (
    <div className="p-6 sm:p-10 print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/dashboard/clients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to clients
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportClientToCSV(client, responses)}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportClientToPDF(client, responses)}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <Card className="w-full max-w-sm p-6">
            <h2 className="mb-2 font-semibold">Delete this record?</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This permanently deletes {client.name}&apos;s intake record. This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={deleteClient}>Delete</Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="mb-6 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
              {initials(client.name)}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{client.name}</h1>
              <p className="text-sm text-muted-foreground">
                {client.phone} · Submitted {formatDate(client.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <select
              value={client.status}
              disabled={savingStatus}
              onChange={(e) => onStatusChange(e.target.value as ClientStatus)}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
              {t}
              <button onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="h-7 rounded-full border border-dashed border-border bg-transparent px-3 text-xs outline-none focus:border-primary"
          />
        </div>
      </Card>

      <Card className="mb-6 p-6 print:hidden">
        <h2 className="mb-3 font-semibold">Notes</h2>
        <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Private notes about this client..." />
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={saveNotes} disabled={notesSaving}>
            {notesSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save notes"}
          </Button>
        </div>
      </Card>

      {grouped.map(({ section, rows }) => (
        <Card key={section.id} className="mb-4 overflow-hidden">
          <div className="border-b border-border bg-secondary/40 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section {section.id}
            </span>
            <h3 className="font-semibold">{section.fullTitle}</h3>
          </div>
          <CardContent className="divide-y divide-border p-0">
            {rows.length === 0 && (
              <p className="px-6 py-4 text-sm text-muted-foreground">No responses for this section.</p>
            )}
            {rows.map((row) => (
              <div key={row.id} className="grid gap-2 px-6 py-4 sm:grid-cols-[240px_1fr_auto] sm:items-start">
                <div className="text-sm font-medium text-muted-foreground">{row.question_label}</div>
                {editingId === row.id ? (
                  <Input value={draftValue} onChange={(e) => setDraftValue(e.target.value)} />
                ) : (
                  <div className="rounded-lg bg-accent/60 px-3 py-1.5 text-sm">
                    {Array.isArray(row.answer) ? row.answer.join(" · ") : row.answer}
                  </div>
                )}
                <div className="flex gap-1 print:hidden">
                  {editingId === row.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => saveEdit(row)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteResponse(row)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
