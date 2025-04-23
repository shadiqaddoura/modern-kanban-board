# Modern Kanban Board

A beautiful, responsive Kanban board application built with Next.js, Supabase, and shadcn/ui. This application allows users to create and manage Kanban boards with drag-and-drop functionality for organizing tasks.

## Features

- User authentication with Supabase
- Create, update, and delete boards
- Add columns to boards (e.g., Todo, In Progress, Done)
- Add, edit, move (drag and drop), and delete tasks within columns
- Persistent storage using Supabase PostgreSQL database
- Row Level Security (RLS) to ensure data privacy
- Responsive and mobile-friendly design
- Light/dark theme support

## Tech Stack

- [Next.js](https://nextjs.org) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for authentication, database, and real-time updates
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [dnd-kit](https://dndkit.com/) for drag-and-drop functionality
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/modern-kanban-board.git
cd modern-kanban-board
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up Supabase

- Create a new Supabase project
- Run the SQL from `supabase/schema.sql` in the Supabase SQL editor
- Enable email authentication in the Auth settings
- Copy your Supabase URL and anon key

4. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Run the development server

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Usage

1. Sign up or log in to your account
2. Create a new board from the dashboard
3. Click on a board to view its details
4. Add columns to organize your tasks
5. Add tasks to columns
6. Drag and drop tasks between columns
7. Edit or delete tasks and columns as needed
8. Your data is automatically saved to Supabase

## Project Structure

- `/src/app`: Next.js App Router pages
  - `/src/app/login`: Login page
  - `/src/app/signup`: Signup page
  - `/src/app/board/[id]`: Board detail page
- `/src/components`: React components
  - `/src/components/ui`: shadcn/ui components
  - `/src/components/kanban`: Kanban-specific components
  - `/src/components/layout`: Layout components
- `/src/lib`: Utility functions and helpers
  - `/src/lib/api`: API functions for CRUD operations
  - `/src/lib/auth`: Authentication context and utilities
  - `/src/lib/supabase`: Supabase client utilities
- `/src/types`: TypeScript type definitions
  - `/src/types/supabase.ts`: Database types
- `/supabase`: Supabase-related files
  - `/supabase/schema.sql`: SQL schema for Supabase setup

## Future Enhancements

- Real-time collaborative editing
- Advanced filtering and searching
- Custom labels and tags for tasks
- Task due dates and reminders
- File attachments for tasks
- Activity log and history
- Team management and sharing
- Analytics and reporting

## License

MIT
