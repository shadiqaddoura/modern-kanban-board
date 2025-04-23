-- SEED DATA FOR A SPECIFIC USER
-- This script creates sample data for the user ID: 565d4108-7e4b-40c1-919e-650b2a2be28a

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temporarily disable RLS to allow direct inserts
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Function to create demo data for a specific user
CREATE OR REPLACE FUNCTION create_demo_data_for_user(user_id UUID)
RETURNS void AS $$
DECLARE
    project_board_id UUID;
    personal_board_id UUID;
    learning_board_id UUID;

    todo_col_id UUID;
    in_progress_col_id UUID;
    review_col_id UUID;
    done_col_id UUID;

    backlog_col_id UUID;
    this_week_col_id UUID;
    today_col_id UUID;
    completed_col_id UUID;

    learn_col_id UUID;
    practicing_col_id UUID;
    mastered_col_id UUID;
BEGIN
    -- Create Project Management Board
    INSERT INTO boards (id, user_id, title, created_at)
    VALUES (
        uuid_generate_v4(),
        user_id,
        'Project Management',
        NOW() - INTERVAL '7 days'
    )
    RETURNING id INTO project_board_id;

    -- Create Personal Tasks Board
    INSERT INTO boards (id, user_id, title, created_at)
    VALUES (
        uuid_generate_v4(),
        user_id,
        'Personal Tasks',
        NOW() - INTERVAL '5 days'
    )
    RETURNING id INTO personal_board_id;

    -- Create Learning Board
    INSERT INTO boards (id, user_id, title, created_at)
    VALUES (
        uuid_generate_v4(),
        user_id,
        'Learning Progress',
        NOW() - INTERVAL '3 days'
    )
    RETURNING id INTO learning_board_id;

    -- Create columns for Project Management Board
    -- To Do column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), project_board_id, 'To Do', 0, NOW() - INTERVAL '7 days')
    RETURNING id INTO todo_col_id;

    -- In Progress column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), project_board_id, 'In Progress', 1, NOW() - INTERVAL '7 days')
    RETURNING id INTO in_progress_col_id;

    -- Review column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), project_board_id, 'Review', 2, NOW() - INTERVAL '7 days')
    RETURNING id INTO review_col_id;

    -- Done column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), project_board_id, 'Done', 3, NOW() - INTERVAL '7 days')
    RETURNING id INTO done_col_id;

    -- Create columns for Personal Tasks Board
    -- Backlog column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), personal_board_id, 'Backlog', 0, NOW() - INTERVAL '5 days')
    RETURNING id INTO backlog_col_id;

    -- This Week column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), personal_board_id, 'This Week', 1, NOW() - INTERVAL '5 days')
    RETURNING id INTO this_week_col_id;

    -- Today column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), personal_board_id, 'Today', 2, NOW() - INTERVAL '5 days')
    RETURNING id INTO today_col_id;

    -- Completed column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), personal_board_id, 'Completed', 3, NOW() - INTERVAL '5 days')
    RETURNING id INTO completed_col_id;

    -- Create columns for Learning Board
    -- Want to Learn column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), learning_board_id, 'Want to Learn', 0, NOW() - INTERVAL '3 days')
    RETURNING id INTO learn_col_id;

    -- Practicing column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), learning_board_id, 'Practicing', 1, NOW() - INTERVAL '3 days')
    RETURNING id INTO practicing_col_id;

    -- Mastered column
    INSERT INTO columns (id, board_id, title, position, created_at)
    VALUES (uuid_generate_v4(), learning_board_id, 'Mastered', 2, NOW() - INTERVAL '3 days')
    RETURNING id INTO mastered_col_id;

    -- Create tasks for Project Management Board
    -- To Do Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), todo_col_id, 'Research competitors', 'Analyze top 5 competitors and create a comparison report', 0, NOW() - INTERVAL '7 days'),
        (uuid_generate_v4(), todo_col_id, 'Create wireframes', 'Design initial wireframes for the new dashboard', 1, NOW() - INTERVAL '7 days'),
        (uuid_generate_v4(), todo_col_id, 'Plan marketing campaign', 'Outline strategy for Q3 marketing campaign', 2, NOW() - INTERVAL '6 days'),
        (uuid_generate_v4(), todo_col_id, 'Update documentation', 'Review and update API documentation', 3, NOW() - INTERVAL '6 days');

    -- In Progress Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), in_progress_col_id, 'Implement authentication', 'Add OAuth support for Google and GitHub', 0, NOW() - INTERVAL '6 days'),
        (uuid_generate_v4(), in_progress_col_id, 'Redesign landing page', 'Update hero section and improve mobile responsiveness', 1, NOW() - INTERVAL '5 days'),
        (uuid_generate_v4(), in_progress_col_id, 'Fix payment gateway bugs', 'Address issues with international payments', 2, NOW() - INTERVAL '4 days');

    -- Review Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), review_col_id, 'User profile feature', 'New user profile page with customization options', 0, NOW() - INTERVAL '5 days'),
        (uuid_generate_v4(), review_col_id, 'Performance optimizations', 'Database query optimizations and frontend bundle size reduction', 1, NOW() - INTERVAL '3 days');

    -- Done Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), done_col_id, 'Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 0, NOW() - INTERVAL '6 days'),
        (uuid_generate_v4(), done_col_id, 'Create project roadmap', 'Define milestones and deliverables for Q3 and Q4', 1, NOW() - INTERVAL '5 days'),
        (uuid_generate_v4(), done_col_id, 'Upgrade dependencies', 'Update all npm packages to latest versions', 2, NOW() - INTERVAL '4 days'),
        (uuid_generate_v4(), done_col_id, 'Security audit', 'Perform security review and address vulnerabilities', 3, NOW() - INTERVAL '2 days');

    -- Create tasks for Personal Tasks Board
    -- Backlog Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), backlog_col_id, 'Plan summer vacation', 'Research destinations and create budget', 0, NOW() - INTERVAL '5 days'),
        (uuid_generate_v4(), backlog_col_id, 'Learn Spanish', 'Find a good online course or tutor', 1, NOW() - INTERVAL '5 days'),
        (uuid_generate_v4(), backlog_col_id, 'Organize digital photos', 'Sort and tag photos from the last 3 years', 2, NOW() - INTERVAL '4 days'),
        (uuid_generate_v4(), backlog_col_id, 'Update resume', 'Add recent projects and refresh skills section', 3, NOW() - INTERVAL '4 days');

    -- This Week Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), this_week_col_id, 'Schedule dentist appointment', 'Call Dr. Smith for annual checkup', 0, NOW() - INTERVAL '4 days'),
        (uuid_generate_v4(), this_week_col_id, 'Fix kitchen sink', 'Buy parts and repair leaking faucet', 1, NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), this_week_col_id, 'Plan birthday party', 'Create guest list and choose venue', 2, NOW() - INTERVAL '3 days');

    -- Today Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), today_col_id, 'Grocery shopping', 'Buy ingredients for dinner party', 0, NOW() - INTERVAL '2 days'),
        (uuid_generate_v4(), today_col_id, 'Pay bills', 'Electricity, internet, and water bills', 1, NOW() - INTERVAL '1 day');

    -- Completed Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), completed_col_id, 'Book flight tickets', 'Round trip to San Francisco for conference', 0, NOW() - INTERVAL '4 days'),
        (uuid_generate_v4(), completed_col_id, 'Renew gym membership', 'Sign up for the annual plan', 1, NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), completed_col_id, 'Update phone plan', 'Switch to the new unlimited data plan', 2, NOW() - INTERVAL '2 days');

    -- Create tasks for Learning Board
    -- Want to Learn Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), learn_col_id, 'GraphQL', 'Learn basics and build a simple API', 0, NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), learn_col_id, 'Machine Learning', 'Complete introductory course on Coursera', 1, NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), learn_col_id, 'Blockchain Development', 'Build a simple smart contract', 2, NOW() - INTERVAL '2 days'),
        (uuid_generate_v4(), learn_col_id, 'Swift UI', 'Create a basic iOS app', 3, NOW() - INTERVAL '2 days');

    -- Practicing Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), practicing_col_id, 'React Hooks', 'Refactor class components to functional components with hooks', 0, NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), practicing_col_id, 'TypeScript', 'Convert JavaScript project to TypeScript', 1, NOW() - INTERVAL '2 days'),
        (uuid_generate_v4(), practicing_col_id, 'Docker', 'Containerize existing applications', 2, NOW() - INTERVAL '1 day');

    -- Mastered Column
    INSERT INTO tasks (id, column_id, title, description, position, created_at)
    VALUES
        (uuid_generate_v4(), mastered_col_id, 'HTML & CSS', 'Built multiple responsive websites', 0, NOW() - INTERVAL '3 days'),
        (uuid_generate_v4(), mastered_col_id, 'JavaScript', 'Proficient in ES6+ features and async programming', 1, NOW() - INTERVAL '2 days'),
        (uuid_generate_v4(), mastered_col_id, 'Git', 'Comfortable with advanced git workflows', 2, NOW() - INTERVAL '1 day');

    -- Output success message
    RAISE NOTICE 'Demo data created successfully for user ID: %', user_id;
END;
$$ LANGUAGE plpgsql;

-- Execute the function with the specified user ID
SELECT create_demo_data_for_user('565d4108-7e4b-40c1-919e-650b2a2be28a');

-- Clean up (remove the function after use)
DROP FUNCTION IF EXISTS create_demo_data_for_user(UUID);

-- Re-enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'Demo data seeding completed successfully.';
END $$;
