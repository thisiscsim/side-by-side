"use client";

import { ListFilter, Cog } from "lucide-react";
import { SmallButton } from "@/components/ui/button";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReviewTableToolbarProps {
  chatOpen: boolean;
  onToggleChat: () => void;
  onCloseArtifact?: () => void;
}

export default function ReviewTableToolbar({ chatOpen, onToggleChat, onCloseArtifact }: ReviewTableToolbarProps) {
  // State for alignment options
  const [alignment, setAlignment] = useState<'top' | 'center' | 'bottom'>('top');
  
  // State for text overflow/wrapping
  const [textDisplay, setTextDisplay] = useState<'overflow' | 'wrapping'>('overflow');
  
  // State for concise/extend
  const [textLength, setTextLength] = useState<'concise' | 'extend'>('concise');

  return (
    <TooltipProvider>
      <div className="px-3 py-3 border-b border-neutral-200 bg-white flex items-center justify-between" style={{ height: '52px' }}>
        <div className="flex items-center gap-2">
          {/* Toggle Chat Button */}
          <SmallButton
            onClick={onToggleChat}
            variant="secondary"
            className={chatOpen ? "bg-neutral-100" : ""}
            icon={
              <img 
                src={chatOpen ? "/square-asterisk-filled.svg" : "/square-asterisk-outline.svg"}
                alt="Harvey" 
                width={14} 
                height={14} 
                className="text-neutral-700"
                style={{ filter: chatOpen ? 'none' : 'brightness(0) saturate(100%) invert(38%) sepia(8%) saturate(664%) hue-rotate(314deg) brightness(96%) contrast(92%)' }}
              />
            }
          >
            Ask Harvey
          </SmallButton>
          
          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>
          
          {/* Filter Button */}
          <SmallButton
            icon={<ListFilter size={14} />}
          >
            Filter
          </SmallButton>
          
          {/* Manage Columns Button */}
          <SmallButton
            icon={<Cog size={14} />}
          >
            Manage columns
          </SmallButton>
          
          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>
          
          {/* Alignment Options */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setAlignment('top')}
                  className={`p-2 rounded-md transition-colors ${
                    alignment === 'top' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src={alignment === 'top' ? '/top-align-filled.svg' : '/top-align-outline.svg'} 
                    alt="Top align" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Top align</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setAlignment('center')}
                  className={`p-2 rounded-md transition-colors ${
                    alignment === 'center' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src={alignment === 'center' ? '/center-align-filled.svg' : '/center-align-outline.svg'} 
                    alt="Center align" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Center align</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setAlignment('bottom')}
                  className={`p-2 rounded-md transition-colors ${
                    alignment === 'bottom' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src={alignment === 'bottom' ? '/bottom-align-filled.svg' : '/bottom-align-outline.svg'} 
                    alt="Bottom align" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bottom align</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>
          
          {/* Text Display Options */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setTextDisplay('overflow')}
                  className={`p-2 rounded-md transition-colors ${
                    textDisplay === 'overflow' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src="/overflow.svg" 
                    alt="Text overflow" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text overflow</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setTextDisplay('wrapping')}
                  className={`p-2 rounded-md transition-colors ${
                    textDisplay === 'wrapping' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src="/wrapping.svg" 
                    alt="Text wrapping" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text wrapping</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>
          
          {/* Text Length Options */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setTextLength('concise')}
                  className={`p-2 rounded-md transition-colors ${
                    textLength === 'concise' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src="/concise.svg" 
                    alt="Concise" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Concise</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setTextLength('extend')}
                  className={`p-2 rounded-md transition-colors ${
                    textLength === 'extend' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <img 
                    src="/extend.svg" 
                    alt="Extend" 
                    width={16} 
                    height={16} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Extend</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Close button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={chatOpen ? onCloseArtifact : undefined}
                disabled={!chatOpen}
                className={`p-2 rounded-md transition-colors ${
                  chatOpen 
                    ? 'hover:bg-neutral-100 text-neutral-600' 
                    : 'text-neutral-300 cursor-not-allowed'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{chatOpen ? "Close" : "Open assistant to close artifact"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
} 