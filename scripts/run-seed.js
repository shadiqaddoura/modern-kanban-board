/**
 * Temporary script to run the seed for a specific user
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// User ID to seed data for
const userId = '565d4108-7e4b-40c1-919e-650b2a2be28a';

// Get Supabase credentials from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key must be set in .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDataForUser() {
  try {
    console.log(`Seeding data for user ID: ${userId}`);

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', 'seed_for_user.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Replace the placeholder with the actual user ID
    sqlContent = sqlContent.replace('YOUR-USER-ID-HERE', userId);
    
    // Since we can't directly execute SQL with the anon key, let's use the Supabase API
    // to create the boards, columns, and tasks

    // Create Project Management Board
    const { data: projectBoard, error: projectBoardError } = await supabase
      .from('boards')
      .insert({
        user_id: userId,
        title: 'Project Management',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (projectBoardError) {
      throw new Error(`Error creating Project Management board: ${projectBoardError.message}`);
    }
    
    console.log(`Created Project Management board with ID: ${projectBoard.id}`);

    // Create Personal Tasks Board
    const { data: personalBoard, error: personalBoardError } = await supabase
      .from('boards')
      .insert({
        user_id: userId,
        title: 'Personal Tasks',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (personalBoardError) {
      throw new Error(`Error creating Personal Tasks board: ${personalBoardError.message}`);
    }
    
    console.log(`Created Personal Tasks board with ID: ${personalBoard.id}`);

    // Create Learning Board
    const { data: learningBoard, error: learningBoardError } = await supabase
      .from('boards')
      .insert({
        user_id: userId,
        title: 'Learning Progress',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (learningBoardError) {
      throw new Error(`Error creating Learning Progress board: ${learningBoardError.message}`);
    }
    
    console.log(`Created Learning Progress board with ID: ${learningBoard.id}`);

    // Create columns for Project Management Board
    const projectColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Review', position: 2 },
      { title: 'Done', position: 3 }
    ];

    for (const column of projectColumns) {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          board_id: projectBoard.id,
          title: column.title,
          position: column.position,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating column ${column.title}: ${error.message}`);
      }
      
      console.log(`Created column ${column.title} with ID: ${data.id}`);
      
      // Add some tasks to each column
      if (column.title === 'To Do') {
        const tasks = [
          { 
            title: 'Research competitors', 
            description: 'Analyze top 5 competitors and create a comparison report', 
            position: 0 
          },
          { 
            title: 'Create wireframes', 
            description: 'Design initial wireframes for the new dashboard', 
            position: 1 
          }
        ];
        
        for (const task of tasks) {
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .insert({
              column_id: data.id,
              title: task.title,
              description: task.description,
              position: task.position,
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
            
          if (taskError) {
            throw new Error(`Error creating task ${task.title}: ${taskError.message}`);
          }
          
          console.log(`Created task ${task.title} with ID: ${taskData.id}`);
        }
      }
    }

    // Create columns for Personal Tasks Board
    const personalColumns = [
      { title: 'Backlog', position: 0 },
      { title: 'This Week', position: 1 },
      { title: 'Today', position: 2 },
      { title: 'Completed', position: 3 }
    ];

    for (const column of personalColumns) {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          board_id: personalBoard.id,
          title: column.title,
          position: column.position,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating column ${column.title}: ${error.message}`);
      }
      
      console.log(`Created column ${column.title} with ID: ${data.id}`);
      
      // Add some tasks to each column
      if (column.title === 'Backlog') {
        const tasks = [
          { 
            title: 'Plan summer vacation', 
            description: 'Research destinations and create budget', 
            position: 0 
          },
          { 
            title: 'Learn Spanish', 
            description: 'Find a good online course or tutor', 
            position: 1 
          }
        ];
        
        for (const task of tasks) {
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .insert({
              column_id: data.id,
              title: task.title,
              description: task.description,
              position: task.position,
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
            
          if (taskError) {
            throw new Error(`Error creating task ${task.title}: ${taskError.message}`);
          }
          
          console.log(`Created task ${task.title} with ID: ${taskData.id}`);
        }
      }
    }

    // Create columns for Learning Board
    const learningColumns = [
      { title: 'Want to Learn', position: 0 },
      { title: 'Practicing', position: 1 },
      { title: 'Mastered', position: 2 }
    ];

    for (const column of learningColumns) {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          board_id: learningBoard.id,
          title: column.title,
          position: column.position,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating column ${column.title}: ${error.message}`);
      }
      
      console.log(`Created column ${column.title} with ID: ${data.id}`);
      
      // Add some tasks to each column
      if (column.title === 'Want to Learn') {
        const tasks = [
          { 
            title: 'GraphQL', 
            description: 'Learn basics and build a simple API', 
            position: 0 
          },
          { 
            title: 'Machine Learning', 
            description: 'Complete introductory course on Coursera', 
            position: 1 
          }
        ];
        
        for (const task of tasks) {
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .insert({
              column_id: data.id,
              title: task.title,
              description: task.description,
              position: task.position,
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
            
          if (taskError) {
            throw new Error(`Error creating task ${task.title}: ${taskError.message}`);
          }
          
          console.log(`Created task ${task.title} with ID: ${taskData.id}`);
        }
      }
    }
    
    console.log('Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
    throw error;
  }
}

// Run the seed function
seedDataForUser()
  .then(() => {
    console.log('Seed process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed process failed:', error.message);
    process.exit(1);
  });
