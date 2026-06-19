'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Flag, TextCursorInput } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Task, TaskFormData } from '@/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  notify_before: z.number().min(0).max(1440),
});

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  editTask?: Task | null;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  editTask,
}: TaskFormModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      notify_before: 15,
    },
  });

  useEffect(() => {
    if (editTask) {
      reset({
        title: editTask.title,
        description: editTask.description || '',
        due_date: editTask.due_date ? editTask.due_date.split('T')[0] : '',
        priority: editTask.priority,
        notify_before: editTask.notify_before,
      });
    } else {
      reset({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        notify_before: 15,
      });
    }
  }, [editTask, reset, isOpen]);

  const handleFormSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editTask ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="glass rounded-xl p-panel space-y-4">
          <div className="flex items-center gap-2 text-secondary text-sm font-medium">
            <TextCursorInput className="w-4 h-4 text-primary" />
            Task details
          </div>
          <Input
            label="Title"
            placeholder="What needs to be done?"
            {...register('title')}
            error={errors.title?.message}
          />

          <Textarea
            label="Description (optional)"
            placeholder="Add more details..."
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-panel space-y-3">
            <div className="flex items-center gap-2 text-secondary text-sm font-medium">
              <CalendarDays className="w-4 h-4 text-accent" />
              Schedule
            </div>
            <Input
              label="Due Date"
              type="date"
              {...register('due_date')}
            />
          </div>

          <div className="glass rounded-xl p-panel space-y-3">
            <div className="flex items-center gap-2 text-secondary text-sm font-medium">
              <Flag className="w-4 h-4 text-secondary" />
              Priority & Alert
            </div>
            <Select label="Priority" {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>

            <Select
              label="Notify me"
              {...register('notify_before', { valueAsNumber: true })}
            >
              <option value={0}>At due time</option>
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {editTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
