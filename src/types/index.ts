export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  columns: Column[];
}
