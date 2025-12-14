'use client';

import { useDynamicStatus } from '@/hooks/use-dynamic-status';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function DynamicStatusBar() {
  const { isVisible, content, icon: Icon, actions, hideStatus } = useDynamicStatus();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div
            className={cn(
                "flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-background/80 dark:bg-neutral-900/80 shadow-2xl shadow-black/20 backdrop-blur-md border border-border"
            )}
          >
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            <p className="text-sm font-medium whitespace-nowrap">{content}</p>

            {actions && actions.length > 0 && (
                <div className="flex items-center gap-1">
                    {actions.map((action, index) => (
                        <Button key={index} size="sm" variant="ghost" onClick={action.onClick}>
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
             <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={hideStatus}>
                <X className="h-4 w-4 text-muted-foreground" />
             </Button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
