"use client";

import { use } from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Download, ArrowLeft, X, Plus, ListPlus, Settings2, Wand } from "lucide-react";
import SourcesDrawer from "@/components/sources-drawer";
import ShareThreadDialog from "@/components/share-thread-dialog";
import ShareArtifactDialog from "@/components/share-artifact-dialog";
import ExportThreadDialog from "@/components/export-thread-dialog";
import ExportReviewDialog from "@/components/export-review-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import ReviewTableArtifactCard from "@/components/review-table-artifact-card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import DraftArtifactPanel from "@/components/draft-artifact-panel";
import ReviewArtifactPanel from "@/components/review-artifact-panel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import FileManagementDialog from "@/components/file-management-dialog";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'artifact';
  artifactData?: {
    title: string;
    subtitle: string;
    variant?: 'review' | 'draft'; // Determines which panel to open
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
  const router = useRouter();
  
  // Sidebar control hook
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Hook to detect if viewport is above 2xl breakpoint (1536px)
  const [isAbove2xl, setIsAbove2xl] = useState(false);
  
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsAbove2xl(window.innerWidth >= 1536);
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);
  
  // Use the initial message as the title if it's a new chat
  const chatTitle = getChatTitle(chatId) === 'Chat' && initialMessage ? initialMessage : getChatTitle(chatId);
  
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  const [draftArtifactPanelOpen, setDraftArtifactPanelOpen] = useState(false);
  const [reviewArtifactPanelOpen, setReviewArtifactPanelOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<{ title: string; subtitle: string } | null>(null);
  const [selectedDraftArtifact, setSelectedDraftArtifact] = useState<{ title: string; subtitle: string } | null>(null);
  const [selectedReviewArtifact, setSelectedReviewArtifact] = useState<{ title: string; subtitle: string } | null>(null);
  
  // New unified artifact panel state
  const [unifiedArtifactPanelOpen, setUnifiedArtifactPanelOpen] = useState(false);
  const [currentArtifactType, setCurrentArtifactType] = useState<'draft' | 'review' | null>(null);
  const [isFileManagementOpen, setIsFileManagementOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialMessageRef = useRef(false);
  
  // Track if chat panel is being toggled interactively (not on mount)
  const [isChatToggling, setIsChatToggling] = useState(false);
  
  // Track if we've already auto-collapsed the sidebar for this artifact session
  const hasAutoCollapsedSidebarRef = useRef(false);
  
  // Check if any artifact panel is open
  const anyArtifactPanelOpen = artifactPanelOpen || draftArtifactPanelOpen || reviewArtifactPanelOpen || unifiedArtifactPanelOpen;
  
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

  // Track if source drawer has been opened once during the session
  const hasOpenedSourcesDrawerRef = useRef(false);

  // Add states for editing titles
  const [isEditingChatTitle, setIsEditingChatTitle] = useState(false);
  const [editedChatTitle, setEditedChatTitle] = useState(chatTitle);
  const [currentChatTitle, setCurrentChatTitle] = useState(chatTitle);
  const [isEditingArtifactTitle, setIsEditingArtifactTitle] = useState(false);
  const [editedArtifactTitle, setEditedArtifactTitle] = useState(selectedArtifact?.title || '');
  
  const [isEditingDraftArtifactTitle, setIsEditingDraftArtifactTitle] = useState(false);
  const [editedDraftArtifactTitle, setEditedDraftArtifactTitle] = useState(selectedDraftArtifact?.title || '');
  
  const [isEditingReviewArtifactTitle, setIsEditingReviewArtifactTitle] = useState(false);
  const [editedReviewArtifactTitle, setEditedReviewArtifactTitle] = useState(selectedReviewArtifact?.title || '');
  
  const chatTitleInputRef = useRef<HTMLInputElement>(null);
  const artifactTitleInputRef = useRef<HTMLInputElement>(null);
  const draftArtifactTitleInputRef = useRef<HTMLInputElement>(null);
  const reviewArtifactTitleInputRef = useRef<HTMLInputElement>(null);

  const MIN_CHAT_WIDTH = 400;
  const MAX_CHAT_WIDTH = 800;

  // Process initial message when component mounts
  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessageRef.current) {
      hasProcessedInitialMessageRef.current = true;
      // Add the user message
      setMessages([{ role: 'user', content: initialMessage, type: 'text' }]);
      setIsLoading(true);
      
      // Auto-expand sources drawer on first message (including after refresh)
      if (!hasOpenedSourcesDrawerRef.current) {
        setTimeout(() => {
          setSourcesDrawerOpen(true);
          hasOpenedSourcesDrawerRef.current = true;
        }, 1000); // Open drawer during AI thinking time
      }
      
      // Determine artifact type based on initial message keywords
          const messageText = initialMessage.toLowerCase();
    const isDraftArtifact = messageText.includes('draft') || messageText.includes('document');
      
      // Simulate AI response
      setTimeout(() => {
        if (isDraftArtifact) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Here is a draft document based on your request',
            type: 'artifact',
            artifactData: {
              title: 'Record of Deliberation',
              subtitle: 'Version 1',
              variant: 'draft'
            }
          }]);
        } else {
          // Default to review artifact for initial message
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Here is a review table extracting terms from the industrial merger agreements as requested',
            type: 'artifact',
            artifactData: {
              title: 'Extraction of Agreements and Provisions',
              subtitle: '24 columns · 104 rows',
              variant: 'review'
            }
          }]);
        }
        setIsLoading(false);
      }, 3500); // Increased to 3.5 seconds to simulate AI thinking time
    }
  }, [initialMessage, isFromHomepage]);

  // Update edited artifact title when selected artifact changes
  useEffect(() => {
    if (selectedArtifact) {
      setEditedArtifactTitle(selectedArtifact.title);
    }
  }, [selectedArtifact]);

  // Update edited draft artifact title when selected draft artifact changes
  useEffect(() => {
    if (selectedDraftArtifact) {
      setEditedDraftArtifactTitle(selectedDraftArtifact.title);
    }
  }, [selectedDraftArtifact]);

  // Update edited review artifact title when selected review artifact changes
  useEffect(() => {
    if (selectedReviewArtifact) {
      setEditedReviewArtifactTitle(selectedReviewArtifact.title);
    }
  }, [selectedReviewArtifact]);

  // Handle saving chat title
  const handleSaveChatTitle = useCallback(() => {
    if (editedChatTitle.trim()) {
      if (editedChatTitle !== currentChatTitle) {
        setCurrentChatTitle(editedChatTitle);
        toast.success("Chat title updated");
      }
    } else {
      setEditedChatTitle(currentChatTitle);
    }
    setIsEditingChatTitle(false);
  }, [editedChatTitle, currentChatTitle]);

  // Handle saving artifact title
  const handleSaveArtifactTitle = useCallback(() => {
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
  }, [editedArtifactTitle, selectedArtifact]);

  // Handle saving draft artifact title
  const handleSaveDraftArtifactTitle = useCallback(() => {
    if (editedDraftArtifactTitle.trim() && selectedDraftArtifact) {
      if (editedDraftArtifactTitle !== selectedDraftArtifact.title) {
        // Update the selected draft artifact
        setSelectedDraftArtifact({
          ...selectedDraftArtifact,
          title: editedDraftArtifactTitle
        });
        
        // Also update the title in the messages array
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.type === 'artifact' && msg.artifactData?.title === selectedDraftArtifact.title) {
              return {
                ...msg,
                artifactData: {
                  ...msg.artifactData,
                  title: editedDraftArtifactTitle
                }
              };
            }
            return msg;
          })
        );
        
        toast.success("Draft artifact title updated");
      }
    } else if (selectedDraftArtifact) {
      setEditedDraftArtifactTitle(selectedDraftArtifact.title);
    }
    setIsEditingDraftArtifactTitle(false);
  }, [editedDraftArtifactTitle, selectedDraftArtifact]);

  // Handle saving review artifact title
  const handleSaveReviewArtifactTitle = useCallback(() => {
    if (editedReviewArtifactTitle.trim() && selectedReviewArtifact) {
      if (editedReviewArtifactTitle !== selectedReviewArtifact.title) {
        // Update the selected review artifact
        setSelectedReviewArtifact({
          ...selectedReviewArtifact,
          title: editedReviewArtifactTitle
        });
        
        // Also update the title in the messages array
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.type === 'artifact' && msg.artifactData?.title === selectedReviewArtifact.title) {
              return {
                ...msg,
                artifactData: {
                  ...msg.artifactData,
                  title: editedReviewArtifactTitle
                }
              };
            }
            return msg;
          })
        );
        
        toast.success("Review artifact title updated");
      }
    } else if (selectedReviewArtifact) {
      setEditedReviewArtifactTitle(selectedReviewArtifact.title);
    }
    setIsEditingReviewArtifactTitle(false);
  }, [editedReviewArtifactTitle, selectedReviewArtifact]);

  // Handle clicking outside of input fields
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatTitleInputRef.current && !chatTitleInputRef.current.contains(event.target as Node)) {
        handleSaveChatTitle();
      }
      if (artifactTitleInputRef.current && !artifactTitleInputRef.current.contains(event.target as Node)) {
        handleSaveArtifactTitle();
      }
      if (draftArtifactTitleInputRef.current && !draftArtifactTitleInputRef.current.contains(event.target as Node)) {
        handleSaveDraftArtifactTitle();
      }
      if (reviewArtifactTitleInputRef.current && !reviewArtifactTitleInputRef.current.contains(event.target as Node)) {
        handleSaveReviewArtifactTitle();
      }
    };

    if (isEditingChatTitle || isEditingArtifactTitle || isEditingDraftArtifactTitle || isEditingReviewArtifactTitle) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditingChatTitle, isEditingArtifactTitle, isEditingDraftArtifactTitle, isEditingReviewArtifactTitle, editedChatTitle, editedArtifactTitle, editedDraftArtifactTitle, editedReviewArtifactTitle, handleSaveChatTitle, handleSaveArtifactTitle, handleSaveDraftArtifactTitle, handleSaveReviewArtifactTitle]);

  // Auto-collapse sidebar when artifact panel opens
  // Note: This is a one-time auto-collapse for space optimization.
  // Users can still manually expand the sidebar afterward using the avatar button,
  // sidebar rail, or keyboard shortcut (Cmd/Ctrl + B).
  useEffect(() => {
    if (anyArtifactPanelOpen && !hasAutoCollapsedSidebarRef.current) {
      setSidebarOpen(false);
      hasAutoCollapsedSidebarRef.current = true;
    } else if (!anyArtifactPanelOpen) {
      // Reset the flag when artifact panel closes
      hasAutoCollapsedSidebarRef.current = false;
    }
  }, [anyArtifactPanelOpen, setSidebarOpen]);

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
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.toLowerCase();
      setMessages([...messages, { role: 'user', content: inputValue, type: 'text' }]);
      setInputValue('');
      setIsLoading(true);
      
      // Reset textarea height
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = '60px'; // Reset to minHeight
      }
      
      // Open sources drawer only on the first message if not already opened
      if (!sourcesDrawerOpen && !hasOpenedSourcesDrawerRef.current) {
        setTimeout(() => {
          setSourcesDrawerOpen(true);
          hasOpenedSourcesDrawerRef.current = true;
        }, 1000); // Open drawer during AI thinking time
      }
      
      // Determine artifact type based on keywords
      const isDraftArtifact = userMessage.includes('draft') || userMessage.includes('document');
      const isReviewArtifact = userMessage.includes('review') || userMessage.includes('table');
      
      // Simulate AI response with artifact (you can replace this with actual AI integration)
      setTimeout(() => {
        if (isDraftArtifact || isReviewArtifact) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: isDraftArtifact 
              ? 'Here is a draft document based on your request'
              : 'Here is a review table extracting terms from the industrial merger agreements as requested',
            type: 'artifact',
            artifactData: {
              title: isDraftArtifact 
                ? 'Record of Deliberation'
                : 'Extraction of Agreements and Provisions',
              subtitle: isDraftArtifact 
                ? 'Version 1'
                : '24 columns · 104 rows',
              variant: isDraftArtifact ? 'draft' : 'review'
            }
          }]);
        } else {
          // Regular text response if no keywords match
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'I can help you with that. Please specify if you need a "draft" document or a "review" table.',
            type: 'text'
          }]);
        }
        setIsLoading(false);
      }, 3500); // Increased to 3.5 seconds to simulate AI thinking time
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!artifactPanelOpen && !draftArtifactPanelOpen && !reviewArtifactPanelOpen) return;
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
                  width: anyArtifactPanelOpen ? chatWidth : (sourcesDrawerOpen ? 'calc(100% - 400px)' : '100%'),
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
          width: anyArtifactPanelOpen ? chatWidth - 1 : '100%',
          minWidth: 0
        }}>

          {/* Header */}
          <motion.div 
            className="px-3 py-4 border-b border-neutral-200 flex items-center justify-between" 
            style={{ height: '52px' }}
            initial={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { delay: 0.5, duration: 0.5 } : {}}
          >
            {/* Back Button, Separator, and Editable Chat Title */}
            <div className="flex items-center flex-1 min-w-0">
              {/* Back Button */}
              <button
                onClick={() => router.push('/assistant')}
                className="p-2 hover:bg-neutral-100 rounded-md transition-colors mr-1"
              >
                <ArrowLeft size={16} className="text-neutral-600" />
              </button>
              
              {/* Vertical Separator */}
              <div className="w-px bg-neutral-200 mr-3" style={{ height: '20px' }}></div>
              
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
                  className="text-neutral-900 font-medium bg-neutral-100 border border-neutral-400 outline-none px-2 py-1.5 -ml-2 rounded-md mr-4 text-sm"
                  style={{ 
                    width: `${Math.min(Math.max(editedChatTitle.length * 8 + 40, 120), 600)}px`,
                    height: '32px'
                  }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setIsEditingChatTitle(true);
                    setEditedChatTitle(currentChatTitle);
                  }}
                  className="text-neutral-900 font-medium truncate mr-4 px-2 py-1.5 -ml-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-left text-sm"
                  style={{ minWidth: 0, height: '32px' }}
                >
                  {currentChatTitle}
                </button>
              )}
            </div>
            
            {/* Conditional buttons based on artifact panel state */}
            {!artifactPanelOpen && !draftArtifactPanelOpen && !reviewArtifactPanelOpen ? (
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
                  {sourcesDrawerOpen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 2C5.34315 2 4 3.34315 4 5V19C4 20.6569 5.34315 22 7 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H7ZM6 19C6 19.5523 6.44772 20 7 20H18V18H7C6.44772 18 6 18.4477 6 19Z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19C4 20.6569 5.34315 22 7 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H7C5.34315 2 4 3.34315 4 5V19Z" />
                      <path d="M20 17H7C5.89543 17 5 17.8954 5 19" />
                    </svg>
                  )}
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
                    {sourcesDrawerOpen ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7 2C5.34315 2 4 3.34315 4 5V19C4 20.6569 5.34315 22 7 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H7ZM6 19C6 19.5523 6.44772 20 7 20H18V18H7C6.44772 18 6 18.4477 6 19Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M4 19C4 20.6569 5.34315 22 7 22H19C19.5523 22 20 21.5523 20 21V3C20 2.44772 19.5523 2 19 2H7C5.34315 2 4 3.34315 4 5V19Z" />
                        <path d="M20 17H7C5.89543 17 5 17.8954 5 19" />
                      </svg>
                    )}
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
                          variant={anyArtifactPanelOpen ? 'small' : 'large'}
                          isSelected={unifiedArtifactPanelOpen && (
                            (currentArtifactType === 'draft' && message.artifactData?.variant === 'draft' && selectedDraftArtifact?.title === message.artifactData?.title) ||
                            (currentArtifactType === 'review' && message.artifactData?.variant !== 'draft' && selectedReviewArtifact?.title === message.artifactData?.title)
                          )}
                          iconType={message.artifactData?.variant === 'draft' ? 'file' : 'table'}
                                                      onClick={() => {
                            // Immediately update the artifact content
                            const artifactType = message.artifactData?.variant === 'draft' ? 'draft' : 'review';
                            const artifactData = {
                              title: message.artifactData?.title || 'Artifact',
                              subtitle: message.artifactData?.subtitle || ''
                            };
                            
                            // Update unified panel state
                            setCurrentArtifactType(artifactType);
                            setUnifiedArtifactPanelOpen(true);
                            
                            // Also update the legacy states for backward compatibility
                            if (artifactType === 'draft') {
                              setSelectedDraftArtifact(artifactData);
                              setDraftArtifactPanelOpen(true);
                              setReviewArtifactPanelOpen(false);
                            } else {
                              setSelectedReviewArtifact(artifactData);
                              setReviewArtifactPanelOpen(true);
                              setDraftArtifactPanelOpen(false);
                            }
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
              <div className="pl-2 pr-3 pt-4 pb-3 transition-all duration-200 border border-transparent focus-within:border-neutral-300 bg-neutral-100 flex flex-col" style={{ borderRadius: '12px', minHeight: '160px' }}>
              {/* Textarea */}
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && (e.preventDefault(), sendMessage())}
                placeholder="Request a revision or ask a question..."
                className="w-full bg-transparent focus:outline-none text-neutral-900 placeholder-neutral-500 resize-none overflow-hidden flex-1 px-2"
                style={{ 
                  fontSize: '14px', 
                  lineHeight: '20px',
                  minHeight: '60px',
                  maxHeight: '300px'
                }}
              />
              
              {/* Controls Row */}
              <div className="flex items-center justify-between mt-3" data-artifact-open={anyArtifactPanelOpen}>
                {/* Left Controls */}
                                  <div className="flex items-center">
                    {/* Files and sources */}
                    <button 
                      onClick={() => setIsFileManagementOpen(true)}
                      className={`flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition-colors`}
                    >
                      <Plus size={16} />
                      {!anyArtifactPanelOpen && <span className="text-sm font-normal">Files and sources</span>}
                    </button>
                  
                  {/* Prompts */}
                  <button className={`flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition-colors`}>
                    <ListPlus size={16} />
                    {!anyArtifactPanelOpen && <span className="text-sm font-normal">Prompts</span>}
                  </button>
                  
                  {/* Divider */}
                  <div className="w-px bg-neutral-200" style={{ height: '20px', marginLeft: '4px', marginRight: '4px' }}></div>
                  
                  {/* Customize */}
                  <button className={`flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition-colors`}>
                    <Settings2 size={16} />
                    {!anyArtifactPanelOpen && <span className="text-sm font-normal">Customize</span>}
                  </button>
                  
                  {/* Improve */}
                  <button className={`flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 rounded-md transition-colors`}>
                    <Wand size={16} />
                    {!anyArtifactPanelOpen && <span className="text-sm font-normal">Improve</span>}
                  </button>
                </div>
                
                {/* Right Controls */}
                <div className="flex items-center space-x-2">
                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2 focus:outline-none flex items-center justify-center transition-all bg-neutral-900 text-neutral-0 hover:bg-neutral-800 ${
                      !inputValue.trim() || isLoading ? 'cursor-not-allowed' : ''
                    }`}
                    style={{ 
                      minWidth: '32px', 
                      minHeight: '32px',
                      borderRadius: '6px',
                      opacity: !inputValue.trim() || isLoading ? 0.3 : 1
                    }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
        
        {/* Resizable Separator - Only show when artifact panel is open */}
        {anyArtifactPanelOpen && (
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
      
      {/* Sources Panel - Shows as second panel when artifact is closed */}
      <AnimatePresence>
                  {sourcesDrawerOpen && !anyArtifactPanelOpen && (
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
      
      {/* Unified Artifact Panel - Right Panel */}
      <AnimatePresence>
        {unifiedArtifactPanelOpen && currentArtifactType && (
          <>
            {currentArtifactType === 'draft' ? (
              <DraftArtifactPanel
                selectedArtifact={selectedDraftArtifact}
                isEditingArtifactTitle={isEditingDraftArtifactTitle}
                editedArtifactTitle={editedDraftArtifactTitle}
                onEditedArtifactTitleChange={setEditedDraftArtifactTitle}
                onStartEditingTitle={() => {
                  setIsEditingDraftArtifactTitle(true);
                  setEditedDraftArtifactTitle(selectedDraftArtifact?.title || 'Artifact');
                }}
                onSaveTitle={handleSaveDraftArtifactTitle}
                onClose={() => {
                  setUnifiedArtifactPanelOpen(false);
                  setDraftArtifactPanelOpen(false);
                  setSelectedDraftArtifact(null);
                  setCurrentArtifactType(null);
                }}
                chatOpen={chatOpen}
                onToggleChat={toggleChat}
                shareArtifactDialogOpen={shareArtifactDialogOpen}
                onShareArtifactDialogOpenChange={setShareArtifactDialogOpen}
                exportReviewDialogOpen={exportReviewDialogOpen}
                onExportReviewDialogOpenChange={setExportReviewDialogOpen}
                artifactTitleInputRef={draftArtifactTitleInputRef}
                sourcesDrawerOpen={sourcesDrawerOpen}
                onSourcesDrawerOpenChange={setSourcesDrawerOpen}
              />
            ) : (
              <ReviewArtifactPanel
                selectedArtifact={selectedReviewArtifact}
                isEditingArtifactTitle={isEditingReviewArtifactTitle}
                editedArtifactTitle={editedReviewArtifactTitle}
                onEditedArtifactTitleChange={setEditedReviewArtifactTitle}
                onStartEditingTitle={() => {
                  setIsEditingReviewArtifactTitle(true);
                  setEditedReviewArtifactTitle(selectedReviewArtifact?.title || 'Artifact');
                }}
                onSaveTitle={handleSaveReviewArtifactTitle}
                onClose={() => {
                  setUnifiedArtifactPanelOpen(false);
                  setReviewArtifactPanelOpen(false);
                  setSelectedReviewArtifact(null);
                  setCurrentArtifactType(null);
                }}
                chatOpen={chatOpen}
                onToggleChat={toggleChat}
                shareArtifactDialogOpen={shareArtifactDialogOpen}
                onShareArtifactDialogOpenChange={setShareArtifactDialogOpen}
                exportReviewDialogOpen={exportReviewDialogOpen}
                onExportReviewDialogOpenChange={setExportReviewDialogOpen}
                artifactTitleInputRef={reviewArtifactTitleInputRef}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Legacy Artifact Panel - For backward compatibility */}
      <AnimatePresence>
        {artifactPanelOpen && (
          <ReviewArtifactPanel
            selectedArtifact={selectedArtifact}
            isEditingArtifactTitle={isEditingArtifactTitle}
            editedArtifactTitle={editedArtifactTitle}
            onEditedArtifactTitleChange={setEditedArtifactTitle}
            onStartEditingTitle={() => {
              setIsEditingArtifactTitle(true);
              setEditedArtifactTitle(selectedArtifact?.title || 'Artifact');
            }}
            onSaveTitle={handleSaveArtifactTitle}
            onClose={() => {
              setArtifactPanelOpen(false);
              setSelectedArtifact(null);
            }}
            chatOpen={chatOpen}
            onToggleChat={toggleChat}
            shareArtifactDialogOpen={shareArtifactDialogOpen}
            onShareArtifactDialogOpenChange={setShareArtifactDialogOpen}
            exportReviewDialogOpen={exportReviewDialogOpen}
            onExportReviewDialogOpenChange={setExportReviewDialogOpen}
            artifactTitleInputRef={artifactTitleInputRef}
          />
        )}
      </AnimatePresence>
      
      {/* Sources Panel - Shows as third panel when artifact is open and above 2xl */}
      <AnimatePresence>
        {sourcesDrawerOpen && (artifactPanelOpen || draftArtifactPanelOpen || reviewArtifactPanelOpen) && isAbove2xl && (
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
      
      {/* Sources Drawer - Sheet variant when artifact panel is open and below 2xl */}
      <AnimatePresence>
        {(artifactPanelOpen || draftArtifactPanelOpen || reviewArtifactPanelOpen) && !isAbove2xl && (
          <SourcesDrawer 
            isOpen={sourcesDrawerOpen} 
            onClose={() => setSourcesDrawerOpen(false)}
            variant="sheet"
          />
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
      <FileManagementDialog 
        isOpen={isFileManagementOpen} 
        onClose={() => setIsFileManagementOpen(false)} 
      />
        </div>
      </SidebarInset>
    </div>
  );
} 