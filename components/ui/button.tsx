import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = ({ variant = 'default', size = 'default' }: { variant?: string; size?: string } = {}) => cn(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-teal-700/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  variant === 'outline' && 'border-border bg-background hover:bg-muted',
  variant === 'secondary' && 'bg-secondary text-secondary-foreground',
  variant === 'ghost' && 'hover:bg-muted hover:text-foreground',
  variant === 'destructive' && 'bg-red-50 text-red-700 hover:bg-red-100',
  variant === 'link' && 'text-primary underline-offset-4 hover:underline',
  variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/85',
  size === 'xs' && 'h-6 rounded-md px-2 text-xs',
  size === 'sm' && 'h-7 rounded-md px-2.5 text-xs',
  size === 'icon' && 'size-8',
  size === 'icon-sm' && 'size-7',
  size === 'icon-lg' && 'size-9',
  !['xs', 'sm', 'icon', 'icon-sm', 'icon-lg'].includes(size) && 'h-8 px-2.5',
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'; size?: 'default' | 'xs' | 'sm' | 'icon' | 'icon-sm' | 'icon-lg' };
function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) { return <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />; }
export { Button, buttonVariants };
