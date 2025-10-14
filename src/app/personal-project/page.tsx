"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PersonalProjectPage() {
  const router = useRouter();
  
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <SidebarInset>
        <div className="h-screen flex flex-col bg-white">
          {/* Header with back button */}
          <div 
            className="px-3 py-4 flex items-center" 
            style={{ height: '52px' }}
          >
            {/* Back Button */}
            <button
              onClick={() => router.push('/vault')}
              className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <ArrowLeft size={16} className="text-neutral-600" />
            </button>
          </div>
          
          <div className="w-full xl:max-w-[1500px] xl:mx-auto flex flex-col h-full px-10">
            {/* Header */}
            <div className="pb-0" style={{ paddingTop: '12px' }}>
              <h1 className="text-2xl font-medium text-neutral-900">Nikhil&apos;s Personal Project</h1>
              <p className="text-sm text-neutral-500 mt-1 mb-6">1,567 files ⋅ 3 queries</p>
            </div>
            
            {/* Artifacts Section */}
            <div className="pb-8">
              <h2 className="text-base font-medium text-neutral-900 mb-4">Artifacts</h2>
              
              {/* Artifacts Grid */}
              <div className="grid grid-cols-8 gap-4">
                {/* Artifact 4 - Review Table */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/ReviewTableIllustration.svg" 
                    alt="Review table"
                    width={100}
                    height={130}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Item 1.01 disclosure</p>
                  <p className="text-xs text-neutral-500">Linked to 3 queries</p>
                  </div>
                </div>
                
                {/* Artifact 1 - Draft */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                      src="/DraftDocumentIllustration.svg" 
                      alt="Draft document"
                      width={100}
                      height={100}
                      className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Item 1.01 disclosure</p>
                    <p className="text-xs text-neutral-500 truncate">Linked to 1 queries</p>
                  </div>
                </div>
                
                {/* Artifact 2 - Draft */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/DraftDocumentIllustration.svg" 
                    alt="Draft document"
                    width={100}
                    height={100}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Material Adverse Effect Clauses</p>
                  <p className="text-xs text-neutral-500">Linked to 1 query</p>
                  </div>
                </div>
                
                {/* Artifact 3 - Draft */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/DraftDocumentIllustration.svg" 
                    alt="Draft document"
                    width={100}
                    height={100}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Key arguments for TRO filing</p>
                  <p className="text-xs text-neutral-500">Linked to 1 queries</p>
                  </div>
                </div>
                
                {/* Artifact 5 - Review Table */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/ReviewTableIllustration.svg" 
                    alt="Review table"
                    width={100}
                    height={130}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Extraction of term...</p>
                  <p className="text-xs text-neutral-500">Linked to 2 queries</p>
                  </div>
                </div>
                
                {/* Artifact 6 - Review Table */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/ReviewTableIllustration.svg" 
                    alt="Review table"
                    width={100}
                    height={130}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Item 1.01 disclosure</p>
                  <p className="text-xs text-neutral-500">Linked to 2 queries</p>
                  </div>
                </div>
                
                {/* Artifact 7 - Draft */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/DraftDocumentIllustration.svg" 
                    alt="Draft document"
                    width={100}
                    height={100}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Item 1.01 disclosure</p>
                  <p className="text-xs text-neutral-500">Linked to 1 query</p>
                  </div>
                </div>
                
                {/* Artifact 8 - Draft */}
                <div className="cursor-pointer flex flex-col" style={{ height: '180px' }}>
                  <div className="flex-1 relative mb-2">
                    <Image 
                    src="/DraftDocumentIllustration.svg" 
                    alt="Draft document"
                    width={100}
                    height={100}
                                          className="w-full h-auto absolute bottom-0 left-0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 mb-1 truncate">Item 1.01 disclosure</p>
                  <p className="text-xs text-neutral-500">Linked to 1 query</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Empty content area for the rest */}
            <div className="flex-1"></div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
