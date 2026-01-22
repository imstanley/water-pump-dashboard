import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
      outline: "bg-transparent hover:bg-accent/50 hover:text-accent-foreground shadow-soft border-0",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
      ghost: "hover:bg-accent/50 hover:text-accent-foreground",
    };
    
    const sizes = {
      default: "h-10 px-4 py-2 rounded-xl",
      sm: "h-9 rounded-xl px-3",
      lg: "h-11 rounded-xl px-8",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
