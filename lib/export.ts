import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { formatDate } from "@/lib/utils";
import type { Client, IntakeResponseRow } from "@/types";

function groupBySection(responses: IntakeResponseRow[]) {
  const groups = new Map<string, IntakeResponseRow[]>();
  for (const r of responses) {
    const list = groups.get(r.section_id) || [];
    list.push(r);
    groups.set(r.section_id, list);
  }
  return groups;
}

function answerText(v: string | string[]) {
  return Array.isArray(v) ? v.join(", ") : v;
}

export function exportClientToPDF(client: Client, responses: IntakeResponseRow[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`${client.name} — Intake Summary`, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Phone: ${client.phone}    Submitted: ${formatDate(client.created_at)}`, 14, 25);

  let y = 34;
  const groups = groupBySection(responses);
  for (const [section, rows] of groups) {
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(section.toUpperCase(), 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Question", "Answer"]],
      body: rows.map((r) => [r.question_label, answerText(r.answer)]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        y = data.cursor?.y || y;
      },
    });
    // @ts-expect-error - jspdf-autotable attaches this at runtime
    y = doc.lastAutoTable.finalY + 10;
  }

  doc.save(`${client.name.replace(/\s+/g, "-").toLowerCase()}-intake.pdf`);
}

export function exportClientToCSV(client: Client, responses: IntakeResponseRow[]) {
  const rows = responses.map((r) => ({
    Section: r.section_id,
    Question: r.question_label,
    Answer: answerText(r.answer),
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${client.name.replace(/\s+/g, "-").toLowerCase()}-intake.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
