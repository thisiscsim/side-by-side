"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

import { Plus, FileText, Table2, Settings2, ListPlus, Wand, Orbit, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { AnimatedBackground } from "../../../components/motion-primitives/animated-background";
import FileManagementDialog from "@/components/file-management-dialog"
import Image from "next/image";

export default function AssistantHomePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearchActive, setIsDeepResearchActive] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState("recommended");
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState("");
  const [isFileManagementOpen, setIsFileManagementOpen] = useState(false);

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
  const workflows = [
    {
      id: 1,
      title: "Draft a client alert",
      type: "Draft",
      steps: "5 steps",
      icon: FileText,
      description: "Create professional client communications"
    },
    {
      id: 2,
      title: "Generate post-closing timeline",
      type: "Output",
      steps: "2 steps",
      icon: StreamingIcon,
      description: "Develop comprehensive closing schedules"
    },
    {
      id: 3,
      title: "Extract chronology of key events",
      type: "Review",
      steps: "2 steps",
      icon: Table2,
      description: "Identify and organize important events"
    },
    {
      id: 4,
      title: "Extract terms from stock purchase agreements",
      type: "Output",
      steps: "2 steps",
      icon: StreamingIcon,
      description: "Parse and extract key contract terms"
    }
  ];

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

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <SidebarInset>
        <div className="h-screen flex flex-col bg-neutral-0">
          <div className="flex-1 flex items-center justify-center">
            <div className="p-6 w-full">
              <div className="mx-auto" style={{ maxWidth: '832px' }}>
                {/* Harvey Logo/Title */}
                <div className="text-center mb-8">
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
                <div className="flex gap-3 justify-center mb-8">
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
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
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
                      className={`px-4 py-1.5 focus:outline-none flex items-center justify-center transition-all bg-neutral-900 text-neutral-0 hover:bg-neutral-800 ${
                        !inputValue.trim() || isLoading ? 'cursor-not-allowed' : ''
                      }`}
                      style={{ 
                        minHeight: '32px',
                        borderRadius: '6px',
                        opacity: !inputValue.trim() || isLoading ? 0.3 : 1,
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      {isLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        'Ask Harvey'
                      )}
                    </button>
                  </div>
                </div>
              </div>
                
              {/* Action Cards Section - Below Chatbox */}
              <div className="mt-4">
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

        {/* Workflow Cards Section */}
        <div className="w-full xl:max-w-[1500px] xl:mx-auto px-10 pb-12">
            {/* Workflow Controls */}
                <div className="flex items-center justify-between mb-6">
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

                              {/* Workflow Cards Grid */}
            <div className="grid grid-cols-4 gap-4">
                    {filteredWorkflows.map((workflow) => {
                      const IconComponent = workflow.icon;
                      return (
                        <button
                          key={workflow.id}
                          className="p-4 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors text-left"
                        >
                          <h3 className="text-sm font-medium text-neutral-900 mb-1">{workflow.title}</h3>
                          <p className="text-xs text-neutral-500 mb-8">{workflow.description}</p>
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
      </SidebarInset>
      
      {/* File Management Dialog */}
      <FileManagementDialog 
        isOpen={isFileManagementOpen} 
        onClose={() => setIsFileManagementOpen(false)} 
      />
    </div>
  );
} 