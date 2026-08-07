'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@pulse/ui';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { apiPost } from '@/lib/api';

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
  isDragged?: boolean;
  onDragStart?: (e: React.DragEvent, block: any) => void;
  onDragOver?: (e: React.DragEvent, block: any) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export function TimelineBlock({ 
  block, hourStart, hourHeight, totalHeight, onDelete, onEdit, onRefresh,
  isDragged, onDragStart, onDragOver, onDrop, onDragEnd
}: TimelineBlockProps) {
  const initialTop = timeToOffset(block.startTime, hourStart, hourHeight);
  const initialHeight = Math.max(timeToHeight(block.startTime, block.endTime, hourHeight), 40);

  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
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

      setIsRecalculating(true);
      try {
        await apiPost('/api/schedule/reschedule', { 
          taskId: block.id, 
          newEndTime: newEndTime.toISOString() 
        });
        onRefresh();
      } catch (err) {
        console.error('Failed to update task duration', err);
        setHeight(initialHeight);
      } finally {
        setIsRecalculating(false);
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
      className={cn(
        "absolute left-3 right-3 transition-transform hover:z-50",
        isDragged ? "opacity-50 z-50 scale-[0.98] pointer-events-none" : (isResizing ? "z-20" : "z-10")
      )}
      style={{ top: initialTop, height }}
      onDragOver={(e) => onDragOver?.(e, block)}
      onDrop={onDrop}
    >
      <div
        className={cn(
          'h-full w-full px-4 py-3 flex flex-col justify-between transition-colors duration-150 relative group',
          'border border-dashed border-[#FFFF00]/60 bg-[#FFFF00]/[0.03] hover:bg-[#FFFF00]/[0.06]',
          isResizing && 'bg-[#1A1A1A] border border-[#FFFF00]'
        )}
      >
        <div className="flex items-start justify-between overflow-hidden">
          <div className="flex items-start gap-2 min-w-0">
            <div 
              className="mt-0.5 cursor-grab active:cursor-grabbing text-[#555] hover:text-[#FFFF00] transition-colors"
              draggable
              onDragStart={(e) => {
                // Set data to avoid some browsers dropping the drag
                e.dataTransfer.setData('text/plain', block.id);
                e.dataTransfer.effectAllowed = 'move';
                onDragStart?.(e, block);
              }}
              onDragEnd={onDragEnd}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-sans text-[14px] font-semibold leading-tight truncate text-[#FFFF00]">
                {block.title}
              </span>
              {/* Start → End time */}
              <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.05em]">
                {formatTime(block.startTime)} → {formatTime(liveEndTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 shrink-0 ml-2">
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

        {isRecalculating && (
          <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border border-[#FFFF00]">
            <div className="font-mono text-[10px] text-[#FFFF00] uppercase tracking-[0.2em] animate-pulse flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-ping" />
              AI RECALCULATING...
            </div>
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
