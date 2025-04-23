"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Column } from "@/components/kanban/Column";
import { ColumnDialog } from "@/components/kanban/ColumnDialog";
import { TaskDialog } from "@/components/kanban/TaskDialog";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/ui/error";
import { Skeleton } from "@/components/ui/skeleton";
import { getBoardWithColumnsAndTasks } from "@/lib/api/boards";
import { createColumn, deleteColumn, updateColumn, updateColumnsPositions } from "@/lib/api/columns";
import { createTask, deleteTask, moveTask, updateTask, updateTasksPositions } from "@/lib/api/tasks";
import { useAuth } from "@/lib/auth/auth-context";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { BoardWithColumns, Column as ColumnType, Task } from "@/types/supabase";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  const { user } = useAuth();

  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<ColumnType | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [taskData, setTaskData] = useState({ title: "", description: "" });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const fetchBoard = async () => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);
      const boardData = await getBoardWithColumnsAndTasks(boardId);

      if (boardData) {
        setBoard(boardData);
      } else {
        toast.error("Board not found");
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error fetching board:", err);
      setError(err.message || "Failed to load board");
      toast.error("Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBoard();
    }
  }, [boardId, user]);

  // Set up real-time subscriptions
  useSupabaseRealtime("boards", fetchBoard, user?.id);
  useSupabaseRealtime("columns", fetchBoard, user?.id);
  useSupabaseRealtime("tasks", fetchBoard, user?.id);

  const handleCreateColumn = () => {
    setEditingColumn(null);
    setColumnTitle("");
    setColumnDialogOpen(true);
  };

  const handleEditColumn = (column: ColumnType) => {
    setEditingColumn(column);
    setColumnTitle(column.title);
    setColumnDialogOpen(true);
  };

  const handleSaveColumn = async (title: string) => {
    if (!board || !user) return;

    try {
      if (editingColumn) {
        // Update existing column
        await updateColumn(editingColumn.id, { title });
      } else {
        // Create new column
        // Find the highest position and add 1
        const position = board.columns.length > 0
          ? Math.max(...board.columns.map(col => col.position)) + 1
          : 0;

        await createColumn(board.id, title, position);
      }

      // Refresh the board data
      await fetchBoard();
      setColumnDialogOpen(false);
    } catch (error) {
      console.error("Error saving column:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!board || !user) return;

    if (confirm("Are you sure you want to delete this column and all its tasks?")) {
      try {
        await deleteColumn(columnId);
        await fetchBoard();
      } catch (error) {
        console.error("Error deleting column:", error);
      }
    }
  };

  const handleCreateTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setEditingTask(null);
    setTaskData({ title: "", description: "" });
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setActiveColumnId(task.column_id);
    setEditingTask(task);
    setTaskData({
      title: task.title,
      description: task.description || ""
    });
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (data: { title: string; description: string }) => {
    if (!board || !user || !activeColumnId) return;

    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, {
          title: data.title,
          description: data.description || null,
          // If column changed, we'll handle that separately
          column_id: activeColumnId !== editingTask.column_id ? activeColumnId : undefined
        });
      } else {
        // Create new task
        // Find the highest position in the column and add 1
        const column = board.columns.find(col => col.id === activeColumnId);
        const position = column && column.tasks.length > 0
          ? Math.max(...column.tasks.map(task => task.position)) + 1
          : 0;

        await createTask(
          activeColumnId,
          data.title,
          data.description || null,
          position
        );
      }

      // Refresh the board data
      await fetchBoard();
      setTaskDialogOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!board || !user) return;

    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        await fetchBoard();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;

    if (active.data.current?.type === "Column") {
      setActiveColumn(active.data.current.column);
    }

    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board || !user) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      const activeTask = active.data.current?.task as Task;
      const overTask = over.data.current?.task as Task;

      // If tasks are in different columns
      if (activeTask.column_id !== overTask.column_id) {
        // We'll handle this in handleDragEnd
        // Just update the UI for now
        const activeColumn = board.columns.find(
          (col) => col.id === activeTask.column_id
        );
        const overColumn = board.columns.find(
          (col) => col.id === overTask.column_id
        );

        if (!activeColumn || !overColumn) return;

        // Create a temporary updated board for UI purposes only
        const updatedActiveColumn = {
          ...activeColumn,
          tasks: activeColumn.tasks.filter((task) => task.id !== activeTask.id),
        };

        // Find the index of the task we're dragging over
        const overTaskIndex = overColumn.tasks.findIndex(
          (task) => task.id === overTask.id
        );

        // Insert the active task at the new position
        const updatedOverColumn = {
          ...overColumn,
          tasks: [
            ...overColumn.tasks.slice(0, overTaskIndex),
            { ...activeTask, column_id: overColumn.id },
            ...overColumn.tasks.slice(overTaskIndex),
          ],
        };

        // Update the board with the new columns (UI only)
        const updatedColumns = board.columns.map((col) => {
          if (col.id === updatedActiveColumn.id) return updatedActiveColumn;
          if (col.id === updatedOverColumn.id) return updatedOverColumn;
          return col;
        });

        // Update UI only, we'll save to Supabase in handleDragEnd
        setBoard({ ...board, columns: updatedColumns });
      } else {
        // If tasks are in the same column, just reorder (UI only)
        const column = board.columns.find((col) => col.id === activeTask.column_id);
        if (!column) return;

        const oldIndex = column.tasks.findIndex((task) => task.id === activeTask.id);
        const newIndex = column.tasks.findIndex((task) => task.id === overTask.id);

        const updatedTasks = arrayMove(column.tasks, oldIndex, newIndex);
        const updatedColumn = { ...column, tasks: updatedTasks };

        const updatedColumns = board.columns.map((col) =>
          col.id === updatedColumn.id ? updatedColumn : col
        );

        // Update UI only, we'll save to Supabase in handleDragEnd
        setBoard({ ...board, columns: updatedColumns });
      }
    }

    // Dropping a Task over a Column
    const isOverAColumn = over.data.current?.type === "Column";
    if (isActiveATask && isOverAColumn) {
      const activeTask = active.data.current?.task as Task;
      const overColumn = over.data.current?.column as ColumnType;

      // If the task is already in this column, do nothing
      if (activeTask.column_id === overColumn.id) return;

      // Find the source column
      const sourceColumn = board.columns.find(
        (col) => col.id === activeTask.column_id
      );
      if (!sourceColumn) return;

      // Create a temporary updated board for UI purposes only
      const updatedSourceColumn = {
        ...sourceColumn,
        tasks: sourceColumn.tasks.filter((task) => task.id !== activeTask.id),
      };

      // Add task to target column
      const updatedTargetColumn = {
        ...overColumn,
        tasks: [...overColumn.tasks, { ...activeTask, column_id: overColumn.id }],
      };

      // Update the board with the new columns (UI only)
      const updatedColumns = board.columns.map((col) => {
        if (col.id === updatedSourceColumn.id) return updatedSourceColumn;
        if (col.id === updatedTargetColumn.id) return updatedTargetColumn;
        return col;
      });

      // Update UI only, we'll save to Supabase in handleDragEnd
      setBoard({ ...board, columns: updatedColumns });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !board || !user) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    try {
      const isActiveATask = active.data.current?.type === "Task";
      const isOverATask = over.data.current?.type === "Task";
      const isOverAColumn = over.data.current?.type === "Column";

      // Handle task movements
      if (isActiveATask && (isOverATask || isOverAColumn)) {
        const activeTask = active.data.current?.task as Task;
        let newColumnId: string;
        let newPosition: number;

        if (isOverATask) {
          // Task over task
          const overTask = over.data.current?.task as Task;
          newColumnId = overTask.column_id;

          // Calculate new position
          const column = board.columns.find(col => col.id === newColumnId);
          if (!column) return;

          if (activeTask.column_id === newColumnId) {
            // Same column reordering
            const tasks = [...column.tasks];
            const oldIndex = tasks.findIndex(t => t.id === activeTask.id);
            const newIndex = tasks.findIndex(t => t.id === overTask.id);

            // Remove the task from its old position
            tasks.splice(oldIndex, 1);
            // Insert it at the new position
            tasks.splice(newIndex, 0, activeTask);

            // Update positions for all tasks in the column
            const tasksWithPositions = tasks.map((task, index) => ({
              id: task.id,
              position: index
            }));

            await updateTasksPositions(tasksWithPositions);
          } else {
            // Moving to a different column
            newPosition = column.tasks.findIndex(t => t.id === overTask.id);
            await moveTask(activeTask.id, newColumnId, newPosition);
          }
        } else if (isOverAColumn) {
          // Task over column
          const overColumn = over.data.current?.column as ColumnType;
          newColumnId = overColumn.id;
          newPosition = overColumn.tasks.length; // Add to the end

          await moveTask(activeTask.id, newColumnId, newPosition);
        }
      }

      // Handle column reordering
      const isActiveAColumn = active.data.current?.type === "Column";
      if (isActiveAColumn && isOverAColumn) {
        // Reorder columns
        const activeColumnIndex = board.columns.findIndex(col => col.id === activeId);
        const overColumnIndex = board.columns.findIndex(col => col.id === overId);

        // Create a new array with the updated positions
        const updatedColumns = arrayMove([...board.columns], activeColumnIndex, overColumnIndex);
        const columnsWithPositions = updatedColumns.map((col, index) => ({
          id: col.id,
          position: index
        }));

        await updateColumnsPositions(columnsWithPositions);
      }

      // Refresh the board data
      await fetchBoard();
    } catch (error) {
      console.error("Error updating positions:", error);
      toast.error("Failed to update positions");
      // Refresh to get the correct state
      await fetchBoard();
    } finally {
      // Reset active items
      setActiveColumn(null);
      setActiveTask(null);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <Error
          title="Failed to load board"
          message={error}
          retry={fetchBoard}
          className="h-[calc(100vh-200px)]"
        />
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="mt-2 h-4 w-[150px]" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="flex h-[calc(100vh-200px)] gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-full w-[280px] rounded-lg" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!board) {
    return (
      <AppLayout>
        <div className="flex h-[300px] flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Board not found</h2>
          <p className="mt-2 text-muted-foreground">
            The board you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4"
          >
            Go back to dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{board.title}</h1>
          <p className="text-muted-foreground">
            Created on {new Date(board.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={handleCreateColumn} className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Column</span>
        </Button>
      </div>

      <div className="flex h-[calc(100vh-200px)] gap-4 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={board.columns.map((col) => col.id)}>
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={() => handleCreateTask(column.id)}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </SortableContext>

          {board.columns.length === 0 && (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h2 className="text-xl font-semibold">No columns yet</h2>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Create your first column to get started.
              </p>
              <Button onClick={handleCreateColumn} className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Column</span>
              </Button>
            </div>
          )}

          <DragOverlay>
            {activeColumn && (
              <Column
                column={activeColumn}
                onAddTask={() => {}}
                onEditColumn={() => {}}
                onDeleteColumn={() => {}}
                onEditTask={() => {}}
                onDeleteTask={() => {}}
              />
            )}
            {/* Add TaskCard overlay here if needed */}
          </DragOverlay>
        </DndContext>
      </div>

      <ColumnDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        onSave={handleSaveColumn}
        title={columnTitle}
        isEditing={!!editingColumn}
        boardId={board.id}
      />

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        data={taskData}
        isEditing={!!editingTask}
        columnId={activeColumnId || ""}
      />
    </AppLayout>
  );
}
