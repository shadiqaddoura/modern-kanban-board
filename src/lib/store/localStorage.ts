import { Board } from "@/types";

const BOARDS_KEY = "kanban-boards";

export const getBoards = (): Board[] => {
  if (typeof window === "undefined") return [];
  
  const storedBoards = localStorage.getItem(BOARDS_KEY);
  return storedBoards ? JSON.parse(storedBoards) : [];
};

export const saveBoards = (boards: Board[]): void => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
};

export const getBoard = (id: string): Board | undefined => {
  const boards = getBoards();
  return boards.find((board) => board.id === id);
};

export const saveBoard = (board: Board): void => {
  const boards = getBoards();
  const existingBoardIndex = boards.findIndex((b) => b.id === board.id);
  
  if (existingBoardIndex !== -1) {
    boards[existingBoardIndex] = board;
  } else {
    boards.push(board);
  }
  
  saveBoards(boards);
};

export const deleteBoard = (id: string): void => {
  const boards = getBoards();
  const updatedBoards = boards.filter((board) => board.id !== id);
  saveBoards(updatedBoards);
};
