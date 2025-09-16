import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border-color bg-input-bg px-3 py-2 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-200',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

const Label = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-border-color bg-input-bg px-3 py-2 text-sm',
        'ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Input, Label, Textarea };