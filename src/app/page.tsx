"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { BoardCard } from "@/components/kanban/BoardCard";
import { BoardDialog } from "@/components/kanban/BoardDialog";
import { Error } from "@/components/ui/error";
import { createBoard, deleteBoard, getBoards, updateBoard } from "@/lib/api/boards";
import { useAuth } from "@/lib/auth/auth-context";
import { Board } from "@/types/supabase";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBoards = async () => {
    if (!user) return;

    try {
      setError(null);
      setIsLoading(true);
      const boardsData = await getBoards();
      setBoards(boardsData);
    } catch (err: any) {
      console.error("Error fetching boards:", err);
      setError(err.message || "Failed to load boards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  // Set up real-time subscription for boards
  useSupabaseRealtime("boards", fetchBoards, user?.id);

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setDialogOpen(true);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setDialogOpen(true);
  };

  const handleSaveBoard = async (title: string) => {
    if (!user) return;

    if (editingBoard) {
      // Update existing board
      await updateBoard(editingBoard.id, title);
    } else {
      // Create new board
      await createBoard(title);
    }

    fetchBoards();
    setDialogOpen(false);
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to delete this board?")) {
      await deleteBoard(boardId);
      fetchBoards();
    }
  };

  return (
    <AppLayout onCreateBoard={handleCreateBoard}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Kanban Boards</h1>
        <p className="text-muted-foreground">Manage your tasks with Kanban boards</p>
      </div>

      {error ? (
        <Error
          title="Failed to load boards"
          message={error}
          retry={fetchBoards}
          className="h-[300px]"
        />
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-xl font-semibold">No boards yet</h2>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Create your first Kanban board to get started.
          </p>
          <button
            onClick={handleCreateBoard}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Board
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onEdit={handleEditBoard}
              onDelete={handleDeleteBoard}
            />
          ))}
        </div>
      )}

      <BoardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveBoard}
        title={editingBoard?.title || ""}
        isEditing={!!editingBoard}
      />
    </AppLayout>
  );
}
