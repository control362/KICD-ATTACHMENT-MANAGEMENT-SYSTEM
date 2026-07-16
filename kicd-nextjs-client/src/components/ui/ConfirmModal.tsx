"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white w-[400px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-on-surface mb-2">{title}</h2>
          <p className="text-on-surface-variant text-base leading-relaxed">{message}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div className="bg-surface-container-lowest px-6 py-4 flex justify-end gap-3 border-t border-border-light">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-medium text-text-secondary hover:bg-surface-container-low transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-lg font-medium text-white transition-colors shadow-sm ${
              confirmVariant === "danger" 
                ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/50" 
                : "bg-primary hover:bg-primary-dark focus:ring-2 focus:ring-primary/50"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
