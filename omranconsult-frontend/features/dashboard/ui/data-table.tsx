import type { ReactNode } from "react";

import { EmptyState } from "@/core/ui/empty-state";
import { Skeleton } from "@/core/ui/skeleton";
import { classNames } from "@/core/ui/class-names";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  rowActions,
  loading,
  error,
  retryLabel,
  onRetry,
  emptyTitle,
  actionsMinWidth = "9.5rem",
  mobileCard,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowActions?: (row: T) => ReactNode;
  loading?: boolean;
  error?: string | null;
  retryLabel?: string;
  onRetry?: () => void;
  emptyTitle: string;
  actionsMinWidth?: string;
  mobileCard: (row: T) => ReactNode;
}) {
  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 text-body-s text-danger">
        <p>{error}</p>
        {onRetry && retryLabel ? (
          <button className="mt-3 text-label-s text-accent underline" onClick={onRetry} type="button">
            {retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-elevated md:block" data-dashboard-table>
        <table className="w-full min-w-[56rem] text-start text-body-s">
          <thead className="sticky top-0 z-[1] bg-elevated text-caption text-muted">
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th className={classNames("px-4 py-3 font-medium", column.className)} key={column.id} scope="col">
                  {column.header}
                </th>
              ))}
              {rowActions ? (
                <th className="px-4 py-3 font-medium" scope="col" style={{ minWidth: actionsMinWidth }}>
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-line transition-colors hover:bg-highlight/60" key={row.id}>
                {columns.map((column) => (
                  <td className={classNames("px-4 py-3 align-middle", column.className)} key={column.id}>
                    {column.cell(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td className="px-4 py-3 align-middle" style={{ minWidth: actionsMinWidth }}>
                    <div className="flex flex-wrap items-center justify-end gap-1">{rowActions(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">{rows.map((row) => mobileCard(row))}</div>
    </>
  );
}
