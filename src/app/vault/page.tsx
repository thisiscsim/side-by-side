"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { AnimatedBackground } from "../../../components/motion-primitives/animated-background";

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const projects = [
    {
      id: 1,
      name: "Nikhil's Project",
      fileCount: "2,593 files",
      type: "project",
      status: ""
    },
    {
      id: 2,
      name: "M&A (US)",
      fileCount: "2,593 files",
      type: "knowledge",
      status: "Knowledge base"
    },
    {
      id: 3,
      name: "Cross-Border Tax Strategies",
      fileCount: "2,593 files",
      type: "knowledge",
      status: "Knowledge base"
    },
    {
      id: 4,
      name: "Reevo AI - Series B Financing",
      fileCount: "2,593 files",
      type: "shared",
      status: "Shared"
    },
    {
      id: 5,
      name: "Regulatory Compliance Audit",
      fileCount: "2,593 files",
      type: "project",
      status: ""
    },
    {
      id: 6,
      name: "Amend v Delta IP Litigation",
      fileCount: "2,593 files",
      type: "shared",
      status: "Shared"
    },
    {
      id: 7,
      name: "Open Ledger Merger Integration (2024)",
      fileCount: "2,593 files",
      type: "project",
      status: ""
    },
  ];

  // Filter projects based on active tab and search query
  const filteredProjects = projects.filter(project => {
    // First filter by tab
    let tabMatch = true;
    if (activeTab === "shared") {
      tabMatch = project.type === "shared";
    } else if (activeTab === "your") {
      tabMatch = project.type !== "shared"; // Show project and knowledge types
    }
    // "all" tab shows everything, so tabMatch stays true
    
    // Then filter by search query
    let searchMatch = true;
    if (searchQuery.trim()) {
      try {
        const regex = new RegExp(searchQuery, 'i'); // Case-insensitive regex
        searchMatch = regex.test(project.name);
      } catch {
        // If regex is invalid, fall back to simple string matching
        searchMatch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
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
          <div className="h-screen flex flex-col bg-white">
            <div className="w-full xl:max-w-[1500px] xl:mx-auto flex flex-col h-full px-10">
              {/* Header */}
            <div className="pb-0" style={{ paddingTop: '40px' }}>
              <h1 className="text-2xl font-semibold text-neutral-900">Vault</h1>
              <p className="text-sm text-neutral-500 mt-1 mb-6">Upload, store, and analyze thousands of documents</p>
              
              {/* Action Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Create Project Card */}
                <div className="border border-neutral-200 rounded-lg p-1 hover:border-neutral-300 transition-colors cursor-pointer" style={{ height: '100px' }}>
                                      <div className="flex items-center justify-center gap-4 h-full">
                      <div className="p-3 bg-neutral-100 rounded-lg w-[120px] h-full flex items-center justify-center">
                        <img 
                          src="/vault_project_illustration.svg" 
                          alt="Create project" 
                          className="w-10 h-10"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">Create project</p>
                        <p className="text-sm text-neutral-500">Upload a new collection of files or folders.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Create Knowledge Base Card */}
                  <div className="border border-neutral-200 rounded-lg p-1 hover:border-neutral-300 transition-colors cursor-pointer" style={{ height: '100px' }}>
                    <div className="flex items-center justify-center gap-4 h-full">
                      <div className="p-3 bg-neutral-100 rounded-lg w-[120px] h-full flex items-center justify-center">
                        <img 
                          src="/knowledge_base_illustration.svg" 
                          alt="Create knowledge base" 
                          className="w-10 h-10"
                        />
                      </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Create knowledge base</p>
                      <p className="text-sm text-neutral-500">Distribute a repository of files to your organization.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs and Search */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                                  <AnimatedBackground 
                  defaultValue={activeTab}
                  onValueChange={(value) => value && setActiveTab(value)}
                  className="bg-neutral-100 rounded-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <button
                      data-id="all"
                      className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      All projects
                    </button>
                    <button
                      data-id="your"
                      className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Your projects
                    </button>
                    <button
                      data-id="shared"
                      className="relative px-2 py-1.5 font-medium transition-colors text-neutral-600 hover:text-neutral-900 data-[checked=true]:text-neutral-900"
                      style={{ fontSize: '14px', lineHeight: '20px' }}
                    >
                      Shared with you
                    </button>
                  </AnimatedBackground>
                </div>
                
                                  {/* Search Input */}
                  <div className="relative" style={{ width: '300px', marginBottom: '12px' }}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 border-neutral-200 focus:ring-1 focus:ring-neutral-300 font-normal text-neutral-900 placeholder:text-neutral-500"
                      style={{ height: '32px', fontSize: '14px', lineHeight: '20px', color: '#171717' }}
                    />
                  </div>
              </div>
            </div>
            
            {/* Projects Grid */}
            <div className="flex-1 pt-4 pb-6 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                {filteredProjects.map((project) => (
                                  <div
                  key={project.id}
                  className="cursor-pointer"
                >
                  {/* Icon container */}
                  <div className="w-full bg-neutral-100 rounded-lg flex items-center justify-center mb-2.5" style={{ height: '162px' }}>
                    <img 
                      src={
                        project.name === "Nikhil's Project" ? "/privateFolderIcon.svg" :
                        project.type === "shared" ? "/sharedFolderIcon.svg" :
                        project.type === "knowledge" ? "/knowledgeBaseIcon.svg" :
                        "/folderIcon.svg"
                      }
                      alt={`${project.name} icon`}
                      className="w-[72px] h-[72px]"
                    />
                  </div>
                  
                  {/* Title and menu */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 leading-tight m-0">{project.name}</p>
                      <div className="flex items-center gap-1 leading-tight">
                        <p className="text-xs text-neutral-500 m-0">{project.fileCount}</p>
                        {project.status && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <p className="text-xs text-neutral-500 m-0">{project.status}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
} 