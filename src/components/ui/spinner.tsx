"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({
  size = "sm",
  className,
}: SpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  return (
    <div className={cn("relative", sizeMap[size])}>
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-white/20",
        className
      )} />
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin",
        className
      )} />
    </div>
  );
}