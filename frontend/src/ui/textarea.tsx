import * as React from 'react';
import { cn } from './utils';

export function Textarea({
    className,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className = {cn(
                'block w-full min-h-[80px] resize-none rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-[13px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
            className
            )}
            {...props}
        />
    );
}
