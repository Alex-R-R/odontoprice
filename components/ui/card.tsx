import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card" className={cn('group/card flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground', className)} {...props} />; }
function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-header" className={cn('grid gap-1 px-4 py-4', className)} {...props} />; }
function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-title" className={cn('font-medium leading-snug', className)} {...props} />; }
function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />; }
function CardAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-action" className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)} {...props} />; }
function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-content" className={cn('px-4', className)} {...props} />; }
function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-footer" className={cn('flex items-center border-t bg-muted/50 p-4', className)} {...props} />; }
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
