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
    low: 'border-l-accent-green/80',
    medium: 'border-l-accent-yellow/80',
    high: 'border-l-accent-red/80',
  };

  const priorityBadges = {
    low: 'bg-accent-green/10 text-accent-green',
    medium: 'bg-accent-yellow/10 text-accent-yellow',
    high: 'bg-accent-red/10 text-accent-red',
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
        'group relative glass rounded-xl p-3 transition-all duration-base',
        'border-l-[3px] border border-white/10',
        priorityColors[task.priority],
        isCompleted && 'opacity-60',
        isDragging && 'shadow-2xl shadow-accent-blue/25 rotate-1.5 scale-[1.02]',
        !isDragging && 'hover:shadow-xl hover:shadow-accent-blue/20'
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 cursor-pointer mt-1',
            'transition-all duration-200 flex items-center justify-center',
            isCompleted
              ? 'bg-accent-green border-accent-green'
              : 'border-placeholder hover:border-primary'
          )}
          onClick={() => onToggleComplete(task.id)}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'text-sm sm:text-[15px] font-semibold text-primary transition-all duration-base',
              isCompleted && 'line-through text-placeholder'
            )}
          >
              {sanitize(task.title)}
          </h4>

          {task.description && (
            <p className="text-xs text-placeholder mt-1 line-clamp-2 leading-relaxed">
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
                    ? 'text-accent-red'
                    : dueDateStatus === 'today'
                    ? 'text-accent-yellow'
                    : 'text-placeholder'
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
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors text-placeholder hover:text-primary"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-accent-red/20 transition-colors text-placeholder hover:text-accent-red"
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
          <GripVertical className="w-4 h-4 text-placeholder" />
        </div>
      </div>
    </motion.div>
  );
}
