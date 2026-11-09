import type { KeyboardEvent, ReactNode } from "react";

import { EmptyState } from "@/core/ui/empty-state";
import { Skeleton } from "@/core/ui/skeleton";
import { classNames } from "@/core/ui/class-names";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  width?: string;
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
  actionsWidth = "8.25rem",
  mobileCard,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowActions?: (row: T) => ReactNode;
  loading?: boolean;
  error?: string | null;
  retryLabel?: string;
  onRetry?: () => void;
  emptyTitle: string;
  actionsWidth?: string;
  mobileCard: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
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

  function handleRowKey(event: KeyboardEvent<HTMLTableRowElement>, row: T) {
    if (!onRowClick) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-elevated md:block" data-dashboard-table>
        <table className="w-full table-fixed text-start text-body-s">
          <thead className="sticky top-0 z-[1] bg-elevated text-caption text-muted">
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  className={classNames("px-3 py-2.5 font-medium", column.className)}
                  key={column.id}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
              {rowActions ? (
                <th
                  className="sticky end-0 bg-elevated px-3 py-2.5 font-medium"
                  scope="col"
                  style={{ width: actionsWidth, minWidth: actionsWidth }}
                >
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className={classNames(
                  "h-[4.5rem] max-h-[4.5rem] border-b border-line transition-colors hover:bg-highlight/60",
                  onRowClick ? "cursor-pointer" : undefined,
                )}
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => handleRowKey(event, row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((column) => (
                  <td className={classNames("px-3 py-2 align-middle", column.className)} key={column.id}>
                    {column.cell(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td
                    className="sticky end-0 bg-elevated px-3 py-2 align-middle"
                    onClick={(event) => event.stopPropagation()}
                    style={{ width: actionsWidth, minWidth: actionsWidth }}
                  >
                    <div className="flex items-center justify-end gap-1">{rowActions(row)}</div>
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
