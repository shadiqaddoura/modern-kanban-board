import { createClient } from "@/lib/supabase/client";
import { Column } from "@/types/supabase";
import { toast } from "sonner";

// Create a new column
export async function createColumn(
  boardId: string,
  title: string,
  position: number
): Promise<Column | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("columns")
      .insert({
        board_id: boardId,
        title,
        position
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Column created successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to create column: ${error.message}`);
    return null;
  }
}

// Update a column
export async function updateColumn(
  columnId: string,
  updates: { title?: string; position?: number }
): Promise<Column | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("columns")
      .update(updates)
      .eq("id", columnId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success("Column updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Failed to update column: ${error.message}`);
    return null;
  }
}

// Delete a column
export async function deleteColumn(columnId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);
    
    if (error) {
      throw error;
    }
    
    toast.success("Column deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Failed to delete column: ${error.message}`);
    return false;
  }
}

// Update multiple columns' positions (for drag and drop)
export async function updateColumnsPositions(
  columnsWithPositions: { id: string; position: number }[]
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Use Promise.all to update all columns in parallel
    const updates = columnsWithPositions.map(({ id, position }) => {
      return supabase
        .from("columns")
        .update({ position })
        .eq("id", id);
    });
    
    await Promise.all(updates);
    
    return true;
  } catch (error: any) {
    toast.error(`Failed to update column positions: ${error.message}`);
    return false;
  }
}
