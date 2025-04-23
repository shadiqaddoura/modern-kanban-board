import { createClient } from "@/lib/supabase/client";
import { Task } from "@/types/supabase";
import { toast } from "sonner";

// Create a new task
export async function createTask(
  columnId: string,
  title: string,
  description: string | null,
  position: number
): Promise<Task | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        column_id: columnId,
        title,
        description,
        position
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Task created successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to create task: ${error.message}`);
    return null;
  }
}

// Update a task
export async function updateTask(
  taskId: string,
  updates: { title?: string; description?: string | null; position?: number; column_id?: string }
): Promise<Task | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Task updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update task: ${error.message}`);
    return null;
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);
    
    if (error) {
      throw error;
    }
    
    toast.success("Task deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete task: ${error.message}`);
    return false;
  }
}

// Move a task to a different column
export async function moveTask(
  taskId: string,
  newColumnId: string,
  newPosition: number
): Promise<Task | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        position: newPosition
      })
      .eq("id", taskId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    toast.error(`Failed to move task: ${error.message}`);
    return null;
  }
}

// Update multiple tasks' positions (for drag and drop)
export async function updateTasksPositions(
  tasksWithPositions: { id: string; position: number; column_id?: string }[]
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Use Promise.all to update all tasks in parallel
    const updates = tasksWithPositions.map(({ id, position, column_id }) => {
      const updateData: { position: number; column_id?: string } = { position };
      if (column_id) {
        updateData.column_id = column_id;
      }
      
      return supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id);
    });
    
    await Promise.all(updates);
    
    return true;
  } catch (error: any) {
    toast.error(`Failed to update task positions: ${error.message}`);
    return false;
  }
}
