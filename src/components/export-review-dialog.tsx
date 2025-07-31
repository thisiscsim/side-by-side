"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ExportReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artifactTitle: string;
}

export default function ExportReviewDialog({ isOpen, onClose, artifactTitle }: ExportReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[540px] max-w-[540px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between pl-5 pr-3 py-3">
          <DialogTitle asChild>
            <h2 className="text-base font-medium text-neutral-900">Export &ldquo;{artifactTitle}&rdquo;</h2>
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
        
        {/* Empty content area for now */}
        <div className="p-3">
          {/* Content will be added later */}
        </div>
      </DialogContent>
    </Dialog>
  );
} 