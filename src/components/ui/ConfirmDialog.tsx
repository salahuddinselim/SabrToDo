'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-accent-red/10' : 'bg-accent-yellow/10'
        }`}>
          {variant === 'danger' ? (
            <Trash2 className="w-6 h-6 text-accent-red" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-accent-yellow" />
          )}
        </div>
        <div>
          <h3 className="text-[16px] font-medium text-primary mb-1">{title}</h3>
          <p className="text-[13px] text-ink-muted leading-[1.5]">{message}</p>
        </div>
        <div className="flex items-center gap-3 w-full mt-1">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
