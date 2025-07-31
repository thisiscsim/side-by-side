"use client";

import { 
  ChevronsLeft, 
  ChevronsRight, 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline as UnderlineIcon,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Clipboard,
  Scissors,
  List,
  ListOrdered,
  Undo,
  Redo,
  Code
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor } from '@tiptap/react';

interface DraftDocumentToolbarProps {
  chatOpen: boolean;
  onToggleChat: () => void;
  onCloseArtifact?: () => void;
  editor: Editor | null;
}

export default function DraftDocumentToolbar({ chatOpen, onToggleChat, onCloseArtifact, editor }: DraftDocumentToolbarProps) {
  if (!editor) {
    return null;
  }

  // Helper function to set link
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Helper functions for clipboard operations
  const handleCopy = () => {
    document.execCommand('copy');
  };

  const handleCut = () => {
    document.execCommand('cut');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch {
      // Fallback for browsers that don't support clipboard API
      document.execCommand('paste');
    }
  };

  return (
    <TooltipProvider>
      <div className="px-3 py-2 border-b border-neutral-200 bg-white flex items-center justify-between overflow-x-auto" style={{ minHeight: '52px' }}>
        <div className="flex items-center gap-1">
          {/* Toggle Chat Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onToggleChat}
                className="p-2 rounded-md transition-colors hover:bg-neutral-100 text-neutral-600"
              >
                {chatOpen ? (
                  <ChevronsLeft size={16} />
                ) : (
                  <ChevronsRight size={16} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{chatOpen ? "Hide assistant" : "Show assistant"}</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>
          
          {/* Text Formatting Options */}
          <div className="flex items-center gap-1">
            {/* Bold */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('bold') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Bold size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bold (Cmd+B)</p>
              </TooltipContent>
            </Tooltip>

            {/* Italic */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('italic') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Italic size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Italic (Cmd+I)</p>
              </TooltipContent>
            </Tooltip>

            {/* Underline */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('underline') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <UnderlineIcon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Underline (Cmd+U)</p>
              </TooltipContent>
            </Tooltip>

            {/* Strikethrough */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('strike') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Strikethrough size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Strikethrough</p>
              </TooltipContent>
            </Tooltip>

            {/* Code */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('code') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Code size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Code</p>
              </TooltipContent>
            </Tooltip>

            {/* Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={setLink}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('link') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Link size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Link</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive({ textAlign: 'left' }) || (!editor.isActive({ textAlign: 'center' }) && !editor.isActive({ textAlign: 'right' })) ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <AlignLeft size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Left</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive({ textAlign: 'center' }) ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <AlignCenter size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Center</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive({ textAlign: 'right' }) ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <AlignRight size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Right</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>

          {/* Lists */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('bulletList') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <List size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bullet List</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive('orderedList') ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <ListOrdered size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Numbered List</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>

          {/* Clipboard Operations */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleCopy}
                  className="p-2 rounded-md transition-colors hover:bg-neutral-100 text-neutral-600"
                >
                  <Copy size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy (Cmd+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleCut}
                  className="p-2 rounded-md transition-colors hover:bg-neutral-100 text-neutral-600"
                >
                  <Scissors size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cut (Cmd+X)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handlePaste}
                  className="p-2 rounded-md transition-colors hover:bg-neutral-100 text-neutral-600"
                >
                  <Clipboard size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste (Cmd+V)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Separator */}
          <div className="w-px bg-neutral-200" style={{ height: '20px' }}></div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.can().undo() 
                      ? 'hover:bg-neutral-100 text-neutral-600' 
                      : 'text-neutral-300 cursor-not-allowed'
                  }`}
                >
                  <Undo size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Cmd+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className={`p-2 rounded-md transition-colors ${
                    editor.can().redo() 
                      ? 'hover:bg-neutral-100 text-neutral-600' 
                      : 'text-neutral-300 cursor-not-allowed'
                  }`}
                >
                  <Redo size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Cmd+Shift+Z)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Close button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={chatOpen ? onCloseArtifact : undefined}
                disabled={!chatOpen}
                className={`p-2 rounded-md transition-colors ${
                  chatOpen 
                    ? 'hover:bg-neutral-100 text-neutral-600' 
                    : 'text-neutral-300 cursor-not-allowed'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{chatOpen ? "Close" : "Open assistant to close artifact"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}