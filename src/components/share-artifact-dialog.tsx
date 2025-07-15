"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareArtifactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artifactTitle: string;
}

export default function ShareArtifactDialog({ isOpen, onClose, artifactTitle }: ShareArtifactDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[480px] max-w-[480px] p-5">
        <DialogHeader>
          <DialogTitle>Share artifact {artifactTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-neutral-600">Dialog content will go here</p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 