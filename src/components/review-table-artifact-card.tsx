import React from 'react';
import { cn } from '@/lib/utils';

interface ReviewTableArtifactCardProps {
  title: string;
  subtitle: string;
  variant?: 'large' | 'small';
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ReviewTableArtifactCard({
  title,
  subtitle,
  variant = 'large',
  isSelected = false,
  className,
  onClick,
}: ReviewTableArtifactCardProps) {
  const isSmall = variant === 'small';

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all duration-200 cursor-pointer",
        isSelected 
          ? "bg-neutral-100 border-neutral-300" 
          : "bg-white border-neutral-200 hover:border-neutral-300",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[14px] font-medium text-neutral-900">
            {title}
          </h3>
          
          <p className={cn(
            "text-neutral-600",
            isSmall ? "text-xs" : "text-sm"
          )}>
            {subtitle}
          </p>
        </div>
        
        {/* Table Icon - only show for large variant */}
        {!isSmall && (
          <div className="bg-neutral-200 rounded-md p-1 flex items-center justify-center w-8 h-8">
            <img 
              src="/table-filled.svg" 
              alt="Table" 
              className="w-4 h-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewTableArtifactCard; 