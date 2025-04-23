import { createClient } from "@/lib/supabase/client";
import { Board, BoardWithColumns, Column, Task } from "@/types/supabase";
import { toast } from "sonner";

// Get all boards for the current user
export async function getBoards(): Promise<Board[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    toast.error(`Failed to fetch boards: ${error.message}`);
    return [];
  }
}

// Get a single board with its columns and tasks
export async function getBoardWithColumnsAndTasks(boardId: string): Promise<BoardWithColumns | null> {
  try {
    const supabase = createClient();
    
    // Get the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();
    
    if (boardError) {
      throw boardError;
    }
    
    if (!board) {
      return null;
    }
    
    // Get the columns for this board
    const { data: columns, error: columnsError } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });
    
    if (columnsError) {
      throw columnsError;
    }
    
    // Get tasks for all columns
    const columnIds = columns.map(column => column.id);
    
    let tasks: Task[] = [];
    
    if (columnIds.length > 0) {
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .in("column_id", columnIds)
        .order("position", { ascending: true });
      
      if (tasksError) {
        throw tasksError;
      }
      
      tasks = tasksData;
    }
    
    // Organize tasks by column
    const columnsWithTasks = columns.map(column => ({
      ...column,
      tasks: tasks.filter(task => task.column_id === column.id)
    }));
    
    return {
      ...board,
      columns: columnsWithTasks
    };
  } catch (error: any) {
    toast.error(`Failed to fetch board: ${error.message}`);
    return null;
  }
}

// Create a new board
export async function createBoard(title: string): Promise<Board | null> {
  try {
    const supabase = createClient();
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw userError;
    }
    
    const { data, error } = await supabase
      .from("boards")
      .insert({
        title,
        user_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Board created successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to create board: ${error.message}`);
    return null;
  }
}

// Update a board
export async function updateBoard(boardId: string, title: string): Promise<Board | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("boards")
      .update({ title })
      .eq("id", boardId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Board updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update board: ${error.message}`);
    return null;
  }
}

// Delete a board
export async function deleteBoard(boardId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);
    
    if (error) {
      throw error;
    }
    
    toast.success("Board deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete board: ${error.message}`);
    return false;
  }
}
