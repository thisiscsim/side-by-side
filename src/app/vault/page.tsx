"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { AnimatedBackground } from "../../../components/motion-primitives/animated-background";

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState("all");

  const projects = [
    {
      id: 1,
      name: "Nikhil's Project",
      fileCount: "2,593 files",
      type: "project",
      status: "",
      icon: "lock"
    },
    {
      id: 2,
      name: "M&A (US)",
      fileCount: "2,593 files",
      type: "knowledge",
      status: "Knowledge base",
      icon: "stack"
    },
    {
      id: 3,
      name: "Cross-Border Tax Strategies",
      fileCount: "2,593 files",
      type: "knowledge",
      status: "Knowledge base",
      icon: "stack"
    },
    {
      id: 4,
      name: "Reevo AI - Series B Financing",
      fileCount: "2,593 files",
      type: "shared",
      status: "Shared",
      icon: "users"
    },
    {
      id: 5,
      name: "Regulatory Compliance Audit",
      fileCount: "2,593 files",
      type: "project",
      status: "",
      icon: "folder"
    },
    {
      id: 6,
      name: "Amend v Delta IP Litigation",
      fileCount: "2,593 files",
      type: "shared",
      status: "Shared",
      icon: "users"
    },
    {
      id: 7,
      name: "Open Ledger Merger Integration (2024)",
      fileCount: "2,593 files",
      type: "project",
      status: "",
      icon: "folder"
    },
  ];

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
                      className="pl-9 pr-3 border-neutral-200 focus:ring-1 focus:ring-neutral-300 font-normal"
                      style={{ height: '32px', fontSize: '14px', lineHeight: '20px' }}
                    />
                  </div>
              </div>
            </div>
            
            {/* Projects Grid */}
            <div className="flex-1 pt-4 pb-6 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                {projects.map((project) => (
                                  <div
                  key={project.id}
                  className="cursor-pointer"
                >
                  {/* Icon container */}
                  <div className="w-full bg-neutral-100 rounded-lg flex items-center justify-center mb-2.5" style={{ height: '162px' }}>
                    {project.icon === "lock" && (
                      <svg className="w-8 h-8 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {project.icon === "stack" && (
                      <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                    {project.icon === "users" && (
                      <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {project.icon === "folder" && (
                      <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Title and menu */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 leading-tight m-0">{project.name}</p>
                      <div className="flex items-center gap-2 leading-tight">
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