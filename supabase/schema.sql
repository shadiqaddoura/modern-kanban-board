-- Create tables
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS boards_user_id_idx ON boards (user_id);
CREATE INDEX IF NOT EXISTS columns_board_id_idx ON columns (board_id);
CREATE INDEX IF NOT EXISTS tasks_column_id_idx ON tasks (column_id);

-- Set up Row Level Security (RLS)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Users can view their own boards" 
  ON boards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" 
  ON boards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" 
  ON boards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" 
  ON boards FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for columns
CREATE POLICY "Users can view columns of their boards" 
  ON columns FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create columns in their boards" 
  ON columns FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update columns in their boards" 
  ON columns FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete columns in their boards" 
  ON columns FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.uid()
    )
  );

-- Create policies for tasks
CREATE POLICY "Users can view tasks in their boards" 
  ON tasks FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON columns.board_id = boards.id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their boards" 
  ON tasks FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON columns.board_id = boards.id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their boards" 
  ON tasks FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON columns.board_id = boards.id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their boards" 
  ON tasks FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON columns.board_id = boards.id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.uid()
    )
  );

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE boards;
ALTER PUBLICATION supabase_realtime ADD TABLE columns;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
