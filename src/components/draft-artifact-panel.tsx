"use client";

import { motion } from "framer-motion";
import { UserPlus, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DraftDocumentToolbar from "@/components/draft-document-toolbar";
import ShareArtifactDialog from "@/components/share-artifact-dialog";
import ExportReviewDialog from "@/components/export-review-dialog";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

interface DraftArtifactPanelProps {
  selectedArtifact: { title: string; subtitle: string } | null;
  isEditingArtifactTitle: boolean;
  editedArtifactTitle: string;
  onEditedArtifactTitleChange: (value: string) => void;
  onStartEditingTitle: () => void;
  onSaveTitle: () => void;
  onClose: () => void;
  chatOpen: boolean;
  onToggleChat: (open: boolean) => void;
  shareArtifactDialogOpen: boolean;
  onShareArtifactDialogOpenChange: (open: boolean) => void;
  exportReviewDialogOpen: boolean;
  onExportReviewDialogOpenChange: (open: boolean) => void;
  artifactTitleInputRef: React.RefObject<HTMLInputElement | null>;
  sourcesDrawerOpen?: boolean;
  onSourcesDrawerOpenChange?: (open: boolean) => void;
}

const PANEL_ANIMATION = {
  duration: 0.3,
  ease: "easeOut" as const
};

export default function DraftArtifactPanel({
  selectedArtifact,
  isEditingArtifactTitle,
  editedArtifactTitle,
  onEditedArtifactTitleChange,
  onStartEditingTitle,
  onSaveTitle,
  onClose,
  chatOpen,
  onToggleChat,
  shareArtifactDialogOpen,
  onShareArtifactDialogOpenChange,
  exportReviewDialogOpen,
  onExportReviewDialogOpenChange,
  artifactTitleInputRef,
  sourcesDrawerOpen,
  onSourcesDrawerOpenChange
}: DraftArtifactPanelProps) {
  // State to force re-renders on selection change
  const [, forceUpdate] = useState({});

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `
      <p><strong>Memorandum</strong></p>
      <p><strong>To:</strong> [INSERT RECIPIENT NAME AND TITLE]<br/>
      <strong>From:</strong> [INSERT AUTHOR NAME AND TITLE]<br/>
      <strong>Date:</strong> [INSERT DATE]<br/>
      <strong>Re:</strong> [INSERT CONCISE STATEMENT OF SUBJECT/ISSUE]</p>
      <p><strong>Question Presented</strong></p>
      <p>[Begin this introductory paragraph with a single sentence that crisply states the dispositive legal question on which guidance is sought. Follow with any necessary subordinate questions or clarifications, phrased so that each may be answered "yes" or "no." Conclude with a sentence identifying any jurisdictional or procedural posture relevant to the inquiry.]</p>
      <p><strong>Brief Answer</strong></p>
      <p>[Provide a direct, bottom-line response to each question in the order posed above, prefacing each answer with "Yes," "No," or, where appropriate, "Likely," followed by a succinct explanation—typically no more than two or three sentences—summarizing the controlling authority, critical facts, and key reasoning.]</p>
      <p><strong>Facts</strong></p>
      <p>[Set forth an objective, chronologically organized statement of all facts material to the analysis, avoiding legal conclusions or argument. Where the record is incomplete or certain facts remain unverified, flag them expressly and note any assumptions made for purposes of the memorandum. If multiple factual scenarios have been contemplated, delineate each separately, always maintaining a neutral tone.]</p>
    `,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full text-neutral-900',
        'data-placeholder': 'Start writing your document...',
      },
    },
    onUpdate: () => {
      // Force re-render to update toolbar button states
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force re-render when selection changes to update active states
      forceUpdate({});
    },
  });
  return (
    <>
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
          <div className="flex items-center">
            {/* Editable Artifact Title */}
            {isEditingArtifactTitle ? (
              <input
                ref={artifactTitleInputRef}
                type="text"
                value={editedArtifactTitle}
                onChange={(e) => onEditedArtifactTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveTitle();
                  }
                }}
                onFocus={(e) => {
                  // Move cursor to start and scroll to beginning
                  setTimeout(() => {
                    e.target.setSelectionRange(0, 0);
                    e.target.scrollLeft = 0;
                  }, 0);
                }}
                className="text-neutral-900 font-medium bg-neutral-100 border border-neutral-400 outline-none px-2 py-1.5 -ml-1 rounded-md text-sm"
                style={{ 
                  width: `${Math.min(Math.max(editedArtifactTitle.length * 8 + 40, 120), 600)}px`,
                  height: '32px'
                }}
                autoFocus
              />
            ) : (
              <button
                onClick={onStartEditingTitle}
                className="text-neutral-900 font-medium px-2 py-1.5 -ml-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer text-sm"
                style={{ height: '32px' }}
              >
                {selectedArtifact?.title || 'Artifact'}
              </button>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Sources Button */}
            <Button 
              variant="secondary"
              onClick={() => onSourcesDrawerOpenChange?.(!sourcesDrawerOpen)}
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
            {/* Share Button */}
            <button 
              onClick={() => onShareArtifactDialogOpenChange(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-100 transition-colors text-neutral-900 text-sm font-normal" 
              style={{ height: '32px' }}
            >
              <UserPlus size={16} className="text-neutral-900" />
              <span className="text-sm font-normal">Share</span>
            </button>
            {/* Export Button */}
            <button 
              className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-100 transition-colors text-neutral-900 text-sm font-normal" 
              style={{ height: '32px' }}
              onClick={() => onExportReviewDialogOpenChange(true)}
            >
              <Download size={16} className="text-neutral-900" />
              <span className="text-sm font-normal">Export</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <DraftDocumentToolbar
          chatOpen={chatOpen}
          onToggleChat={() => {
            console.log('Toggle button clicked, current state:', chatOpen);
            onToggleChat(!chatOpen);
          }}
          onCloseArtifact={onClose}
          editor={editor}
        />
        
        {/* Content Area */}
        <div 
          className="flex-1 overflow-y-auto bg-neutral-0 cursor-text"
          onClick={(e) => {
            // Focus the editor when clicking anywhere in the content area
            // Only if the click target is the container itself or its direct children
            const target = e.target as HTMLElement;
            if (editor && !editor.isFocused && !target.closest('.ProseMirror')) {
              editor.chain().focus('end').run();
            }
          }}
        >
          <div className="h-full flex justify-center">
            <div className="w-full max-w-[1000px] px-8 py-10">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dialogs */}
      <ShareArtifactDialog
        isOpen={shareArtifactDialogOpen}
        onClose={() => onShareArtifactDialogOpenChange(false)}
        artifactTitle={selectedArtifact?.title || 'Artifact'}
      />
      <ExportReviewDialog
        isOpen={exportReviewDialogOpen}
        onClose={() => onExportReviewDialogOpenChange(false)}
        artifactTitle={selectedArtifact?.title || 'Artifact'}
      />
    </>
  );
}