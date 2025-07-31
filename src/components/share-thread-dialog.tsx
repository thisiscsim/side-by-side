"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Check, ChevronRight, ArrowLeft, Lock, X, Globe, Users, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ShareThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewType = "main" | "artifact" | "thread" | "sources";

interface User {
  id: string;
  email: string;
  initial: string;
  artifactAccess: "full" | "view" | "none";
  threadAccess: "full" | "view" | "none";
  sourcesAccess: "full" | "view" | "none";
}

export default function ShareThreadDialog({ isOpen, onClose }: ShareThreadDialogProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  // const [shareMode, setShareMode] = useState("invited"); // Currently unused
  const [currentView, setCurrentView] = useState<ViewType>("main");
  
  // Mock users data
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "harvey.specter@paulweiss.com", initial: "H", artifactAccess: "full", threadAccess: "full", sourcesAccess: "full" },
    { id: "2", email: "litt.gang@paulweiss.com", initial: "L", artifactAccess: "full", threadAccess: "full", sourcesAccess: "full" },
    { id: "3", email: "jessica@paulweiss.com", initial: "J", artifactAccess: "view", threadAccess: "view", sourcesAccess: "view" },
    { id: "4", email: "rachel@paulweiss.com", initial: "R", artifactAccess: "view", threadAccess: "view", sourcesAccess: "view" },
  ]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://harvey.ai/threads/abc123xyz");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleInvite = () => {
    if (email && email.includes("@")) {
      // Handle invite logic
      setEmail("");
    }
  };
  
  const handleAccessChange = (userId: string, accessType: "artifactAccess" | "threadAccess" | "sourcesAccess", value: "full" | "view" | "none") => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, [accessType]: value } : user
    ));
  };
  
  const renderMainView = () => (
    <>
      <div className="flex items-center justify-between pl-5 pr-3 py-3">
        <DialogTitle asChild>
          <h2 className="text-base font-medium text-neutral-900">Share thread</h2>
        </DialogTitle>
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
                </div>
          
          <div className="p-3 space-y-4">
        {/* Invite section */}
        <div className="space-y-2 px-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="flex-1 text-sm text-neutral-900"
            />
            <Button 
              onClick={handleInvite}
              className="px-4"
            >
              Invite
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            Only people you&apos;ve granted access will be able to access this project.
          </p>
        </div>
        
        {/* Access levels */}
        <div className="space-y-1">
          <button 
            onClick={() => setCurrentView("artifact")}
            className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="h-4 w-4 text-neutral-700" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4.00001V3.00001H9.00001V4.00001H11ZM9.00001 20V21H11V20H9.00001ZM4.00001 9.00001H3.00001V11H4.00001V9.00001ZM20 11H21V9.00001H20V11ZM19 5.6V18.4H21V5.6H19ZM18.4 19H5.6V21H18.4V19ZM5.00001 18.4V5.6H3.00001V18.4H5.00001ZM5.6 5.00001H18.4V3.00001H5.6V5.00001ZM5.6 19C5.30347 19 5.14123 18.9992 5.02464 18.9897C4.91973 18.9811 4.9425 18.9707 5.00001 19L4.09203 20.782C4.36345 20.9203 4.63319 20.9644 4.86178 20.9831C5.0787 21.0008 5.33647 21 5.6 21V19ZM3.00001 18.4C3.00001 18.6635 2.99922 18.9213 3.01695 19.1382C3.03562 19.3668 3.0797 19.6366 3.218 19.908L5.00001 19C5.02931 19.0575 5.01888 19.0803 5.01031 18.9754C5.00079 18.8588 5.00001 18.6965 5.00001 18.4H3.00001ZM5.00001 19L3.218 19.908C3.40974 20.2843 3.7157 20.5903 4.09203 20.782L5.00001 19ZM19 18.4C19 18.6965 18.9992 18.8588 18.9897 18.9754C18.9811 19.0803 18.9707 19.0575 19 19L20.782 19.908C20.9203 19.6366 20.9644 19.3668 20.9831 19.1382C21.0008 18.9213 21 18.6635 21 18.4H19ZM18.4 21C18.6635 21 18.9213 21.0008 19.1382 20.9831C19.3668 20.9644 19.6366 20.9203 19.908 20.782L19 19C19.0575 18.9707 19.0803 18.9811 18.9754 18.9897C18.8588 18.9992 18.6965 19 18.4 19V21ZM19 19L19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908L19 19ZM21 5.6C21 5.33647 21.0008 5.0787 20.9831 4.86178C20.9644 4.63319 20.9203 4.36345 20.782 4.09203L19 5.00001C18.9707 4.9425 18.9811 4.91973 18.9897 5.02464C18.9992 5.14123 19 5.30347 19 5.6H21ZM18.4 5.00001C18.6965 5.00001 18.8588 5.00079 18.9754 5.01031C19.0803 5.01888 19.0575 5.02931 19 5.00001L19.908 3.218C19.6366 3.0797 19.3668 3.03562 19.1382 3.01695C18.9213 2.99922 18.6635 3.00001 18.4 3.00001V5.00001ZM20.782 4.09203C20.5903 3.7157 20.2843 3.40974 19.908 3.218L19 5.00001L20.782 4.09203ZM5.00001 5.6C5.00001 5.30347 5.00079 5.14123 5.01031 5.02464C5.01888 4.91973 5.02931 4.9425 5.00001 5.00001L3.218 4.09203C3.0797 4.36345 3.03562 4.63319 3.01695 4.86178C2.99922 5.0787 3.00001 5.33647 3.00001 5.6H5.00001ZM5.6 3.00001C5.33647 3.00001 5.0787 2.99922 4.86178 3.01695C4.63319 3.03562 4.36345 3.0797 4.09203 3.218L5.00001 5.00001C4.9425 5.02931 4.91973 5.01888 5.02464 5.01031C5.14123 5.00079 5.30347 5.00001 5.6 5.00001V3.00001ZM5.00001 5.00001L4.09203 3.218C3.7157 3.40974 3.40974 3.7157 3.218 4.09203L5.00001 5.00001ZM9.00001 4.00001V10H11V4.00001H9.00001ZM9.00001 10V20H11V10H9.00001ZM4.00001 11H10V9.00001H4.00001V11ZM10 11H20V9.00001H10V11Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-sm text-neutral-900">Artifact access</span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
          </button>
          
          <button 
            onClick={() => setCurrentView("sources")}
            className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="h-4 w-4 text-neutral-700" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.66659 2H3.99992C3.63173 2 3.33325 2.29848 3.33325 2.66667V13.3333C3.33325 13.7015 3.63173 14 3.99992 14H11.9999C12.3681 14 12.6666 13.7015 12.6666 13.3333V6M8.66659 2L12.6666 6M8.66659 2V5.33333C8.66659 5.70152 8.96505 6 9.33325 6H12.6666" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-neutral-900">Sources access</span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600" />
          </button>
          
          {/* Owner section - no hover state */}
          <div className="w-full flex items-center justify-between p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-medium text-neutral-700">
                M
              </div>
              <span className="text-sm text-neutral-900">mike.ross@paulweiss.com (you)</span>
            </div>
            <span className="text-sm text-neutral-500">Owner</span>
          </div>
        </div>
      </div>
                
          {/* Bottom section */}
          <div className="border-t border-neutral-200 py-4 px-5 flex items-center gap-2">
        <div className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-neutral-600" />
                Only people invited
              </span>
              <ChevronDown className="h-4 w-4 text-neutral-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-neutral-600" />
              <span>Only people invited</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-600" />
              <span>Anyone in your team</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-neutral-600" />
              <span>Anyone with the link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy link</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
  
  const renderAccessView = (type: "artifact" | "thread" | "sources") => {
    const titles = {
      artifact: "Artifact access",
      thread: "Thread access",
      sources: "Sources access"
    };
    
    const accessField = {
      artifact: "artifactAccess",
      thread: "threadAccess",
      sources: "sourcesAccess"
    }[type] as "artifactAccess" | "threadAccess" | "sourcesAccess";
    
    return (
      <>
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setCurrentView("main")}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle asChild>
              <h2 className="text-base font-medium text-neutral-900">{titles[type]}</h2>
            </DialogTitle>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
        
        <div className="p-3 space-y-4">
          {/* Invite section */}
          <div className="space-y-2 px-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                className="flex-1 text-sm text-neutral-900"
              />
              <Button 
                onClick={handleInvite}
                className="px-4"
              >
                Invite
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              Only people you&apos;ve granted access will be able to access this project.
            </p>
          </div>
          
          {/* Users list */}
          <div>
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-medium text-neutral-700">
                    {user.initial}
                  </div>
                  <span className="text-sm text-neutral-900">{user.email}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto py-1 px-2 text-sm font-normal"
                    >
                      <span>
                        {user[accessField] === "full" && "Full access"}
                        {user[accessField] === "view" && "Can view"}
                        {user[accessField] === "none" && "No access"}
                      </span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[140px]">
                    <DropdownMenuItem 
                      onClick={() => handleAccessChange(user.id, accessField, "full")}
                      className="text-sm"
                    >
                      Full access
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleAccessChange(user.id, accessField, "view")}
                      className="text-sm"
                    >
                      Can view
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleAccessChange(user.id, accessField, "none")}
                      className="text-sm"
                    >
                      No access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-neutral-200 py-4 px-5 flex items-center gap-2">
          <div className="flex-1 gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-neutral-600" />
                  Only people invited
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-neutral-600" />
                <span>Only people invited</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Users className="h-4 w-4 text-neutral-600" />
                <span>Anyone in your team</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-600" />
                <span>Anyone with the link</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-neutral-900">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-neutral-600" />
                <span className="text-neutral-900">Copy link</span>
              </>
            )}
          </Button>
        </div>
      </>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[540px] max-w-[540px] p-0 gap-0 overflow-hidden">
        {currentView === "main" && renderMainView()}
        {currentView === "artifact" && renderAccessView("artifact")}
        {currentView === "thread" && renderAccessView("thread")}
        {currentView === "sources" && renderAccessView("sources")}
      </DialogContent>
    </Dialog>
  );
} 