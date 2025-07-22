"use client";

import { use } from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import SourcesDrawer from "@/components/sources-drawer";
import ShareThreadDialog from "@/components/share-thread-dialog";
import ShareArtifactDialog from "@/components/share-artifact-dialog";
import ExportThreadDialog from "@/components/export-thread-dialog";
import ExportReviewDialog from "@/components/export-review-dialog";
import ReviewTableToolbar from "@/components/review-table-toolbar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import ReviewTableArtifactCard from "@/components/review-table-artifact-card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'artifact';
  artifactData?: {
    title: string;
    subtitle: string;
  };
};

// Shared animation configuration for consistency - refined timing
const PANEL_ANIMATION = {
  duration: 0.3,
  ease: "easeOut" as const
};

// In a real app, this would fetch from an API based on the chatId
const getChatTitle = (chatId: string): string => {
  const chatTitles: { [key: string]: string } = {
    'key-terms-provisions-clauses-property-us': 'Key terms, provisions and clauses to sell property in the U.S.',
    // Add more mappings as needed
  };
  
  return chatTitles[chatId] || 'Chat';
};

export default function AssistantChatPage({
  params
}: {
  params: Promise<{ chatId: string }>
}) {
  // Unwrap params using React.use()
  const { chatId } = use(params);
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('initialMessage');
  
  // Sidebar control hook
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Use the initial message as the title if it's a new chat
  const chatTitle = getChatTitle(chatId) === 'Chat' && initialMessage ? initialMessage : getChatTitle(chatId);
  
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(401);
  const [isResizing, setIsResizing] = useState(false);
  const [isHoveringResizer, setIsHoveringResizer] = useState(false);
  const [sourcesDrawerOpen, setSourcesDrawerOpen] = useState(false);
  const [shareThreadDialogOpen, setShareThreadDialogOpen] = useState(false);
  const [shareArtifactDialogOpen, setShareArtifactDialogOpen] = useState(false);
  const [exportThreadDialogOpen, setExportThreadDialogOpen] = useState(false);
  const [exportReviewDialogOpen, setExportReviewDialogOpen] = useState(false);
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<{ title: string; subtitle: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialMessageRef = useRef(false);
  
  // Track if chat panel is being toggled interactively (not on mount)
  const [isChatToggling, setIsChatToggling] = useState(false);
  
  // Track if we've already auto-collapsed the sidebar for this artifact session
  const hasAutoCollapsedSidebarRef = useRef(false);
  
  // Check if we're coming from the assistant homepage
  const [isFromHomepage] = useState(() => {
    if (typeof window !== 'undefined') {
      const fromHomepage = sessionStorage.getItem('fromAssistantHomepage') === 'true';
      if (fromHomepage) {
        sessionStorage.removeItem('fromAssistantHomepage');
      }
      return fromHomepage;
    }
    return false;
  });

  // Track if animations have already been played to prevent replaying on chat panel toggle
  const hasPlayedAnimationsRef = useRef(false);

  // Add states for editing titles
  const [isEditingChatTitle, setIsEditingChatTitle] = useState(false);
  const [editedChatTitle, setEditedChatTitle] = useState(chatTitle);
  const [currentChatTitle, setCurrentChatTitle] = useState(chatTitle);
  const [isEditingArtifactTitle, setIsEditingArtifactTitle] = useState(false);
  const [editedArtifactTitle, setEditedArtifactTitle] = useState(selectedArtifact?.title || '');
  const chatTitleInputRef = useRef<HTMLInputElement>(null);
  const artifactTitleInputRef = useRef<HTMLInputElement>(null);

  const MIN_CHAT_WIDTH = 400;
  const MAX_CHAT_WIDTH = 800;

  // Process initial message when component mounts
  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessageRef.current) {
      hasProcessedInitialMessageRef.current = true;
      // Add the user message
      setMessages([{ role: 'user', content: initialMessage, type: 'text' }]);
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Here is a review table extracting terms from the industrial merger agreements as requested',
          type: 'artifact',
          artifactData: {
            title: 'Extraction of Agreements and Provisions',
            subtitle: '24 columns · 104 rows'
          }
        }]);
        
        // Auto-expand sources drawer for first-time users from homepage
        if (isFromHomepage) {
          setTimeout(() => {
            setSourcesDrawerOpen(true);
          }, 500); // Small delay after the AI response is rendered
        }
      }, 1000);
    }
  }, [initialMessage, isFromHomepage]);

  // Update edited artifact title when selected artifact changes
  useEffect(() => {
    if (selectedArtifact) {
      setEditedArtifactTitle(selectedArtifact.title);
    }
  }, [selectedArtifact]);

  // Handle saving chat title
  const handleSaveChatTitle = () => {
    if (editedChatTitle.trim()) {
      if (editedChatTitle !== currentChatTitle) {
        setCurrentChatTitle(editedChatTitle);
        toast.success("Chat title updated");
      }
    } else {
      setEditedChatTitle(currentChatTitle);
    }
    setIsEditingChatTitle(false);
  };

  // Handle saving artifact title
  const handleSaveArtifactTitle = () => {
    if (editedArtifactTitle.trim() && selectedArtifact) {
      if (editedArtifactTitle !== selectedArtifact.title) {
        // Update the selected artifact
        setSelectedArtifact({
          ...selectedArtifact,
          title: editedArtifactTitle
        });
        
        // Also update the title in the messages array
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.type === 'artifact' && msg.artifactData?.title === selectedArtifact.title) {
              return {
                ...msg,
                artifactData: {
                  ...msg.artifactData,
                  title: editedArtifactTitle
                }
              };
            }
            return msg;
          })
        );
        
        toast.success("Artifact title updated");
      }
    } else if (selectedArtifact) {
      setEditedArtifactTitle(selectedArtifact.title);
    }
    setIsEditingArtifactTitle(false);
  };

  // Handle clicking outside of input fields
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatTitleInputRef.current && !chatTitleInputRef.current.contains(event.target as Node)) {
        handleSaveChatTitle();
      }
      if (artifactTitleInputRef.current && !artifactTitleInputRef.current.contains(event.target as Node)) {
        handleSaveArtifactTitle();
      }
    };

    if (isEditingChatTitle || isEditingArtifactTitle) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditingChatTitle, isEditingArtifactTitle, editedChatTitle, editedArtifactTitle]);

  // Auto-collapse sidebar when artifact panel opens
  // Note: This is a one-time auto-collapse for space optimization.
  // Users can still manually expand the sidebar afterward using the avatar button,
  // sidebar rail, or keyboard shortcut (Cmd/Ctrl + B).
  useEffect(() => {
    if (artifactPanelOpen && !hasAutoCollapsedSidebarRef.current) {
      setSidebarOpen(false);
      hasAutoCollapsedSidebarRef.current = true;
    } else if (!artifactPanelOpen) {
      // Reset the flag when artifact panel closes
      hasAutoCollapsedSidebarRef.current = false;
    }
  }, [artifactPanelOpen, setSidebarOpen]);

  // Reset chat toggling flag when chat closes
  useEffect(() => {
    if (!chatOpen && isChatToggling) {
      setIsChatToggling(false);
    }
  }, [chatOpen, isChatToggling]);

  const toggleChat = (open: boolean) => {
    console.log('Toggling chat to:', open);
    setIsChatToggling(true);
    setChatOpen(open);
  };

  const sendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { role: 'user', content: inputValue, type: 'text' }]);
      setInputValue('');
      
      // Reset textarea height
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = '60px'; // Reset to minHeight
      }
      
      // Simulate AI response with artifact (you can replace this with actual AI integration)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Here is a review table extracting terms from the industrial merger agreements as requested',
          type: 'artifact',
          artifactData: {
            title: 'Extraction of Agreements and Provisions',
            subtitle: '24 columns · 104 rows'
          }
        }]);
      }, 1000);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!artifactPanelOpen) return;
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let newWidth = e.clientX - containerRect.left;
        
        // Enforce min/max constraints
        newWidth = Math.max(MIN_CHAT_WIDTH, Math.min(newWidth, MAX_CHAT_WIDTH));
        
        setChatWidth(newWidth + 1); // +1 to account for the border
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Add class to body to maintain cursor during drag
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <SidebarInset>
        <div ref={containerRef} className="h-screen flex text-sm" style={{ fontSize: '14px', lineHeight: '20px' }}>
          {/* AI Chat Interface - Left Panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div 
                initial={isChatToggling ? { width: 0, opacity: 0 } : false}
                animate={{ 
                  width: artifactPanelOpen ? chatWidth : (sourcesDrawerOpen && !artifactPanelOpen ? 'calc(100% - 400px)' : '100%'),
                  opacity: 1
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={!isResizing ? {
                  width: PANEL_ANIMATION,
                  opacity: { duration: 0.15, ease: "easeOut" }
                } : { duration: 0 }}
                onAnimationComplete={() => {
                  if (isChatToggling) {
                    setIsChatToggling(false);
                  }
                }}
                className="flex relative overflow-hidden bg-white"
                style={{ 
                  flexShrink: 0
                }}
              >
        <div className="flex flex-col bg-white relative" style={{ 
          width: artifactPanelOpen ? chatWidth - 1 : '100%',
          minWidth: 0
        }}>
          {/* Sources Drawer - Embedded variant when artifact panel is open */}
          {artifactPanelOpen && (
            <SourcesDrawer 
              isOpen={sourcesDrawerOpen} 
              onClose={() => setSourcesDrawerOpen(false)}
              variant="embedded"
            />
          )}
          {/* Header */}
          <motion.div 
            className="px-3 py-4 border-b border-neutral-200 flex items-center justify-between" 
            style={{ height: '52px' }}
            initial={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { delay: 0.5, duration: 0.5 } : {}}
          >
            {/* Editable Chat Title */}
            {isEditingChatTitle ? (
              <input
                ref={chatTitleInputRef}
                type="text"
                value={editedChatTitle}
                onChange={(e) => setEditedChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveChatTitle();
                  }
                }}
                onFocus={(e) => {
                  // Move cursor to start and scroll to beginning
                  setTimeout(() => {
                    e.target.setSelectionRange(0, 0);
                    e.target.scrollLeft = 0;
                  }, 0);
                }}
                className="text-neutral-900 font-medium bg-neutral-100 border border-neutral-400 outline-none px-2 py-1 -ml-2 rounded-sm mr-4"
                style={{ minWidth: '200px', maxWidth: '400px' }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setIsEditingChatTitle(true);
                  setEditedChatTitle(currentChatTitle);
                }}
                className="text-neutral-900 font-medium truncate mr-4 px-2 py-1 -ml-2 rounded-sm hover:bg-neutral-100 transition-colors cursor-pointer text-left"
                style={{ minWidth: 0 }}
              >
                {currentChatTitle}
              </button>
            )}
            
            {/* Conditional buttons based on artifact panel state */}
            {!artifactPanelOpen ? (
              // When artifact panel is collapsed, show full secondary buttons
              <div className="flex gap-2 items-center">
                <Button 
                  variant="secondary"
                  onClick={() => setShareThreadDialogOpen(true)}
                  className="gap-2"
                  style={{ height: '32px' }}
                >
                  <UserPlus size={16} />
                  <span>Share</span>
                </Button>
                <Button 
                  variant="secondary"
                  className="gap-2"
                  style={{ height: '32px' }}
                  onClick={() => setExportThreadDialogOpen(true)}
                >
                  <Download size={16} />
                  <span>Export</span>
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setSourcesDrawerOpen(!sourcesDrawerOpen)}
                  className={cn("gap-2", sourcesDrawerOpen && "bg-neutral-100")}
                  style={{ height: '32px' }}
                >
                  <img 
                    src={sourcesDrawerOpen ? "/book-filled.svg" : "/book-outline.svg"}
                    alt="Sources" 
                    width={16} 
                    height={16}
                  />
                  <span>Sources</span>
                </Button>
              </div>
            ) : (
              // When artifact panel is expanded, show dropdown menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-neutral-100 rounded-md transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                      <circle cx="5" cy="12" r="1"/>
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="19" cy="12" r="1"/>
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShareThreadDialogOpen(true)}>
                    <UserPlus size={16} className="mr-2" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setExportThreadDialogOpen(true)}>
                    <Download size={16} className="mr-2" />
                    <span>Export</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSourcesDrawerOpen(!sourcesDrawerOpen)}
                    className={sourcesDrawerOpen ? "bg-neutral-100" : ""}
                  >
                    <img 
                      src={sourcesDrawerOpen ? "/book-filled.svg" : "/book-outline.svg"}
                      alt="Sources" 
                      width={16} 
                      height={16}
                      className="mr-2"
                    />
                    <span>Sources</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
          
          {/* Messages Area */}
          <motion.div 
            className="flex-1 overflow-y-auto overflow-x-hidden p-4"
            initial={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { delay: 0.4, duration: 0.6 } : {}}
          >
            <div className="space-y-6 mx-auto" style={{ maxWidth: '740px' }}>
            {messages.length === 0 ? (
              <div className="text-center text-neutral-500 mt-8">
                <p>Start a conversation with Harvey</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img src="/harvey-avatar.svg" alt="Harvey" className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {message.type === 'artifact' ? (
                      <div className="space-y-3">
                        <div className="text-neutral-900 leading-relaxed">
                          {message.content}
                        </div>
                                                <ReviewTableArtifactCard
                          title={message.artifactData?.title || 'Artifact'}
                          subtitle={message.artifactData?.subtitle || ''}
                          variant={artifactPanelOpen ? 'small' : 'large'}
                          isSelected={artifactPanelOpen && selectedArtifact?.title === message.artifactData?.title}
                                                      onClick={() => {
                            // Open artifact panel and set selected artifact
                            setSelectedArtifact({
                              title: message.artifactData?.title || 'Artifact',
                              subtitle: message.artifactData?.subtitle || ''
                            });
                            setArtifactPanelOpen(true);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-neutral-900 leading-relaxed">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            </div>
          </motion.div>
          
          {/* Input Area - Animation simulating movement from center to bottom */}
          <motion.div 
            className="p-6 overflow-x-hidden"
            initial={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { y: "calc(-45vh + 120px)" } : {}}
            animate={{ y: 0 }}
            transition={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { 
              duration: 0.8,
              ease: [0.4, 0.0, 0.2, 1]
            } : {}}
            onAnimationComplete={() => {
              // Mark animations as played after the main animation completes
              if (initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current) {
                hasPlayedAnimationsRef.current = true;
              }
            }}
          >
            <div className="mx-auto" style={{ maxWidth: '832px' }}>
              <div className="p-4 transition-all duration-200 border border-transparent focus-within:border-neutral-300 bg-neutral-100" style={{ borderRadius: '12px' }}>
              {/* Textarea */}
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Request a revision or ask a question..."
                className="w-full bg-transparent focus:outline-none text-neutral-900 placeholder-neutral-500 resize-none overflow-hidden"
                style={{ 
                  fontSize: '14px', 
                  lineHeight: '20px',
                  minHeight: '60px',
                  maxHeight: '300px'
                }}
                rows={3}
              />
              
              {/* Controls Row */}
              <div className="flex items-center justify-between mt-3">
                {/* Left Controls */}
                <div className="flex items-center space-x-2">
                  {/* Paperclip Icon */}
                  <button className="text-neutral-600 hover:text-neutral-800 p-1 hover:bg-neutral-200 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>
                  
                  {/* Mic Icon */}
                  <button className="text-neutral-600 hover:text-neutral-800 p-1 hover:bg-neutral-200 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                  
                  {/* Image Icon */}
                  <button className="text-neutral-600 hover:text-neutral-800 p-1 hover:bg-neutral-200 rounded">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                  </button>
                </div>
                
                {/* Right Controls */}
                <div className="flex items-center space-x-2">
                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className={`p-2 focus:outline-none flex items-center justify-center transition-all bg-neutral-900 text-neutral-0 hover:bg-neutral-800 ${
                      !inputValue.trim() ? 'cursor-not-allowed' : ''
                    }`}
                    style={{ 
                      minWidth: '32px', 
                      minHeight: '32px',
                      borderRadius: '6px',
                      opacity: !inputValue.trim() ? 0.3 : 1
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
        
        {/* Resizable Separator - Only show when artifact panel is open */}
        {artifactPanelOpen && (
          <div 
            className="relative group"
            onMouseEnter={() => setIsHoveringResizer(true)}
            onMouseLeave={() => setIsHoveringResizer(false)}
            onMouseDown={handleMouseDown}
            style={{
              width: isHoveringResizer || isResizing ? '2px' : '1px',
              backgroundColor: isHoveringResizer || isResizing ? '#d4d4d4' : '#e5e5e5',
              cursor: 'col-resize',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {/* Invisible wider hit area for easier grabbing */}
            <div 
              className="absolute inset-y-0"
              style={{
                left: '-4px',
                right: '-4px',
                cursor: 'col-resize',
              }}
            />
          </div>
        )}
      </motion.div>
      )}
      </AnimatePresence>
      
      {/* Sources Panel - Shows when artifact panel is closed */}
      <AnimatePresence>
        {!artifactPanelOpen && sourcesDrawerOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              width: PANEL_ANIMATION,
              opacity: { duration: 0.15, ease: "easeOut" }
            }}
            className="h-full bg-white border-l border-neutral-200 flex flex-col overflow-hidden"
            style={{ 
              flexShrink: 0
            }}
          >
            {/* Header */}
            <div className="px-3 py-4 border-b border-neutral-200 flex items-center justify-between" style={{ height: '52px' }}>
              <p className="text-neutral-900 font-medium truncate mr-4">Sources</p>
              <button
                onClick={() => setSourcesDrawerOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X size={16} className="text-neutral-600" />
              </button>
            </div>
            
            {/* Sources Content */}
            <SourcesDrawer 
              isOpen={true} 
              onClose={() => setSourcesDrawerOpen(false)}
              variant="panel"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Artifact Panel - Right Panel */}
      <AnimatePresence>
        {artifactPanelOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              width: PANEL_ANIMATION,
              opacity: { duration: 0.15, ease: "easeOut" }
            }}
            className="flex-1 flex flex-col bg-neutral-50 overflow-hidden"
          >
          {/* Header */}
          <div className="px-3 py-4 border-b border-neutral-200 bg-neutral-0 flex items-center justify-between" style={{ height: '52px' }}>
            <div className="flex items-center gap-1.5">
              {/* Table Icon */}
                <img 
                  src="/table-outline.svg" 
                  alt="Table" 
                  className="w-[16px] h-[16px]"
                />
              {/* Editable Artifact Title */}
              {isEditingArtifactTitle ? (
                <input
                  ref={artifactTitleInputRef}
                  type="text"
                  value={editedArtifactTitle}
                  onChange={(e) => setEditedArtifactTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveArtifactTitle();
                    }
                  }}
                  onFocus={(e) => {
                    // Move cursor to start and scroll to beginning
                    setTimeout(() => {
                      e.target.setSelectionRange(0, 0);
                      e.target.scrollLeft = 0;
                    }, 0);
                  }}
                  className="text-neutral-900 font-medium bg-neutral-100 border border-neutral-400 outline-none px-2 py-1 -ml-1 rounded-sm"
                  style={{ minWidth: '200px', maxWidth: '400px' }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setIsEditingArtifactTitle(true);
                    setEditedArtifactTitle(selectedArtifact?.title || 'Artifact');
                  }}
                  className="text-neutral-900 font-medium px-2 py-1 -ml-1 rounded-sm hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  {selectedArtifact?.title || 'Artifact'}
                </button>
              )}
            </div>
            
                      <div className="flex gap-2 items-center">
            {/* Share Button */}
              <button 
                onClick={() => setShareArtifactDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-100 transition-colors text-neutral-900 text-sm font-normal" 
                style={{ height: '32px' }}
              >
                <UserPlus size={16} className="text-neutral-900" />
                <span className="text-sm font-normal">Share</span>
              </button>
              {/* Export Button */}
              <button className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-100 transition-colors text-neutral-900 text-sm font-normal" style={{ height: '32px' }}
                onClick={() => setExportReviewDialogOpen(true)}
              >
                <Download size={16} className="text-neutral-900" />
                <span className="text-sm font-normal">Export</span>
              </button>
            </div>
          </div>

                  {/* Toolbar */}
        <ReviewTableToolbar
          chatOpen={chatOpen}
          onToggleChat={() => {
            console.log('Toggle button clicked, current state:', chatOpen);
            toggleChat(!chatOpen);
          }}
          onCloseArtifact={() => {
            setArtifactPanelOpen(false);
            setSelectedArtifact(null);
          }}
        />
          
          {/* Content Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-400 text-sm">Artifact content goes here</p>
            </div>
          </div>
        </motion.div>
          )}
      </AnimatePresence>
      
      {/* Share Dialogs */}
      <ShareThreadDialog 
        isOpen={shareThreadDialogOpen} 
        onClose={() => setShareThreadDialogOpen(false)} 
      />
      <ShareArtifactDialog 
        isOpen={shareArtifactDialogOpen} 
        onClose={() => setShareArtifactDialogOpen(false)} 
        artifactTitle={selectedArtifact?.title || "Artifact"}
      />
      
      {/* Export Dialogs */}
      <ExportThreadDialog 
        isOpen={exportThreadDialogOpen} 
        onClose={() => setExportThreadDialogOpen(false)} 
      />
      <ExportReviewDialog 
        isOpen={exportReviewDialogOpen} 
        onClose={() => setExportReviewDialogOpen(false)} 
        artifactTitle={selectedArtifact?.title || "Review"}
      />
        </div>
      </SidebarInset>
    </div>
  );
} 