"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Board } from "@/types/supabase";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (boardId: string) => void;
}

export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">{board.title}</CardTitle>
          <CardDescription>
            Created on {new Date(board.created_at).toLocaleDateString()}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(board)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(board.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {/* We don't have columns count in the board object from Supabase */}
          {/* Will be populated when we fetch the board with columns */}
          Board ID: {board.id.substring(0, 8)}...
        </p>
      </CardContent>
      <CardFooter className="mt-auto pt-2">
        <Link
          href={`/board/${board.id}`}
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View Board
        </Link>
      </CardFooter>
    </Card>
  );
}
