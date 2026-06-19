'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTasks } from '@/hooks/useTasks';

const quickAddSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export function QuickAddTask({ compact }: { compact?: boolean }) {
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

  return (
    <form onSubmit={handleSubmit(onQuickSubmit)} className="flex gap-2 items-start">
      <div className="flex-1 relative">
        <Input
          placeholder={compact ? 'Quick add a task...' : 'Add a task... (press Enter)'}
          className="bg-bg-base/10 border border-white/10 text-sm sm:text-base py-2.5 pl-3 pr-10 rounded-xl"
          {...register('title')}
          error={errors.title?.message}
        />
        <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-blue/60" />
      </div>
      <Button
        type="submit"
        loading={isSubmitting}
        size="sm"
        className="h-[42px] min-w-[44px]"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
