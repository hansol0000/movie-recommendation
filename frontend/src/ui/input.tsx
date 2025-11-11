import * as React from "react";
import { cn } from "./utils";

export function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type = {type}
      className = {cn(
        "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}