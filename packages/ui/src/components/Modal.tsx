'use client'

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative bg-[#121212] border border-[#262626] w-full max-w-md shadow-2xl flex flex-col rounded-none",
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] shrink-0">
            <h2 className="font-sans text-lg font-semibold text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors text-xl leading-none focus:outline-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
