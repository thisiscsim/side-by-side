"use client";

import { useState, useEffect, useRef } from "react";
import Lenis from 'lenis';
import { motion } from "motion/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

import { Plus, FileText, Table2, Settings2, ListPlus, Wand, Orbit, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { AnimatedBackground } from "../../../components/motion-primitives/animated-background";
import FileManagementDialog from "@/components/file-management-dialog"
import Image from "next/image";
import { workflows as allWorkflows } from "@/lib/workflows";

export default function AssistantHomePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearchActive, setIsDeepResearchActive] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState("recommended");
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState("");
  const [isFileManagementOpen, setIsFileManagementOpen] = useState(false);
  const workflowContainerRef = useRef<HTMLDivElement>(null);
  const topContentRef = useRef<HTMLDivElement>(null);
  const workflowControlsRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLButtonElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [topMinHeight, setTopMinHeight] = useState<number>(0);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      
      // Generate a URL-friendly ID from the message (in a real app, this would be a proper ID)
      const chatId = inputValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      // Set a flag in sessionStorage to indicate we're coming from the homepage
      sessionStorage.setItem('fromAssistantHomepage', 'true');
      
      // Navigate to the chat page with the message as a query parameter
      router.push(`/assistant/${chatId}?initialMessage=${encodeURIComponent(inputValue)}`);
    }
  };

  // Handle scroll events for workflow animation
  useEffect(() => {
    // Get the scroll container
    const scrollContainer = document.getElementById('main-content');
    if (!scrollContainer) return;

    // Subtle smooth scrolling using Lenis, scoped to this page only
    const lenis = new Lenis({
      wrapper: scrollContainer,
      content: scrollContainer.firstElementChild as HTMLElement,
      duration: 0.5, // snappier
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // cubic ease-out
      smoothWheel: true,
      wheelMultiplier: 0.8, // more subtle
      touchMultiplier: 1.5,
    });

    // Bind rAF
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollContainer = document.getElementById('main-content');
          if (!scrollContainer || !workflowContainerRef.current) {
            ticking = false;
            return;
          }
          
          const scrollTop = scrollContainer.scrollTop;
          
          // Calculate scroll progress - start revealing when user scrolls down
          const rawProgress = Math.max(0, scrollTop);
          
          // Set progress from 0 to 1 based on scroll depth
          const maxScroll = 400; // pixels of scroll to reveal all cards
          const progress = Math.min(1, rawProgress / maxScroll);
          
          setScrollProgress(progress);
          
          ticking = false;
        });
        
        ticking = true;
      }
    };
    
    // Add scroll listener after component mounts
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => {
      cancelAnimationFrame(rafId);
      // best-effort cleanup
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (lenis as any)?.destroy?.();
      } catch {}
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Compute top section min-height so only controls + first row are visible at bottom on load
  useEffect(() => {
    const computeLayout = () => {
      const viewportHeight = window.innerHeight;
      const controlsHeight = workflowControlsRef.current?.getBoundingClientRect().height ?? 0;
      const firstCardHeight = firstCardRef.current?.offsetHeight ?? 0;
      // Account for spacing: grid gap (~16), controls bottom margin (~16), container padding bottom (~48), padding top (~8)
      const extraSpacing = 16 + 16 + 48 + 8;
      const bottomVisibleHeight = controlsHeight + firstCardHeight + extraSpacing;
      // Add a small positive offset so the first row sits closer to the page bottom on load
      const offset = 16; // px
      const newTopMinHeight = Math.max(0, viewportHeight - bottomVisibleHeight + offset);
      setTopMinHeight(newTopMinHeight);
    };

    // Delay to ensure elements are rendered/measured
    const timeoutId = setTimeout(() => {
      computeLayout();
      window.addEventListener('resize', computeLayout);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', computeLayout);
    };
  }, []);

  // Streaming icon component
  const StreamingIcon = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M17 10L15.5 13.5L12 15L15.5 16.5L17 20L18.5 16.5L22 15L18.5 13.5L17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 18H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Workflow data
  const workflows = allWorkflows.map((w) => ({
    ...w,
    icon: w.type === 'Draft' ? FileText : w.type === 'Output' ? StreamingIcon : Table2,
  }));

  // Filter workflows based on active tab and search query
  const filteredWorkflows = workflows.filter(workflow => {
    // First filter by tab
    let tabMatch = true;
    if (activeWorkflowTab === "recommended") {
      // Show all workflows for recommended tab
      tabMatch = true;
    } else {
      tabMatch = workflow.type.toLowerCase() === activeWorkflowTab.toLowerCase();
    }
    
    // Then filter by search query
    let searchMatch = true;
    if (workflowSearchQuery.trim()) {
      try {
        const regex = new RegExp(workflowSearchQuery, 'i');
        searchMatch = regex.test(workflow.title) || regex.test(workflow.description);
      } catch {
        searchMatch = workflow.title.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
                     workflow.description.toLowerCase().includes(workflowSearchQuery.toLowerCase());
      }
    }
    
    return tabMatch && searchMatch;
  });

  // Ensure at most 4 rows (16 items) to avoid container height jumps per tab
  const filteredWorkflowsLimited = filteredWorkflows.slice(0, 16);

  // Derive hint visibility from the estimated opacity of the first card in the second row
  const firstRemainingRowProgress = Math.max(0, (scrollProgress - 0) / 0.22);
  const firstRemainingCardProgress = Math.max(0, firstRemainingRowProgress - 0);
  const firstRemainingCardOpacity = Math.min(1, Math.max(0, firstRemainingCardProgress * 2));
  const showHint = filteredWorkflows.length > 4 && firstRemainingCardOpacity <= 0.06; // slightly later
  const hintDelay = showHint ? 0.12 : 0; // tiny extra delay when appearing

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <SidebarInset className="flex-1">
        <div className="h-screen overflow-y-auto bg-neutral-0" id="main-content">
          <div 
            className="flex flex-col"
            style={{
              visibility: topMinHeight > 0 ? 'visible' : 'hidden',
              opacity: topMinHeight > 0 ? 1 : 0,
              transition: 'opacity 0.15s ease-out'
            }}
          >
            <div 
              className="flex items-center justify-center" 
              style={{ 
                minHeight: topMinHeight || 'calc(100vh - 225px)'
              }}
            >
              <div className="px-6 py-4 w-full" ref={topContentRef}>
              <div className="mx-auto" style={{ maxWidth: '832px' }}>
                {/* Harvey Logo/Title */}
                <div className="text-center mb-5">
                  <Image 
                    src="/Harvey_Logo.svg" 
                    alt="Harvey" 
                    width={100}
                    height={32}
                    className="mx-auto"
                    style={{ height: '32px' }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center mb-5">
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2" style={{ width: '220px' }}>
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <FileText size={16} style={{ color: '#3B7EA1' }} />
                    </div>
                    <p className="text-neutral-900 text-sm font-medium">Create draft document</p>
                  </button>
                  
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2" style={{ width: '220px' }}>
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Table2 size={16} style={{ color: '#3B7EA1' }} />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">Create review grid</span>
                  </button>
                </div>

                {/* Chat Input - Identical to chat page */}
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Harvey anything..."
                  className="w-full bg-transparent focus:outline-none text-neutral-900 placeholder-neutral-500 resize-none overflow-hidden flex-1 px-2"
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: '20px',
                    minHeight: '60px',
                    maxHeight: '300px'
                  }}
                />
                
                {/* Controls Row */}
                <div className="flex items-center justify-between mt-3">
                  {/* Left Controls */}
                  <div className="flex items-center">
                    {/* Files and sources */}
                    <button 
                      onClick={() => setIsFileManagementOpen(true)}
                      className="flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 transition-colors" 
                      style={{ borderRadius: '6px' }}
                    >
                      <Plus size={16} />
                      <span className="text-sm font-normal">Files and sources</span>
                    </button>
                    
                    {/* Prompts */}
                    <button className="flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 transition-colors" style={{ borderRadius: '6px' }}>
                      <ListPlus size={16} />
                      <span className="text-sm font-normal">Prompts</span>
                    </button>
                    
                    {/* Divider */}
                    <div className="w-px bg-neutral-200" style={{ height: '20px', marginLeft: '4px', marginRight: '4px' }}></div>
                    
                    {/* Customize */}
                    <button className="flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 transition-colors" style={{ borderRadius: '6px' }}>
                      <Settings2 size={16} />
                      <span className="text-sm font-normal">Customize</span>
                    </button>
                    
                    {/* Improve */}
                    <button className="flex items-center gap-1.5 h-8 px-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200 transition-colors" style={{ borderRadius: '6px' }}>
                      <Wand size={16} />
                      <span className="text-sm font-normal">Improve</span>
                    </button>
                  </div>
                  
                  {/* Right Controls */}
                  <div className="flex items-center space-x-1">
                    {/* Deep Research */}
                    <button 
                      onClick={() => setIsDeepResearchActive(!isDeepResearchActive)}
                      className={`flex items-center gap-1.5 h-8 px-2 transition-colors ${
                        isDeepResearchActive 
                          ? 'text-[#5F3BA5] bg-[#E7E6EA]' 
                          : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200'
                      }`}
                      style={{ borderRadius: '6px' }}
                    >
                      <Orbit size={16} />
                      <span className="text-sm font-normal">Deep Research</span>
                    </button>
                    
                    {/* Ask Harvey Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={`focus:outline-none flex items-center justify-center transition-all bg-neutral-900 text-neutral-0 hover:bg-neutral-800 ${
                        !inputValue.trim() || isLoading ? 'cursor-not-allowed' : ''
                      } ${
                        isLoading ? 'p-2' : 'px-4 py-1.5'
                      }`}
                      style={{ 
                        minWidth: isLoading ? '32px' : undefined,
                        minHeight: '32px',
                        borderRadius: '6px',
                        opacity: !inputValue.trim() || isLoading ? 0.3 : 1,
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 flex items-center justify-center">
                          <Spinner size="sm" />
                        </div>
                      ) : (
                        'Ask Harvey'
                      )}
                    </button>
                  </div>
                </div>
              </div>
                
              {/* Action Cards Section - Below Chatbox */}
              <div className="mt-3">
                <div className="flex gap-3 justify-center flex-wrap mx-auto" style={{ maxWidth: '740px' }}>
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Image src="/imanage.svg" alt="" width={16} height={16} style={{ width: '16px', height: '16px' }} />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">iManage</span>
                    <Plus size={16} className="text-neutral-600" />
                  </button>
                  
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Image src="/lexis.svg" alt="" width={16} height={16} style={{ width: '16px', height: '16px' }} />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">LexisNexis</span>
                    <Plus size={16} className="text-neutral-600" />
                  </button>
                  
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Image src="/globe.svg" alt="" width={16} height={16} style={{ width: '16px', height: '16px' }} />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">Web search</span>
                    <Plus size={16} className="text-neutral-600" />
                  </button>
                  
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Image src="/EDGAR.svg" alt="" width={16} height={16} style={{ width: '16px', height: '16px' }} />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">EDGAR</span>
                    <Plus size={16} className="text-neutral-600" />
                  </button>
                  
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Image src="/folderIcon.svg" alt="" width={16} height={16} style={{ width: '16px', height: '16px' }} className="text-neutral-600" />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">Amend v Delta IP Litigation</span>
                    <Plus size={16} className="text-neutral-600" />
                  </button>
                  
                  <button className="py-1 pl-1 pr-3 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Image src="/folderIcon.svg" alt="" width={16} height={16} style={{ width: '16px', height: '16px' }} className="text-neutral-600" />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">Regulatory Compliance Audit</span>
                    <Plus size={16} className="text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>
              </div>
            </div>
            </div>
            
            {/* Workflow Cards Section */}
            <div 
              className="w-full bg-neutral-0"
              ref={workflowContainerRef}
            >
              <div className="xl:max-w-[1500px] xl:mx-auto px-10 pt-2 pb-12 relative">
                {/* Workflow Controls */}
                <div className="flex items-center justify-between mb-4" ref={workflowControlsRef}>
                    <div className="flex items-center gap-1">
                      <AnimatedBackground 
                        defaultValue={activeWorkflowTab}
                        onValueChange={(value) => value && setActiveWorkflowTab(value)}
                        className="bg-neutral-100 rounded-md"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <button
                          data-id="recommended"
                          className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                          style={{ fontSize: '14px', lineHeight: '20px' }}
                        >
                          Recommended
                        </button>
                        <button
                          data-id="draft"
                          className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                          style={{ fontSize: '14px', lineHeight: '20px' }}
                        >
                          Draft
                        </button>
                        <button
                          data-id="output"
                          className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                          style={{ fontSize: '14px', lineHeight: '20px' }}
                        >
                          Output
                        </button>
                        <button
                          data-id="review"
                          className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                          style={{ fontSize: '14px', lineHeight: '20px' }}
                        >
                          Review
                        </button>
                      </AnimatedBackground>
                    </div>
                    
                    {/* Search Input */}
                    <div className="relative" style={{ width: '300px' }}>
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        type="text"
                        placeholder="Search workflows"
                        value={workflowSearchQuery}
                        onChange={(e) => setWorkflowSearchQuery(e.target.value)}
                        className="pl-9 pr-3 border-neutral-200 focus:ring-1 focus:ring-neutral-300 font-normal text-neutral-900 placeholder:text-neutral-500"
                        style={{ height: '32px', fontSize: '14px', lineHeight: '20px', color: '#171717' }}
                      />
                    </div>
                  </div>

            {/* First row in its own grid, with an overlayed hint below it */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-4">
              {filteredWorkflowsLimited.slice(0, 4).map((workflow, index) => {
                  const IconComponent = workflow.icon;
                  const colIndex = index % 4;
                  return (
                    <button
                      key={workflow.id}
                      className="p-4 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-all text-left overflow-hidden"
                      style={{
                        transitionDuration: '500ms',
                        transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                      }}
                      ref={colIndex === 0 ? firstCardRef : undefined}
                    >
                      <h3 className="text-sm font-medium text-neutral-900 mb-1 truncate">{workflow.title}</h3>
                      <p className="text-xs text-neutral-500 mb-8 truncate">{workflow.description}</p>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <IconComponent size={12} />
                        <span className="text-xs">{workflow.type}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{workflow.steps}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <motion.div
                className="absolute inset-x-0 flex justify-center pointer-events-none"
                style={{ top: 'calc(100% + 0.75rem)' }}
                initial={false}
                animate={{
                  opacity: showHint ? 1 : 0,
                  y: showHint ? 0 : -4,
                }}
                transition={{ duration: 0.22, delay: hintDelay, ease: [0.2, 0, 0.2, 1] }}
                aria-hidden
              >
                <div className="flex items-center gap-1 text-neutral-500 text-xs">
                  <span>Scroll for more workflows</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-bounce">
                    <path d="M6 2v8m0 0L3 7m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Remaining rows in a separate grid so the hint has no layout impact */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {filteredWorkflowsLimited.slice(4).map((workflow, indexRest) => {
                const index = indexRest + 4;
                const IconComponent = workflow.icon;
                const rowIndex = Math.floor(index / 4);
                const colIndex = index % 4;
                let opacity = 1;
                let transform = 'translateY(0)';
                let transitionDelay = '0ms';
                const rowStartProgress = (rowIndex - 1) * 0.22; // slight delay to let hint finish fading
                const rowProgress = Math.max(0, (scrollProgress - rowStartProgress) / 0.22);
                const cardDelay = colIndex * 0.045;
                const cardProgress = Math.max(0, rowProgress - cardDelay);
                // Faster fade-out: use power of 1.5 instead of linear (* 2)
                opacity = Math.max(0, Math.min(1, Math.pow(cardProgress, 0.7) * 1.5));
                const yOffset = Math.max(0, 36 * (1 - cardProgress));
                transform = `translateY(${yOffset}px)`;
                transitionDelay = `${colIndex * 60}ms`;

                return (
                  <button
                    key={workflow.id}
                    className="p-4 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-all text-left overflow-hidden"
                    style={{
                      opacity,
                      transform,
                      transitionDuration: '500ms',
                      transitionDelay,
                      transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    <h3 className="text-sm font-medium text-neutral-900 mb-1 truncate">{workflow.title}</h3>
                    <p className="text-xs text-neutral-500 mb-8 truncate">{workflow.description}</p>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <IconComponent size={12} />
                      <span className="text-xs">{workflow.type}</span>
                      <span className="text-xs">•</span>
                      <span className="text-xs">{workflow.steps}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredWorkflows.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500">No workflows found matching your search.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </SidebarInset>
      
      {/* File Management Dialog */}
      <FileManagementDialog 
        isOpen={isFileManagementOpen} 
        onClose={() => setIsFileManagementOpen(false)} 
      />
    </div>
  );
} 