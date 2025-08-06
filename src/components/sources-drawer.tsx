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
import { Skeleton } from "@/components/ui/skeleton";

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showOverlay?: boolean;
  variant?: "embedded" | "sheet" | "panel";
  isLoading?: boolean;
}

export default function SourcesDrawer({ 
  isOpen, 
  onClose, 
  showOverlay = false,
  variant = "embedded",
  isLoading = false 
}: SourcesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  const categorizedSources = {
    "Lexis Nexis": [
      {
        title: "Mendes v. Johnson, 389 A.2d 781 (D.C. 1978)",
        url: "",
        icon: "warning-shepard",
        description: "Addresses a landlord's right to reenter leased commercial premises and the limits of self-help eviction. The court...",
        references: [1, 2]
      },
      {
        title: "Sarete, Inc. v. 1344 U St. Ltd. P'ship, 871 A.2d 480 (D...",
        url: "",
        icon: "positive-shepard",
        description: "This case explores whether a commercial landlord's use of self-help to retake possession violated tenant rights...",
        references: [3, 4, 5]
      },
      {
        title: "Martinez v. Ulloa, 22 N.Y.S.3d 787 (N.Y.App. Term. 2015)",
        url: "",
        icon: "citing-references",
        description: "This case confirms that commercial landlords may face damages if self-help eviction violates procedural norms...",
        references: [9, 10]
      }
    ],
    "Web Sources": [
      {
        title: "Thomson Reuters",
        url: "thomsonreuters.com",
        icon: "reuters",
        description: "Often overlooked yet immensely significant, these notices pertain to state securities laws which mandate adheren...",
        references: [9, 10]
      },
      {
        title: "Bloomberg",
        url: "bloomberg.com",
        icon: "bloomberg",
        description: "Often overlooked yet immensely significant, these notices pertain to state securities laws which mandate adheren...",
        references: [9, 10]
      },
      {
        title: "Financial Times Adviser",
        url: "ftadviser.com",
        icon: "ft",
        description: "In May 2023 the then UK government announced its intention to introduce a statutory limit of three months o...",
        references: [9, 10]
      }
    ],
    "Files": [
      {
        title: "Discovery_Request_21083.pdf",
        url: "",
        icon: "pdf",
        description: "",
        references: [1, 2, 3]
      },
      {
        title: "Probable Cause Hearing Transcripts.pdf",
        url: "",
        icon: "pdf",
        description: "",
        references: [1, 2, 3]
      },
      {
        title: "tmp_lease_document2023621.pdf",
        url: "",
        icon: "pdf",
        description: "",
        references: [4, 5]
      },
      {
        title: "AD08912631234.pdf",
        url: "",
        icon: "pdf",
        description: "",
        references: [6, 7, 8]
      },
      {
        title: "policy_document_12_24_08.pdf",
        url: "",
        icon: "pdf",
        description: "",
        references: [9, 10, 11]
      },
      {
        title: "SEC_Filing_10-K_2023.pdf",
        url: "",
        icon: "pdf",
        description: "",
        references: [12, 13]
      }
    ]
  };

  // Skeleton loader content
  const skeletonContent = (
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
      
      {/* Search and Filter Section - Keep active even in loading state */}
      <div className="px-0.5 pb-2">
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
              disabled={true}
            />
          </div>
          
          {/* Filter Dropdown */}
          <button 
            disabled
            className="flex items-center gap-1 px-3 h-8 bg-white border border-neutral-200 rounded-md opacity-50 cursor-not-allowed"
          >
            <span className="text-sm text-neutral-900">All</span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
      </div>
      
      {/* Separator after search section */}
      <div className="border-t border-neutral-200 -mx-4 mb-4" />
      
      {/* Skeleton Sources List */}
      <div className="space-y-3 px-0.5 mt-2">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div key={index} className="border-b border-neutral-100 pb-3 last:border-b-0">
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton width={16} height={16} className="rounded" />
                  <Skeleton width={96} height={12} />
                  <Skeleton width={4} height={4} className="rounded-full" />
                  <Skeleton width={128} height={12} />
                </div>
                <div className="space-y-1.5 mb-3">
                  <Skeleton width="100%" height={12} />
                  <Skeleton width="100%" height={12} />
                  <Skeleton width="75%" height={12} />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton width={14} height={14} className="rounded" />
                  <Skeleton width={14} height={14} className="rounded" />
                  <Skeleton width={14} height={14} className="rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See all link skeleton */}
      <div className="mt-6 pt-4 border-t border-neutral-200 -mx-4 px-4">
        <div className="px-0.5">
          <Skeleton width={64} height={16} />
        </div>
      </div>
    </>
  );

  // Helper function to render source icons
  const renderSourceIcon = (iconType: string) => {
    switch (iconType) {
      case "warning-shepard":
        return (
          <img src="/warning-shepard.svg" alt="Warning" className="w-4 h-4" />
        );
      case "positive-shepard":
        return (
          <img src="/positive-shepard.svg" alt="Positive" className="w-4 h-4" />
        );
      case "citing-references":
        return (
          <img src="/citing-references-shepard.svg" alt="Citing References" className="w-4 h-4" />
        );
      case "web":
        return (
          <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">W</span>
          </div>
        );
      case "reuters":
        return (
          <img src="/reuters-logo.jpg" alt="Thomson Reuters" className="w-4 h-4 rounded object-cover" />
        );
      case "bloomberg":
        return (
          <img src="/bloomberg.jpg" alt="Bloomberg" className="w-4 h-4 rounded object-cover" />
        );
      case "ft":
        return (
          <img src="/fin-time-logo.png" alt="Financial Times" className="w-4 h-4 rounded object-cover" />
        );
      case "pdf":
        return (
          <div className="w-4 h-4 flex items-center justify-center">
            <img src="/pdf-icon.svg" alt="PDF" className="w-5 h-5" />
          </div>
        );
      default:
        return null;
    }
  };

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
      <div className="px-0.5 pb-4">
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
      
      {/* Separator after search section */}
      <div className="border-t border-neutral-200 -mx-4 mb-4" />
      
      {/* Categorized Sources List */}
      <div className="mt-2">
        {Object.entries(categorizedSources).map(([category, sources], categoryIndex) => (
          <div key={category}>
            {categoryIndex > 0 && (
              <div className="border-t border-neutral-200 my-4 -mx-4" />
            )}
            <div className="px-0.5">
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xs font-medium text-neutral-500">{category}</h3>
              </div>
              
              {/* Sources in Category */}
              <div className="space-y-0.5">
                {sources.map((source, index) => {
                  const isWebSource = category === "Web Sources" && source.url;
                  const content = (
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {renderSourceIcon(source.icon)}
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
                        {source.description && (
                          <p className="text-neutral-700 leading-relaxed mb-2" style={{ fontSize: '12px' }}>
                            {source.description}
                          </p>
                        )}
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
                  );

                  if (isWebSource) {
                    return (
                      <a
                        key={index}
                        href={`https://${source.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="-mx-2 px-2 py-2.5 hover:bg-neutral-50 rounded-md transition-colors cursor-pointer block"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div key={index} className="-mx-2 px-2 py-2.5 hover:bg-neutral-50 rounded-md transition-colors cursor-pointer">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See all link */}
      <div className="mt-6 pt-4 border-t border-neutral-200 -mx-4 px-4">
        <div className="px-0.5">
          <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1">
            See all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  // Panel variant - just returns the content without wrapper
  if (variant === "panel") {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent" style={{ width: '400px' }}>
          {isLoading ? skeletonContent : sourcesContent}
        </div>
      </div>
    );
  }

  // Sheet variant - opens as a separate panel
  if (variant === "sheet") {
    return (
      <Sheet open={isOpen} onOpenChange={onClose} modal={false}>
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
            {isLoading ? skeletonContent : sourcesContent}
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
              {isLoading ? (
                <>
                  {/* Debug indicator */}
                  <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Loading sources...
                  </div>
                  {skeletonContent}
                </>
              ) : sourcesContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 