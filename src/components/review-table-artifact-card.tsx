import React from 'react';
import { cn } from '@/lib/utils';
import { Table2, FileText } from 'lucide-react';
import Image from 'next/image';

interface ReviewTableArtifactCardProps {
  title: string;
  subtitle: string;
  variant?: 'large' | 'small';
  isSelected?: boolean;
  className?: string;
  onClick?: () => void;
  iconType?: 'table' | 'file';
  showSources?: boolean;
}

export function ReviewTableArtifactCard({
  title,
  subtitle,
  variant = 'large',
  isSelected = false,
  className,
  onClick,
  iconType = 'table',
  showSources = false,
}: ReviewTableArtifactCardProps) {
  const isSmall = variant === 'small';
  const shouldShowSources = showSources && iconType === 'file';

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
          
          {shouldShowSources ? (
            <div className="flex items-center gap-2">
              {/* Facepile avatars */}
              <div className="flex -space-x-1.5">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center border-[1px] border-white overflow-hidden z-[3]">
                  <Image src="/lexis.svg" alt="LexisNexis" width={16} height={16} className="w-full h-full object-cover" />
                </div>
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center border-[1.5px] border-white overflow-hidden z-[2]">
                  <Image src="/EDGAR.svg" alt="EDGAR" width={16} height={16} className="w-full h-full object-cover" />
                </div>
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center border-[1.5px] border-white overflow-hidden z-[1]">
                  <Image src="/bloomberg.jpg" alt="Bloomberg" width={16} height={16} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-xs text-neutral-600">6 sources from LexisNexis, EDGAR, and more</span>
            </div>
          ) : (
            <p className={cn(
              "text-neutral-600",
              isSmall ? "text-xs" : "text-sm"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Icon - only show for large variant */}
        {!isSmall && (
          <div className="bg-neutral-200 rounded-md p-1 flex items-center justify-center w-8 h-8">
            {iconType === 'file' ? (
              <FileText className="w-4 h-4 text-neutral-600" />
            ) : (
              <Table2 className="w-4 h-4 text-neutral-600" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewTableArtifactCard; 