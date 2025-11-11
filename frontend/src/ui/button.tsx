import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400",
  {
    variants : {
      variant : {
        default : "bg-blue-600 text-white hover:bg-blue-700",
        outline :
          "border border-blue-200 bg-white text-gray-700 hover:bg-blue-50",
        secondary :
          "bg-blue-100 text-blue-700 hover:bg-blue-200",
        ghost : "hover:bg-blue-50 text-gray-700",
        link : "text-blue-600 underline-offset-4 hover:underline"
      },
      size : {
        default: "h-10 px-5",
        sm : "h-8 px-3 text-sm",
        lg : "h-12 px-6 text-base"
      },
    },
    defaultVariants : {
      variant : "default",
      size : "default"
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref = {ref}
        className = {cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";