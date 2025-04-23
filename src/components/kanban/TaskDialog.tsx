"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; description: string }) => void;
  data?: { title: string; description: string };
  isEditing?: boolean;
  columnId: string;
}

export function TaskDialog({
  open,
  onOpenChange,
  onSave,
  data = { title: "", description: "" },
  isEditing = false,
  columnId,
}: TaskDialogProps) {
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [isLoading, setIsLoading] = useState(false);

  // Update form when data changes
  useEffect(() => {
    if (open) {
      setTitle(data.title);
      setDescription(data.description);
    }
  }, [data, open]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await onSave({ title, description });
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your task here."
              : "Create a new task for your board."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isLoading}
          >
            {isLoading
              ? (isEditing ? "Saving..." : "Creating...")
              : (isEditing ? "Save Changes" : "Create Task")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
