import { Button } from "@/components/ui/button";

export function DataSkeleton() {
  return <div className="space-y-6" role="status" aria-label="載入中">
    <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="panel h-28 animate-pulse bg-muted" />)}</div>
    <div className="grid gap-4 lg:grid-cols-2">{[0, 1].map((i) => <div key={i} className="panel h-64 animate-pulse bg-muted" />)}</div>
  </div>;
}

export function DataError({ message, retry }: { message: string; retry: () => void }) {
  return <div className="panel space-y-4 p-6" role="alert"><h2 className="font-semibold">資料未能載入</h2><p className="break-words text-sm text-muted-foreground">{message}</p><Button variant="outline" onClick={retry}>重試</Button></div>;
}