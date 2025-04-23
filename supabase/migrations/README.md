# Supabase Migrations and Seed Scripts

This directory contains SQL migration scripts for the Modern Kanban Board application, including scripts to seed demo data.

## Available Scripts

- `20230501000000_seed_demo_data.sql` - Creates a demo user and seeds sample data
- `seed_for_user.sql` - Seeds sample data for a specific user ID

## How to Run Migrations

### Option 1: Using the Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste the content of the migration script
5. Click **Run** to execute the script

### Option 2: Using the Supabase CLI

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Log in to your Supabase account:
   ```bash
   supabase login
   ```
3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
4. Run the migration:
   ```bash
   supabase db push
   ```

### Option 3: Using the Node.js Script

We've provided a Node.js script to seed demo data programmatically:

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Set environment variables:
   ```bash
   export SUPABASE_URL=your-supabase-url
   export SUPABASE_KEY=your-supabase-service-role-key
   ```

3. Run the script:
   ```bash
   node scripts/seed-demo-data.js
   ```

   To seed data for a specific user:
   ```bash
   node scripts/seed-demo-data.js --user your-user-id
   ```

## Demo Data Contents

The seed scripts create the following demo data:

### Boards
- Project Management
- Personal Tasks
- Learning Progress

### Columns
- Project Management: To Do, In Progress, Review, Done
- Personal Tasks: Backlog, This Week, Today, Completed
- Learning Progress: Want to Learn, Practicing, Mastered

### Tasks
Each column is populated with relevant sample tasks with descriptions.

## Customizing the Demo Data

To customize the demo data:

1. Edit the SQL scripts in this directory
2. Add or modify the INSERT statements to create your desired data structure
3. Run the updated scripts using one of the methods described above

## Troubleshooting

If you encounter errors when running the scripts:

1. Check that your Supabase project has the correct schema (tables and relationships)
2. Ensure you have the necessary permissions to execute the scripts
3. Look for any constraint violations or syntax errors in the SQL output
4. For the Node.js script, verify that your environment variables are set correctly

## Cleaning Up Demo Data

To remove the demo data:

```sql
-- Delete all tasks
DELETE FROM tasks;

-- Delete all columns
DELETE FROM columns;

-- Delete all boards
DELETE FROM boards;

-- Delete the demo user (if created)
DELETE FROM auth.users WHERE email = 'demo@example.com';
```
