"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareThreadDialog({ isOpen, onClose }: ShareThreadDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[480px] max-w-[480px] p-5">
        <DialogHeader>
          <DialogTitle>Share thread</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-neutral-600">Dialog content will go here</p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 