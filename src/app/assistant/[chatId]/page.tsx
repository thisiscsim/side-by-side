"use client";

import { use } from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectArtifactType } from "@/lib/artifact-detection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Download, ArrowLeft, X, Plus, ListPlus, Settings2, Wand, Copy, SquarePen, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
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
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showBottomGradient, setShowBottomGradient] = useState(false);

  const MIN_CHAT_WIDTH = 400;
  const MAX_CHAT_WIDTH = 800;

  // Scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);



  // Process initial message when component mounts
  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessageRef.current) {
      hasProcessedInitialMessageRef.current = true;
      // Add the user message
      setMessages([{ role: 'user', content: initialMessage, type: 'text' }]);
      setIsLoading(true);
      
      // Determine artifact type using weighted keyword scoring
      const artifactType = detectArtifactType(initialMessage);
      const isDraftArtifact = artifactType === 'draft';
      const isReviewArtifact = artifactType === 'review';
      
      // Auto-expand sources drawer on first message (including after refresh)
      // BUT only if it's not a review artifact
      if (!hasOpenedSourcesDrawerRef.current && !isReviewArtifact) {
        setTimeout(() => {
          setSourcesDrawerOpen(true);
          hasOpenedSourcesDrawerRef.current = true;
        }, 1000); // Open drawer during AI thinking time
      }
      
      // Simulate AI response
      setTimeout(() => {
        if (isDraftArtifact) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'I have drafted a memo for you. Please let me know if you would like to continue editing the draft or if you need any specific changes or additional information included.',
            type: 'artifact',
            artifactData: {
              title: 'Record of Deliberation',
              subtitle: 'Version 1',
              variant: 'draft'
            }
          }]);
        } else if (isReviewArtifact) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'I have generated a review table extracting terms from the industrial merger agreements as requested. Please let me know if you would like to continue editing the table or if you need any specific changes.',
            type: 'artifact',
            artifactData: {
              title: 'Extraction of Agreements and Provisions',
              subtitle: '24 columns · 104 rows',
              variant: 'review'
            }
          }]);
        } else {
          // Default to legal analysis for general messages
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'legal-analysis',
            type: 'text'
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

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        // Show top gradient when content has scrolled past the top
        setIsScrolled(scrollTop > 0);
        
        // Check if user is near the bottom (within 100px)
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setIsNearBottom(distanceFromBottom < 100);
        
        // Show bottom gradient when not at the very bottom
        setShowBottomGradient(distanceFromBottom > 1);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    // Only auto-scroll if user is near the bottom
    if (isNearBottom && messages.length > 0) {
      // Check if the last message is an artifact - they need more time to render
      const lastMessage = messages[messages.length - 1];
      const isArtifact = lastMessage.type === 'artifact';
      
      // Use longer delay for artifact messages to ensure they're fully rendered
      const delay = isArtifact ? 500 : 100;
      
      let timeoutId: NodeJS.Timeout;
      
      // For artifact messages, use requestAnimationFrame to ensure DOM is ready
      if (isArtifact) {
        // Double RAF to ensure React has committed to DOM
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            timeoutId = setTimeout(() => {
              scrollToBottom();
            }, delay);
          });
        });
      } else {
        timeoutId = setTimeout(() => {
          scrollToBottom();
        }, delay);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [messages, isNearBottom, scrollToBottom]);

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
      setMessages([...messages, { role: 'user', content: inputValue, type: 'text' }]);
      setInputValue('');
      setIsLoading(true);
      
      // Reset textarea height
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = '60px'; // Reset to minHeight
      }
      
      // Always scroll to bottom when user sends a message
      setTimeout(() => scrollToBottom(), 50);
      
      // Determine artifact type using weighted keyword scoring
      const artifactType = detectArtifactType(inputValue);
      const isDraftArtifact = artifactType === 'draft';
      const isReviewArtifact = artifactType === 'review';
      
      // Open sources drawer only on the first message if not already opened
      // BUT only if it's not a review artifact
      if (!sourcesDrawerOpen && !hasOpenedSourcesDrawerRef.current && !isReviewArtifact) {
        setTimeout(() => {
          setSourcesDrawerOpen(true);
          hasOpenedSourcesDrawerRef.current = true;
        }, 1000); // Open drawer during AI thinking time
      }
      
      // Simulate AI response with artifact (you can replace this with actual AI integration)
      setTimeout(() => {
        if (isDraftArtifact || isReviewArtifact) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: isDraftArtifact 
              ? 'I have drafted a memo for you. Please let me know if you would like to continue editing the draft or if you need any specific changes or additional information included.'
              : 'I have generated a review table extracting terms from the industrial merger agreements as requested. Please let me know if you would like to continue editing the table or if you need any specific changes.',
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
            content: 'legal-analysis',
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
          
          {/* Messages Area Container */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {/* Top Gradient Overlay - positioned outside scrollable area */}
            <div 
              className={`absolute top-0 left-0 right-0 pointer-events-none z-10 transition-opacity duration-300 chat-scroll-gradient ${
                isScrolled ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* Bottom Gradient Overlay */}
            <div 
              className={`absolute bottom-0 left-0 right-0 pointer-events-none z-10 transition-opacity duration-300 chat-scroll-gradient-bottom ${
                showBottomGradient ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* Messages Area */}
            <motion.div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-8 pb-8 hide-scrollbar"
              initial={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { opacity: 0 } : {}}
              animate={{ opacity: 1 }}
              transition={initialMessage && isFromHomepage && !hasPlayedAnimationsRef.current ? { delay: 0.4, duration: 0.6 } : {}}
            >
              <div className="mx-auto" style={{ maxWidth: '740px' }}>
            {messages.length === 0 ? (
              <div className="text-center text-neutral-500 mt-8">
                <p>Start a conversation with Harvey</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} data-message className={`flex items-start space-x-1 ${index !== messages.length - 1 ? 'mb-6' : ''}`}>
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Image src="/harvey-avatar.svg" alt="Harvey" width={24} height={24} className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {message.type === 'artifact' ? (
                      <div className="space-y-3">
                        <div className="text-neutral-900 leading-relaxed pl-2">
                          {message.content}
                        </div>
                        <div className="pl-2">
                          <ReviewTableArtifactCard
                            title={message.artifactData?.title || 'Artifact'}
                            subtitle={message.artifactData?.subtitle || ''}
                            variant={anyArtifactPanelOpen ? 'small' : 'large'}
                            isSelected={unifiedArtifactPanelOpen && (
                              (currentArtifactType === 'draft' && message.artifactData?.variant === 'draft' && selectedDraftArtifact?.title === message.artifactData?.title) ||
                              (currentArtifactType === 'review' && message.artifactData?.variant !== 'draft' && selectedReviewArtifact?.title === message.artifactData?.title)
                            )}
                            iconType={message.artifactData?.variant === 'draft' ? 'file' : 'table'}
                            showSources={message.artifactData?.variant === 'draft'}
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
                        {/* Ghost buttons for AI messages with artifacts */}
                        {message.role !== 'user' && (
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                <Copy className="w-3 h-3" />
                                Copy
                              </button>
                              <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                <Download className="w-3 h-3" />
                                Export
                              </button>
                              <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                <RotateCcw className="w-3 h-3" />
                                Rewrite
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm p-1.5">
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button className="text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm p-1.5">
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-neutral-900 leading-relaxed pl-2">
                          {message.content === 'legal-analysis' ? (
                            <div className="space-y-4">
                              <p>The entitlement of a commercial tenant to self-help rights depends on the jurisdiction and the specific circumstances of the case. Below is an analysis based on federal principles, state laws, and relevant case law:</p>
                              
                              <h3 className="text-base font-semibold">Federal and General Principles</h3>
                              <p>Under federal law and general principles, there is no inherent right for a commercial tenant to engage in self-help. Instead, the remedies available to tenants are typically governed by statutory frameworks or common law principles, which vary by jurisdiction. For example, in the District of Columbia, the common law right of self-help for landlords has been abrogated, and statutory remedies are deemed exclusive. This principle applies equally to commercial tenancies, as established in Mendes v. Johnson, 389 A.2d 781 (D.C. 1978), where the court held that a tenant has the right not to have their possession interfered with except by lawful process.</p>
                              
                              <h3 className="text-base font-semibold">Jurisdictional Analysis</h3>
                              
                              <h4 className="text-sm font-semibold mt-2">New York</h4>
                              <p>In New York, the focus is primarily on the landlord&apos;s right to self-help rather than the tenant&apos;s. Case law such as Sol De Ibiza, LLC v. Panjo Realty, Inc., 911 N.Y.S.2d 567 (App. Term 2010) and Martinez v. Ulloa, 22 N.Y.S.3d 787 (N.Y. App. Term. 2015) confirms that landlords may utilize self-help to regain possession of commercial premises under specific conditions, including a lease provision reserving the right, a valid rent demand, and peaceable reentry. However, there is no indication in these cases that commercial tenants have a reciprocal right to self-help. Instead, tenants typically seek judicial remedies, such as restoration of possession or damages for wrongful eviction under RPAPL § 853.</p>
                              
                              <h4 className="text-sm font-semibold mt-2">District of Columbia</h4>
                              <p>In the District of Columbia, the courts have explicitly rejected the use of self-help by landlords and tenants alike. In Mendes v. Johnson and Sarete, Inc. v. 1344 U St. Ltd. P&apos;ship, 871 A.2d 480 (D.C. 2005), the courts held that statutory remedies for reacquiring possession are exclusive, and any interference with possession outside of lawful process constitutes wrongful eviction. This prohibition applies to both residential and commercial tenancies.</p>
                              
                              <h4 className="text-sm font-semibold mt-2">Rhode Island</h4>
                              <p>Rhode Island law explicitly prohibits the use of self-help by landlords to reenter and repossess leased premises, whether under common law or contractual agreements. While the statute, R.I. Gen. Laws § 34-18.1-15, does not directly address tenants, the prohibition on self-help for landlords suggests a strong preference for judicial processes to resolve possession disputes.</p>
                              
                              <h4 className="text-sm font-semibold mt-2">Virginia</h4>
                              <p>Virginia law permits self-help eviction by landlords in commercial tenancies, provided it does not incite a breach of the peace, as outlined in Va. Code Ann. § 55.1-1400. However, the statute does not extend this right to tenants, and tenants are generally expected to rely on judicial remedies to address disputes.</p>
                              
                              <h3 className="text-base font-semibold">Conclusion</h3>
                              <p>In most jurisdictions, commercial tenants are not entitled to self-help rights. Instead, they are expected to seek judicial remedies to address disputes with landlords. Jurisdictions like the District of Columbia and Rhode Island explicitly prohibit self-help, while others, such as New York and Virginia, focus on the landlord&apos;s rights without extending similar rights to tenants. Tenants should carefully review their lease agreements and applicable state laws to determine their rights and remedies in possession disputes.</p>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                        {/* Sources section for legal analysis */}
                        {message.content === 'legal-analysis' && message.role !== 'user' && (
                          <>
                            <p className="text-xs font-medium text-neutral-600 mt-4 pl-2">Sources</p>
                            <button 
                              className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1.5 max-w-full"
                              onClick={() => setSourcesDrawerOpen(true)}
                            >
                            {/* Facepile avatars */}
                            <div className="flex -space-x-1.5 flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center border-[1px] border-white overflow-hidden z-[3]">
                                <Image src="/lexis.svg" alt="LexisNexis" width={20} height={20} className="w-full h-full object-cover" />
                              </div>
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center border-[1.5px] border-white overflow-hidden z-[2]">
                                <Image src="/EDGAR.svg" alt="EDGAR" width={20} height={20} className="w-full h-full object-cover" />
                              </div>
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center border-[1.5px] border-white overflow-hidden z-[1]">
                                <Image src="/bloomberg.jpg" alt="Bloomberg" width={20} height={20} className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <span className="truncate">6 sources from LexisNexis, EDGAR, and more</span>
                          </button>
                          </>
                        )}
                        {/* Ghost buttons for user messages */}
                        {message.role === 'user' && (
                          <div className="flex items-center mt-2">
                            <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                            <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                              <ListPlus className="w-3 h-3" />
                              Save prompt
                            </button>
                            <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                              <SquarePen className="w-3 h-3" />
                              Edit query
                            </button>
                          </div>
                        )}
                        {/* Ghost buttons for AI responses */}
                        {message.role !== 'user' && (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center">
                              <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                <Copy className="w-3 h-3" />
                                Copy
                              </button>
                              <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                <Download className="w-3 h-3" />
                                Export
                              </button>
                              <button className="text-xs text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm px-2 py-1 flex items-center gap-1.5">
                                <RotateCcw className="w-3 h-3" />
                                Rewrite
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm p-1.5">
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button className="text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 transition-colors rounded-sm p-1.5">
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            </div>
            </motion.div>
          </div>
          
          {/* Input Area - Animation simulating movement from center to bottom */}
          <motion.div 
            className="px-6 pb-6 overflow-x-hidden relative z-20 bg-white"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
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
              isLoading={isLoading}
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
              isLoading={isLoading}
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
            isLoading={isLoading}
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