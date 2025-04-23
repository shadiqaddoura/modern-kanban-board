"use client";

import { Board } from "@/types";
import { generateId } from "@/lib/utils";
import { saveBoard, getBoards, deleteBoard } from "@/lib/store/localStorage";
import { useEffect, useState } from "react";

export default function Test() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Clear any existing test boards
    const existingBoards = getBoards();
    existingBoards
      .filter(board => board.title.startsWith("Test Board"))
      .forEach(board => deleteBoard(board.id));
    
    addResult("Starting tests...");
    
    // Test 1: Create a board
    const boardId = generateId();
    const testBoard: Board = {
      id: boardId,
      title: "Test Board",
      createdAt: new Date().toISOString(),
      columns: []
    };
    
    saveBoard(testBoard);
    addResult("Test 1: Created a board");
    
    // Test 2: Verify board was saved
    const boards = getBoards();
    const savedBoard = boards.find(b => b.id === boardId);
    
    if (savedBoard) {
      addResult("Test 2: Board was saved successfully");
    } else {
      addResult("Test 2: FAILED - Board was not saved");
    }
    
    // Test 3: Add a column to the board
    if (savedBoard) {
      const updatedBoard = { 
        ...savedBoard, 
        columns: [
          ...savedBoard.columns,
          {
            id: generateId(),
            title: "Test Column",
            boardId: savedBoard.id,
            tasks: []
          }
        ]
      };
      
      saveBoard(updatedBoard);
      addResult("Test 3: Added a column to the board");
      
      // Test 4: Verify column was added
      const boardsAfterColumnAdd = getBoards();
      const boardWithColumn = boardsAfterColumnAdd.find(b => b.id === boardId);
      
      if (boardWithColumn && boardWithColumn.columns.length === 1) {
        addResult("Test 4: Column was added successfully");
        
        // Test 5: Add a task to the column
        const columnId = boardWithColumn.columns[0].id;
        const updatedBoardWithTask = {
          ...boardWithColumn,
          columns: boardWithColumn.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: [
                  ...col.tasks,
                  {
                    id: generateId(),
                    title: "Test Task",
                    description: "This is a test task",
                    createdAt: new Date().toISOString(),
                    columnId: col.id
                  }
                ]
              };
            }
            return col;
          })
        };
        
        saveBoard(updatedBoardWithTask);
        addResult("Test 5: Added a task to the column");
        
        // Test 6: Verify task was added
        const boardsAfterTaskAdd = getBoards();
        const boardWithTask = boardsAfterTaskAdd.find(b => b.id === boardId);
        
        if (boardWithTask && 
            boardWithTask.columns.length === 1 && 
            boardWithTask.columns[0].tasks.length === 1) {
          addResult("Test 6: Task was added successfully");
        } else {
          addResult("Test 6: FAILED - Task was not added");
        }
      } else {
        addResult("Test 4: FAILED - Column was not added");
      }
    }
    
    // Test 7: Delete the board
    deleteBoard(boardId);
    addResult("Test 7: Deleted the board");
    
    // Test 8: Verify board was deleted
    const boardsAfterDelete = getBoards();
    const deletedBoard = boardsAfterDelete.find(b => b.id === boardId);
    
    if (!deletedBoard) {
      addResult("Test 8: Board was deleted successfully");
    } else {
      addResult("Test 8: FAILED - Board was not deleted");
    }
    
    addResult("All tests completed!");
    setIsRunning(false);
  };
  
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Kanban Board Tests</h1>
      <button 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md mb-4"
        onClick={runTests}
        disabled={isRunning}
      >
        {isRunning ? "Running Tests..." : "Run Tests"}
      </button>
      
      <div className="border rounded-md p-4 bg-muted/50">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        {testResults.length === 0 ? (
          <p className="text-muted-foreground">No tests run yet</p>
        ) : (
          <ul className="space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className={result.includes("FAILED") ? "text-destructive" : ""}>
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
