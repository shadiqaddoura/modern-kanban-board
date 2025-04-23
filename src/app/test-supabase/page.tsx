"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useEffect, useState } from "react";

export default function TestSupabasePage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    if (!user) {
      setTestResults(["Please log in to run tests"]);
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    addResult("Starting Supabase tests...");

    const supabase = createClient();

    try {
      // Test 1: Get user profile
      addResult(`Test 1: User is authenticated as ${user.email}`);

      // Test 2: Create a test board
      const { data: board, error: boardError } = await supabase
        .from("boards")
        .insert({
          title: "Test Board",
          user_id: user.id,
        })
        .select()
        .single();

      if (boardError) {
        addResult(`Test 2: FAILED - Could not create board: ${boardError.message}`);
        return;
      }

      addResult(`Test 2: Successfully created board with ID: ${board.id}`);

      // Test 3: Create a test column
      const { data: column, error: columnError } = await supabase
        .from("columns")
        .insert({
          title: "Test Column",
          board_id: board.id,
          position: 0,
        })
        .select()
        .single();

      if (columnError) {
        addResult(`Test 3: FAILED - Could not create column: ${columnError.message}`);
        return;
      }

      addResult(`Test 3: Successfully created column with ID: ${column.id}`);

      // Test 4: Create a test task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: "Test Task",
          description: "This is a test task",
          column_id: column.id,
          position: 0,
        })
        .select()
        .single();

      if (taskError) {
        addResult(`Test 4: FAILED - Could not create task: ${taskError.message}`);
        return;
      }

      addResult(`Test 4: Successfully created task with ID: ${task.id}`);

      // Test 5: Fetch the board with columns and tasks
      const { data: fetchedBoard, error: fetchError } = await supabase
        .from("boards")
        .select(`
          *,
          columns:columns(
            *,
            tasks:tasks(*)
          )
        `)
        .eq("id", board.id)
        .single();

      if (fetchError) {
        addResult(`Test 5: FAILED - Could not fetch board: ${fetchError.message}`);
        return;
      }

      addResult(`Test 5: Successfully fetched board with ${fetchedBoard.columns.length} column(s) and ${fetchedBoard.columns[0].tasks.length} task(s)`);

      // Test 6: Clean up - Delete the test board (cascades to columns and tasks)
      const { error: deleteError } = await supabase
        .from("boards")
        .delete()
        .eq("id", board.id);

      if (deleteError) {
        addResult(`Test 6: FAILED - Could not delete board: ${deleteError.message}`);
        return;
      }

      addResult("Test 6: Successfully deleted test board and all related data");
      addResult("All tests completed successfully!");
    } catch (error: any) {
      addResult(`Test failed with error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, message]);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Integration Test</CardTitle>
          <CardDescription>
            Test the connection to Supabase and verify that the database schema is set up correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runTests}
            disabled={isRunning || !user}
          >
            {isRunning ? "Running Tests..." : "Run Supabase Tests"}
          </Button>

          <div className="rounded-md border p-4">
            <h3 className="mb-2 font-medium">Test Results:</h3>
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests run yet</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {testResults.map((result, index) => (
                  <li
                    key={index}
                    className={
                      result.includes("FAILED")
                        ? "text-destructive"
                        : result.includes("Successfully")
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }
                  >
                    {result}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!user && (
            <div className="rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              Please log in to run the tests.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
