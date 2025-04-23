import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Check if we can connect to Supabase
    const { data, error } = await supabase.from("boards").select("count").limit(1);
    
    if (error) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Failed to connect to Supabase", 
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      status: "ok", 
      message: "Successfully connected to Supabase" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error", 
        message: "An unexpected error occurred", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
