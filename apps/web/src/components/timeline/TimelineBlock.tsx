'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@pulse/ui';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { apiPost } from '@/lib/api';

function timeToOffset(dateString: string, hourStart: number, hourHeight: number, currentDate: Date): number {
  const d = new Date(dateString);
  let h = d.getHours();
  const m = d.getMinutes();
  
  // If the task falls on the next day relative to the timeline's current date, add 24 hours
  // so it renders at the bottom of the grid instead of wrapping to the top.
  const taskDate = new Date(d);
  taskDate.setHours(0, 0, 0, 0);
  const baseDate = new Date(currentDate);
  baseDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() > baseDate.getTime()) {
    h += 24;
  }
  
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
  onDelete: (block: any) => void;
  onEdit: (block: any) => void;
  onRefresh: () => void;
  onMove: (block: any, newStartTimeISO: string) => Promise<void>;
  onError: (msg: string) => void;
  baseZIndex: number;
  currentDate: Date;
}

export function TimelineBlock({ 
  block, hourStart, hourHeight, totalHeight, onDelete, onEdit, onRefresh,
  onMove, onError, baseZIndex, currentDate
}: TimelineBlockProps) {
  const initialTop = timeToOffset(block.startTime, hourStart, hourHeight, currentDate);
  const initialHeight = Math.max(timeToHeight(block.startTime, block.endTime, hourHeight), 40);

  const [height, setHeight] = useState(initialHeight);
  const [top, setTop] = useState(initialTop);
  
  const [isResizing, setIsResizing] = useState(false);
  const [isMovingBlock, setIsMovingBlock] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const startTopRef = useRef(0);

  useEffect(() => {
    if (!isResizing) setHeight(initialHeight);
    if (!isMovingBlock) setTop(initialTop);
  }, [initialHeight, initialTop, isResizing, isMovingBlock]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startYRef.current = clientY;
    startHeightRef.current = height;
    document.body.style.userSelect = 'none';
  };

  const handleGripMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsMovingBlock(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startYRef.current = clientY;
    startTopRef.current = top;
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isResizing && !isMovingBlock) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      if (isResizing || isMovingBlock) {
        // Prevent page scrolling while dragging on touch devices
        if (e.cancelable) e.preventDefault();
      }

      if (isResizing) {
        const deltaY = clientY - startYRef.current;
        const rawNewHeight = Math.max(20, startHeightRef.current + deltaY);
        const snapIncrement = hourHeight / 12; // 5-min snap
        const snappedHeight = Math.round(rawNewHeight / snapIncrement) * snapIncrement;
        setHeight(snappedHeight);
      } else if (isMovingBlock) {
        const deltaY = clientY - startYRef.current;
        const rawNewTop = Math.max(0, startTopRef.current + deltaY);
        const snapIncrement = hourHeight / 12; // 5-min snap
        const snappedTop = Math.round(rawNewTop / snapIncrement) * snapIncrement;
        setTop(snappedTop);
      }
    };

    const handleMouseUp = async () => {
      document.body.style.userSelect = '';
      
      if (isResizing) {
        setIsResizing(false);
        const newDurationMs = (height / hourHeight) * 3600000;
        const newEndTime = new Date(new Date(block.startTime).getTime() + newDurationMs);

        setIsRecalculating(true);
        try {
          await apiPost('/api/schedule/reschedule', { 
            taskId: block.id, 
            newEndTime: newEndTime.toISOString() 
          });
          onRefresh();
        } catch (err: any) {
          console.warn('Failed to update task duration', err);
          const msg = err.message || 'Failed to update task duration';
          if (msg.includes('429') || msg.includes('Quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            onError('AI Quota Exceeded. Please try again in a minute.');
          } else {
            onError('Failed to update task duration.');
          }
          setHeight(initialHeight);
        } finally {
          setIsRecalculating(false);
        }
      } else if (isMovingBlock) {
        setIsMovingBlock(false);
        // Calculate new start time based on dropped 'top' position
        const hoursFromStart = top / hourHeight;
        const dateObj = new Date(block.startTime);
        dateObj.setHours(hourStart, 0, 0, 0); // reset to timeline start
        const newStartTimeMs = dateObj.getTime() + hoursFromStart * 3600000;
        const newStartTime = new Date(newStartTimeMs);

        setIsRecalculating(true);
        try {
          await onMove(block, newStartTime.toISOString());
        } catch (err) {
          setTop(initialTop);
        } finally {
          setIsRecalculating(false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove as any, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, isMovingBlock, height, top, hourHeight, hourStart, block, onRefresh, initialHeight, initialTop, onMove]);

  if (initialTop < 0 || initialTop > totalHeight) return null;

  // Compute live end time during resize
  const liveEndTime = isResizing
    ? new Date(new Date(block.startTime).getTime() + (height / hourHeight) * 3600000).toISOString()
    : block.endTime;

  return (
    <div
      className={cn(
        "absolute left-3 right-3 transition-transform hover:!z-50",
        isMovingBlock ? "opacity-90 !z-50 scale-[1.02]" : (isResizing ? "!z-40" : "")
      )}
      style={{ top, height, zIndex: isMovingBlock ? 50 : (isResizing ? 40 : baseZIndex) }}
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
              onMouseDown={handleGripMouseDown}
              onTouchStart={handleGripMouseDown}
            >
              <GripVertical className="w-4 h-4 pointer-events-none" />
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
              onClick={(e) => { e.stopPropagation(); onDelete(block); }}
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

        <div
          className="absolute bottom-0 left-0 w-full h-4 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ marginBottom: '-8px' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-8 h-1 bg-[#444] rounded-full group-hover:bg-[#FFFF00] transition-colors" />
        </div>
      </div>
    </div>
  );
}
