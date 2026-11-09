"use client";

import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { Modal } from "@/features/dashboard/ui/modal";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      footer={
        <div className="flex justify-end gap-2">
          <DashboardButton onClick={onCancel} type="button" variant="ghost">
            {cancelLabel}
          </DashboardButton>
          <DashboardButton onClick={onConfirm} type="button" variant={destructive ? "primary" : "secondary"}>
            {confirmLabel}
          </DashboardButton>
        </div>
      }
      onClose={onCancel}
      open={open}
      title={title}
    >
      <p className="text-body-s text-secondary">{message}</p>
    </Modal>
  );
}
