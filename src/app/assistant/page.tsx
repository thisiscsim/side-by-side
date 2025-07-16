"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssistantHomePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
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
                <div className="text-center mb-12">
                  <img 
                    src="/Harvey_Logo.svg" 
                    alt="Harvey" 
                    className="mx-auto"
                    style={{ height: '32px' }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                  <button className="flex-1 p-2 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <FileText size={16} className="text-neutral-700" />
                    </div>
                    <p className="text-neutral-900 text-sm font-medium">Create draft document</p>
                    <Plus size={20} className="text-neutral-400 ml-auto" />
                  </button>
                  
                  <button className="flex-1 p-2 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors flex items-center gap-2">
                    <div className="p-1.5 bg-neutral-100 rounded-sm">
                      <Grid3X3 size={16} className="text-neutral-700" />
                    </div>
                    <span className="text-neutral-900 text-sm font-medium">Create review grid</span>
                    <Plus size={20} className="text-neutral-400 ml-auto" />
                  </button>
                </div>

                {/* Chat Input - Identical to chat page */}
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
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Ask Harvey anything..."
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
                    {/* Ask Harvey Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`px-4 py-1.5 focus:outline-none flex items-center justify-center transition-all bg-neutral-900 text-neutral-0 hover:bg-neutral-800 ${
                        !inputValue.trim() ? 'cursor-not-allowed' : ''
                      }`}
                      style={{ 
                        minHeight: '32px',
                        borderRadius: '6px',
                        opacity: !inputValue.trim() ? 0.3 : 1,
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Ask Harvey
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </SidebarInset>
    </div>
  );
} 