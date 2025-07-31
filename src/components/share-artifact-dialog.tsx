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
import { Copy, Check, Globe, Lock, Users, X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ShareArtifactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artifactTitle: string;
}

interface User {
  id: string;
  email: string;
  initial: string;
  access: "full" | "view" | "none";
}

export default function ShareArtifactDialog({ isOpen, onClose, artifactTitle }: ShareArtifactDialogProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  // const [shareMode, setShareMode] = useState("invited"); // Currently unused
  
  // Mock users data
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "harvey.specter@paulweiss.com", initial: "H", access: "full" },
    { id: "2", email: "litt.gang@paulweiss.com", initial: "L", access: "full" },
    { id: "3", email: "jessica@paulweiss.com", initial: "J", access: "view" },
    { id: "4", email: "rachel@paulweiss.com", initial: "R", access: "view" },
  ]);
  
  const shareLink = `https://harvey.ai/artifacts/${encodeURIComponent(artifactTitle.toLowerCase().replace(/\s+/g, '-'))}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleInvite = () => {
    if (email && email.includes("@")) {
      // Handle invite logic
      setEmail("");
    }
  };
  
  const handleAccessChange = (userId: string, value: "full" | "view" | "none") => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, access: value } : user
    ));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[540px] max-w-[540px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between pl-5 pr-3 py-3">
          <DialogTitle asChild>
            <h2 className="text-base font-medium text-neutral-900">Share &ldquo;{artifactTitle}&rdquo;</h2>
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
              Only people you&apos;ve granted access will be able to access this artifact.
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
                        {user.access === "full" && "Full access"}
                        {user.access === "view" && "Can view"}
                        {user.access === "none" && "No access"}
                      </span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[140px]">
                    <DropdownMenuItem 
                      onClick={() => handleAccessChange(user.id, "full")}
                      className="text-sm"
                    >
                      Full access
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleAccessChange(user.id, "view")}
                      className="text-sm"
                    >
                      Can view
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleAccessChange(user.id, "none")}
                      className="text-sm"
                    >
                      No access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            
            {/* Owner section - no hover state */}
            <div className="w-full flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-medium text-neutral-700">
                  M
                </div>
                <span className="text-sm text-neutral-900">mike.ross@paulweiss.com (you)</span>
              </div>
              <div className="h-auto py-1 px-2 text-sm font-normal text-neutral-500">
                Owner
              </div>
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
      </DialogContent>
    </Dialog>
  );
} 