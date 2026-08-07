'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@pulse/ui';
import { Lock, GripVertical, Trash2 } from 'lucide-react';
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

function formatTimeRange(startStr: string, endStr: string): string {
  const fmt = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${fmt(new Date(startStr))} — ${fmt(new Date(endStr))}`;
}

interface TimelineBlockProps {
  block: any;
  hourStart: number;
  hourHeight: number;
  totalHeight: number;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function TimelineBlock({ block, hourStart, hourHeight, totalHeight, onDelete, onRefresh }: TimelineBlockProps) {
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
      
      const snapIncrement = hourHeight / 12; // 5 mins snap
      const snappedHeight = Math.round(rawNewHeight / snapIncrement) * snapIncrement;
      
      setHeight(snappedHeight);
    };

    const handleMouseUp = async () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      
      const newDurationHours = height / hourHeight;
      const newDurationMs = newDurationHours * 3600000;
      const newEndTime = new Date(new Date(block.startTime).getTime() + newDurationMs);
      
      try {
        await apiPatch(`/api/tasks/${block.id}`, { endTime: newEndTime.toISOString() });
        onRefresh();
      } catch (err) {
        console.error('Failed to update task duration', err);
        setHeight(initialHeight); // revert on error
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
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className={cn(
              'font-sans text-[15px] font-semibold leading-tight',
              isFluid ? 'text-[#FFFF00]' : 'text-[#999]',
            )}>
              {block.title}
            </span>
            <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.05em]">
              {isResizing 
                ? formatTimeRange(block.startTime, new Date(new Date(block.startTime).getTime() + (height/hourHeight)*3600000).toISOString())
                : formatTimeRange(block.startTime, block.endTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              'font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border',
              isFluid
                ? 'text-[#FFFF00] border-[#FFFF00]/40'
                : 'text-[#666] border-[#333]',
            )}>
              {block.type === 'Fluid' ? 'FLUID' : 'ANCHOR'}
            </span>
            {isFluid ? (
              <GripVertical className="w-3.5 h-3.5 text-[#555]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#555]" />
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
              className="ml-2 text-[#555] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isFluid && height > 60 && (
          <div className="flex items-center gap-2 mt-auto pb-2 pointer-events-none">
            <div className="h-px flex-1 bg-[#FFFF00]/20" />
            <span className="font-mono text-[9px] text-[#FFFF00]/50 uppercase tracking-widest">
              AI-FLEXIBLE
            </span>
            <div className="h-px flex-1 bg-[#FFFF00]/20" />
          </div>
        )}
        
        <div 
          className="absolute bottom-0 left-0 w-full h-4 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mb-2"
          onMouseDown={handleMouseDown}
        >
          <div className="w-8 h-1 bg-[#555] rounded-full group-hover:bg-[#FFFF00]" />
        </div>
      </div>
    </div>
  );
}
