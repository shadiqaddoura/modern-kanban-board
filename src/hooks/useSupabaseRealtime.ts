"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

type RealtimeCallback = () => void;

export function useSupabaseRealtime(
  table: "boards" | "columns" | "tasks",
  callback: RealtimeCallback,
  userId?: string
) {
  useEffect(() => {
    const supabase = createClient();

    // Only subscribe if we have a user ID
    if (!userId) return;

    // Create a channel for realtime subscriptions
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table,
          filter: table === "boards" ? `user_id=eq.${userId}` : undefined,
        },
        () => {
          // Call the callback function when a change is detected
          callback();
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback, userId]);
}
