"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showOverlay?: boolean;
  variant?: "embedded" | "sheet" | "panel";
}

export default function SourcesDrawer({ 
  isOpen, 
  onClose, 
  showOverlay = false,
  variant = "embedded" 
}: SourcesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  const sources = [
    {
      title: "Investopedia",
      url: "investopedia.com",
      favicon: "💰",
      description: "Regulation D (Reg D) is a Securities and Exchange Commission (SEC) regulation governing private placements...",
      references: [1, 2, 3]
    },
    {
      title: "eqvista",
      url: "eqvista.com",
      favicon: "⚖️",
      description: "Regulation D (Reg D) is a Securities and Exchange Commission (SEC) regulation governing private placements...",
      references: [1, 2, 3]
    },
    {
      title: "mischetti law",
      url: "mischettilaw.com",
      favicon: "📋",
      description: "Often overlooked yet immensely significant, these notices pertain to state securities laws which mandate adherence...",
      references: [4, 5, 6]
    },
    {
      title: "Shu Firm",
      url: "shufirm.com",
      favicon: "💼",
      description: "The issuer must provide information to non-accredited investors (not accredited investors) that is generally equivalent...",
      references: [4, 5, 6]
    },
    {
      title: "Perkins Law",
      url: "ericperkinslaw.com",
      favicon: "🏛️",
      description: "The issuer must provide information to non-accredited investors (not accredited investors) that is generally equivalent...",
      references: [4, 5, 6]
    },
    {
      title: "Wickard v. Filburn, 317 U.S. 111 (1942)",
      url: "",
      favicon: "⚖️",
      description: "A landmark decision holding that even personal cultivation of wheat intended for private use could be regulated...",
      references: [4, 5, 6]
    }
  ];

  const sourcesContent = (
    <>
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background: rgba(163, 163, 163, 0.5);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 163, 163, 0.7);
        }
      `}</style>
      
      {/* Search and Filter Section */}
      <div className="px-2 pb-2">
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search sources"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm text-neutral-900 h-8 shadow-none"
            />
          </div>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 h-8 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                <span className="text-sm text-neutral-900">{filterType}</span>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setFilterType("All")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("Legal")}>
                Legal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("Business")}>
                Business
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("Cases")}>
                Cases
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Sources List */}
      <div className="space-y-3 px-2 mt-2">
        {sources.map((source, index) => (
          <div key={index} className="border-b border-neutral-100 pb-3 last:border-b-0">
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 text-sm flex items-center justify-center" role="img" aria-label="Source icon">
                    {source.favicon}
                  </div>
                  <h4 className="font-medium text-neutral-900" style={{ fontSize: '12px' }}>
                    {source.title}
                  </h4>
                  {source.url && (
                    <>
                      <span className="text-neutral-400" style={{ fontSize: '12px' }}>•</span>
                      <span className="text-neutral-600" style={{ fontSize: '12px' }}>
                        {source.url}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-3" style={{ fontSize: '12px' }}>
                  {source.description}
                </p>
                <div className="flex items-center gap-1">
                  {source.references.map((ref, refIndex) => (
                    <button
                      key={refIndex}
                      className="inline-flex items-center justify-center border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
                      style={{ 
                        width: '14px', 
                        height: '14px',
                        fontSize: '10px',
                        lineHeight: '1',
                        borderRadius: '4px'
                      }}
                    >
                      {ref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See all link */}
      <div className="mt-6 pt-4 border-t border-neutral-100 px-2">
        <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1">
          See all
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </>
  );

  // Panel variant - just returns the content without wrapper
  if (variant === "panel") {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent" style={{ width: '400px' }}>
          {sourcesContent}
        </div>
      </div>
    );
  }

  // Sheet variant - opens as a separate panel
  if (variant === "sheet") {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0 flex flex-col" showOverlay={false} forceMount>
          {/* Hidden title for accessibility */}
          <SheetTitle className="sr-only">Sources</SheetTitle>
          {/* Header - Matching panel variant */}
          <div className="px-3 py-4 border-b border-neutral-200 flex items-center justify-between" style={{ height: '52px' }}>
            <p className="text-neutral-900 font-medium truncate mr-4">Sources</p>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <X size={16} className="text-neutral-600" />
            </button>
          </div>
          
          {/* Content with custom scrollbar */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent">
            {sourcesContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Embedded variant - current behavior
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Optional */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-black bg-opacity-20 z-40"
              onClick={onClose}
            />
          )}
          
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              mass: 0.8
            }}
            className="absolute top-0 right-0 h-full bg-white border-l border-neutral-200 z-50 flex flex-col"
            style={{ width: "min(400px, 100%)", maxWidth: "400px" }}
          >
            {/* Header - Matching existing headers */}
            <div className="px-3 py-4 border-b border-neutral-200 flex items-center justify-between" style={{ height: '52px' }}>
              <p className="text-neutral-900 font-medium truncate mr-4">Sources</p>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X size={16} className="text-neutral-600" />
              </button>
            </div>
            
            {/* Content with custom scrollbar */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent">
              {sourcesContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 