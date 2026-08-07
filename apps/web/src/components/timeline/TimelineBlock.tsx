'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@pulse/ui';
import { Lock, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { apiPatch } from '@/lib/api';

function timeToOffset(dateString: string, hourStart: number, hourHeight: number): number {
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes();
  return (h - hourStart + m / 60) * hourHeight;
}

function timeToHeight(startStr: string, endStr: string, hourHeight: number): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return ((end.getTime() - start.getTime()) / 3600000) * hourHeight;
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

interface TimelineBlockProps {
  block: any;
  hourStart: number;
  hourHeight: number;
  totalHeight: number;
  onDelete: (id: string) => void;
  onEdit: (block: any) => void;
  onRefresh: () => void;
}

export function TimelineBlock({ block, hourStart, hourHeight, totalHeight, onDelete, onEdit, onRefresh }: TimelineBlockProps) {
  const isFluid = block.type === 'Fluid';
  const initialTop = timeToOffset(block.startTime, hourStart, hourHeight);
  const initialHeight = Math.max(timeToHeight(block.startTime, block.endTime, hourHeight), 40);

  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!isResizing) {
      setHeight(initialHeight);
    }
  }, [initialHeight, isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startYRef.current;
      const rawNewHeight = Math.max(20, startHeightRef.current + deltaY);
      const snapIncrement = hourHeight / 12; // 5-min snap
      const snappedHeight = Math.round(rawNewHeight / snapIncrement) * snapIncrement;
      setHeight(snappedHeight);
    };

    const handleMouseUp = async () => {
      setIsResizing(false);
      document.body.style.userSelect = '';

      const newDurationMs = (height / hourHeight) * 3600000;
      const newEndTime = new Date(new Date(block.startTime).getTime() + newDurationMs);

      try {
        await apiPatch(`/api/tasks/${block.id}`, { endTime: newEndTime.toISOString() });
        onRefresh();
      } catch (err) {
        console.error('Failed to update task duration', err);
        setHeight(initialHeight);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, height, hourHeight, block, onRefresh, initialHeight]);

  if (initialTop < 0 || initialTop > totalHeight) return null;

  // Compute live end time during resize
  const liveEndTime = isResizing
    ? new Date(new Date(block.startTime).getTime() + (height / hourHeight) * 3600000).toISOString()
    : block.endTime;

  return (
    <div
      className="absolute left-3 right-3"
      style={{ top: initialTop, height, zIndex: isResizing ? 20 : 10 }}
    >
      <div
        className={cn(
          'h-full w-full px-4 py-3 flex flex-col justify-between transition-colors duration-150 relative group',
          isFluid
            ? 'border border-dashed border-[#FFFF00]/60 bg-[#FFFF00]/[0.03] hover:bg-[#FFFF00]/[0.06]'
            : 'border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A]',
          isResizing && 'bg-[#1A1A1A] border border-[#FFFF00]'
        )}
      >
        <div className="flex items-start justify-between overflow-hidden">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className={cn(
              'font-sans text-[14px] font-semibold leading-tight truncate',
              isFluid ? 'text-[#FFFF00]' : 'text-[#E0E0E0]',
            )}>
              {block.title}
            </span>
            {/* Start → End time */}
            <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.05em]">
              {formatTime(block.startTime)} → {formatTime(liveEndTime)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 shrink-0 ml-2">
            <span className={cn(
              'font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border',
              isFluid
                ? 'text-[#FFFF00] border-[#FFFF00]/40'
                : 'text-[#666] border-[#333]',
            )}>
              {block.type === 'Fluid' ? 'FLUID' : 'ANCHOR'}
            </span>
            {isFluid ? (
              <GripVertical className="w-3 h-3 text-[#555]" />
            ) : (
              <Lock className="w-3 h-3 text-[#555]" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(block); }}
              className="text-[#555] hover:text-[#FFFF00] transition-colors opacity-0 group-hover:opacity-100"
              title="Edit"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
              className="text-[#555] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isFluid && height > 60 && (
          <div className="flex items-center gap-2 mt-auto pb-1 pointer-events-none">
            <div className="h-px flex-1 bg-[#FFFF00]/20" />
            <span className="font-mono text-[9px] text-[#FFFF00]/50 uppercase tracking-widest">
              AI-FLEXIBLE
            </span>
            <div className="h-px flex-1 bg-[#FFFF00]/20" />
          </div>
        )}

        {/* Resize handle */}
        <div
          className="absolute bottom-0 left-0 w-full h-4 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ marginBottom: '-8px' }}
          onMouseDown={handleMouseDown}
        >
          <div className="w-8 h-1 bg-[#444] rounded-full group-hover:bg-[#FFFF00] transition-colors" />
        </div>
      </div>
    </div>
  );
}
