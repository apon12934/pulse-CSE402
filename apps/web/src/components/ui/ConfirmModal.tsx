import React from 'react';
import { Button } from '@pulse/ui';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmType?: 'danger' | 'warning';
  requireText?: string;
  isProcessing?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  confirmType = 'danger',
  requireText,
  isProcessing
}: ConfirmModalProps) {
  const [inputText, setInputText] = React.useState('');

  if (!isOpen) return null;

  const isDanger = confirmType === 'danger';
  const isButtonDisabled = isProcessing || (requireText && inputText !== requireText);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-[#262626] max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-[#FF4444]">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="font-mono text-lg font-bold tracking-widest uppercase text-white">{title}</h2>
          </div>
          
          <p className="text-[#888] text-sm leading-relaxed mb-6 font-mono">
            {description}
          </p>

          {requireText && (
            <div className="mb-6">
              <label className="block text-[#888] text-xs font-mono uppercase tracking-wider mb-2">
                Type <span className="text-[#FF4444] font-bold">{requireText}</span> to confirm
              </label>
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#262626] text-white p-3 font-mono text-sm focus:outline-none focus:border-[#FF4444] rounded-none transition-colors"
                placeholder={requireText}
              />
            </div>
          )}

          <div className="flex items-center gap-3 mt-8">
            <Button 
              className="flex-1 bg-transparent border border-[#333] text-white hover:bg-[#333] rounded-none font-mono tracking-widest uppercase text-xs h-12 shadow-none"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              className={`flex-1 rounded-none font-mono tracking-widest uppercase text-xs h-12 border-none shadow-none ${isDanger ? 'bg-[#FF4444] text-white hover:bg-[#FF4444]/80' : 'bg-[#FFFF00] text-black hover:bg-[#FFFF00]/80'}`}
              onClick={onConfirm}
              disabled={isButtonDisabled as boolean}
            >
              {isProcessing ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
        
        <button 
          className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors"
          onClick={onClose}
          disabled={isProcessing}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
