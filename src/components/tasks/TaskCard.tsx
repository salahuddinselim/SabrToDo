'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { Task } from '@/types';
import { cn, formatDate, formatTime, getDueDateStatus } from '@/lib/utils';

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
    low: 'border-l-emerald-400',
    medium: 'border-l-amber-400',
    high: 'border-l-red-400',
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
        'group relative glass rounded-xl p-4 transition-all duration-200',
        'border-l-4',
        priorityColors[task.priority],
        isCompleted && 'opacity-60',
        isDragging && 'shadow-2xl shadow-primary/20 rotate-2 scale-105',
        !isDragging && 'hover:shadow-lg hover:shadow-primary/10'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 cursor-pointer',
            'transition-all duration-200 flex items-center justify-center',
            isCompleted
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-400'
              : 'border-slate-500 hover:border-primary'
          )}
          onClick={() => onToggleComplete(task.id)}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'font-medium text-white mb-1 transition-all duration-200',
              isCompleted && 'line-through text-slate-400'
            )}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-slate-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                priorityBadges[task.priority]
              )}
            >
              {task.priority}
            </span>

            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  dueDateStatus === 'overdue' && !isCompleted
                    ? 'text-red-400'
                    : dueDateStatus === 'today'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                )}
              >
                {dueDateStatus === 'overdue' && !isCompleted ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
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
            'flex items-center gap-1 transition-all duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div
          className={cn(
            'flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity',
            isHovered && 'opacity-50'
          )}
        >
          <GripVertical className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </motion.div>
  );
}
