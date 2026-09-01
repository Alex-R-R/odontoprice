import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' }) {
  return <span data-slot="badge" className={cn('inline-flex h-5 w-fit items-center justify-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap', variant === 'outline' && 'border-border text-foreground', variant === 'secondary' && 'bg-secondary text-secondary-foreground', variant === 'destructive' && 'bg-red-50 text-red-700', variant === 'ghost' && 'text-muted-foreground', variant === 'link' && 'text-primary underline', variant === 'default' && 'bg-primary text-primary-foreground', className)} {...props} />;
}
export { Badge };
