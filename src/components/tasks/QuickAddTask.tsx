'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TaskFormModal } from './TaskFormModal';
import { TaskFormData } from '@/types';
import { useTasks } from '@/hooks/useTasks';

const quickAddSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export function QuickAddTask() {
  const [showFullForm, setShowFullForm] = useState(false);
  const { addTask } = useTasks();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ title: string }>({
    resolver: zodResolver(quickAddSchema),
  });

  const onQuickSubmit = async (data: { title: string }) => {
    await addTask({
      title: data.title,
      priority: 'medium',
      notify_before: 15,
    });
    reset();
  };

  const onFullSubmit = async (data: TaskFormData) => {
    await addTask(data);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="glass-strong rounded-2xl p-2">
          <form onSubmit={handleSubmit(onQuickSubmit)} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Add a task... (press Enter)"
                className="bg-transparent border-none text-lg py-4 pl-4 pr-12"
                {...register('title')}
                error={errors.title?.message}
              />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
            <Button
              type="submit"
              loading={isSubmitting}
              className="px-6"
              size="lg"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setShowFullForm(true)}
          className="absolute right-0 top-full mt-2 text-sm text-slate-400 hover:text-primary transition-colors"
        >
          Need more details? Add full task
        </button>
      </motion.div>

      <TaskFormModal
        isOpen={showFullForm}
        onClose={() => setShowFullForm(false)}
        onSubmit={onFullSubmit}
      />
    </>
  );
}
