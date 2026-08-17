import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  danger = true,
  loading,
  onConfirm,
  onCancel,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        />
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl border border-card-pink w-full max-w-sm p-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.16 }}
        >
          <div
            className={`mx-auto mb-3 w-12 h-12 rounded-2xl flex items-center justify-center ${
              danger ? 'bg-red-50 text-red-500' : 'bg-soft-pink text-primary-pink'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-dark">{title}</h3>
          {message && <p className="text-xs text-gray-custom mt-1.5 leading-relaxed">{message}</p>}
          <div className="flex gap-2 mt-5">
            <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={danger ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={loading}
              className="flex-1"
            >
              {confirmLabel}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
