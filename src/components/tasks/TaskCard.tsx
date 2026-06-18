'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { Task } from '@/types';
import { cn, formatDate, getDueDateStatus, sanitize } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isDragging,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    low: 'border-l-emerald-400/90',
    medium: 'border-l-amber-400/90',
    high: 'border-l-rose-400/90',
  };

  const priorityBadges = {
    low: 'bg-emerald-400/10 text-emerald-400',
    medium: 'bg-amber-400/10 text-amber-400',
    high: 'bg-red-400/10 text-red-400',
  };

  const dueDateStatus = task.due_date ? getDueDateStatus(task.due_date) : null;
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative glass rounded-xl p-3 transition-all duration-200',
        'border-l-[3px] border border-cyan-100/10',
        priorityColors[task.priority],
        isCompleted && 'opacity-60',
        isDragging && 'shadow-2xl shadow-primary/30 rotate-1.5 scale-[1.02]',
        !isDragging && 'hover:shadow-xl hover:shadow-cyan-950/35'
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 cursor-pointer mt-1',
            'transition-all duration-200 flex items-center justify-center',
            isCompleted
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-400'
              : 'border-slate-500 hover:border-primary'
          )}
          onClick={() => onToggleComplete(task.id)}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'text-sm sm:text-[15px] font-semibold text-white transition-all duration-200',
              isCompleted && 'line-through text-slate-400'
            )}
          >
              {sanitize(task.title)}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize tracking-wide',
                priorityBadges[task.priority]
              )}
            >
              {task.priority}
            </span>

            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1 text-[10px] font-medium',
                  dueDateStatus === 'overdue' && !isCompleted
                    ? 'text-red-400'
                    : dueDateStatus === 'today'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                )}
              >
                {dueDateStatus === 'overdue' && !isCompleted ? (
                  <AlertCircle className="w-2.5 h-2.5" />
                ) : (
                  <Clock className="w-2.5 h-2.5" />
                )}
                {formatDate(task.due_date)}
                {dueDateStatus === 'today' && ' • Today'}
                {dueDateStatus === 'overdue' && !isCompleted && ' • Overdue'}
              </span>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-0.5 transition-all duration-200',
            isHovered ? 'opacity-100' : 'opacity-100 sm:opacity-0'
          )}
        >
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className={cn(
            'flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity',
            isHovered && 'opacity-50'
          )}
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </motion.div>
  );
}
