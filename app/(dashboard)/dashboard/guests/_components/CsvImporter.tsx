"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type PreviewRow = {
  name: string;
  phone?: string;
  email?: string;
  guestSlug: string;
  line: number;
  status: "ready" | "duplicate";
  reason?: string;
};

export function CsvImporter() {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  async function parseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvText(await file.text());
    setPreviewRows([]);
    setError(undefined);
    setSuccess(undefined);
  }

  async function sendImport(mode: "preview" | "commit") {
    if (!csvText.trim()) {
      setError("Pilih file CSV terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      const response = await fetch("/api/guests/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvText,
          mode,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        rows?: PreviewRow[];
        createdCount?: number;
        skippedCount?: number;
      };

      if (!response.ok) {
        setError(data.error ?? "Import CSV belum berhasil.");
        setIsLoading(false);
        return;
      }

      if (mode === "preview") {
        setPreviewRows(data.rows ?? []);
        const readyCount = data.rows?.filter((row) => row.status === "ready").length ?? 0;
        const duplicateCount = data.rows?.filter((row) => row.status === "duplicate").length ?? 0;
        setSuccess(
          `Preview siap. ${readyCount} tamu baru siap diimpor${
            duplicateCount > 0 ? `, ${duplicateCount} duplikat terdeteksi` : ""
          }.`,
        );
      } else {
        setPreviewRows([]);
        setSuccess(
          `${data.createdCount ?? 0} tamu berhasil diimpor${
            data.skippedCount ? `, ${data.skippedCount} baris dilewati` : ""
          }.`,
        );
        router.refresh();
      }

      setIsLoading(false);
    });
  }

  return (
    <section className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-stone-900">Import Tamu via CSV</h2>
        <p className="text-sm text-stone-600">
          Format minimal: kolom <code>name</code>, lalu opsional <code>phone</code> dan{" "}
          <code>email</code>. Preview akan membantu cek slug, duplikat, dan baris yang siap
          diimpor.
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-center rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-center text-sm text-stone-600">
        <input type="file" accept=".csv,text/csv" onChange={parseFile} className="sr-only" />
        {csvText ? "File CSV siap dipreview" : "Pilih file CSV"}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => sendImport("preview")}
          disabled={isLoading}
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
        >
          {isLoading ? "Memproses..." : "Preview CSV"}
        </button>
        <button
          type="button"
          onClick={() => sendImport("commit")}
          disabled={isLoading}
          className="rounded-full bg-[var(--color-olive)] px-5 py-3 text-sm font-semibold text-white"
        >
          Import ke Tamu
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {previewRows.length > 0 ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {previewRows.slice(0, 12).map((row) => (
                <tr key={`${row.line}-${row.guestSlug}`}>
                  <td className="px-4 py-3 text-stone-900">{row.name}</td>
                  <td className="px-4 py-3 text-stone-600">{row.guestSlug}</td>
                  <td className="px-4 py-3 text-stone-500">
                    {row.phone ?? row.email ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "ready"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.status === "ready" ? "Siap" : row.reason ?? "Duplikat"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
