import { FileText, FolderOpen } from "lucide-react";
import { SALES_KIT, driveFile, driveFolder } from "@/data/sales-kit";

export function SalesKitPanel({ brand }: { brand: string }) {
  const kit = SALES_KIT[brand];
  if (!kit) return null;
  return (
    <section className="panel p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Sales Kit · 提案 PDF</h2>
        <a
          href={driveFolder(kit.folder)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-primary hover:bg-accent"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Drive 資料夾
        </a>
      </div>
      <ul className="divide-y divide-border">
        {kit.docs.map((d) => (
          <li key={d.title} className="py-3">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                {d.title}
              </p>
              <p className="shrink-0 text-xs text-muted-foreground">更新 {d.updated}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {d.files.map((f) => (
                <a
                  key={f.id}
                  href={driveFile(f.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold hover:bg-accent"
                >
                  {f.label}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
