import * as React from 'react';
import { cn } from './utils';

export function Textarea({
    className,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className = {cn(
                'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 resize-none disabled:opacity-50',
            className
            )}
            {...props}
        />
    );
}

