#!/usr/bin/env node

/**
 * Seed Demo Data Script
 * 
 * This script seeds demo data into the Supabase database for testing and demonstration purposes.
 * It can be run with Node.js and requires the Supabase credentials to be set in environment variables.
 * 
 * Usage:
 *   node seed-demo-data.js [--user <user-id>]
 * 
 * Options:
 *   --user <user-id>  Seed data for a specific user ID (optional)
 *   --help            Show help
 * 
 * Environment Variables:
 *   SUPABASE_URL      Supabase project URL
 *   SUPABASE_KEY      Supabase service role key (requires more privileges than anon key)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
let userId = null;
let showHelp = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--user' && i + 1 < args.length) {
    userId = args[i + 1];
    i++;
  } else if (args[i] === '--help') {
    showHelp = true;
  }
}

if (showHelp) {
  console.log(`
Seed Demo Data Script

This script seeds demo data into the Supabase database for testing and demonstration purposes.

Usage:
  node seed-demo-data.js [--user <user-id>]

Options:
  --user <user-id>  Seed data for a specific user ID (optional)
  --help            Show this help message

Environment Variables:
  SUPABASE_URL      Supabase project URL
  SUPABASE_KEY      Supabase service role key (requires more privileges than anon key)
  `);
  process.exit(0);
}

// Check for required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set.');
  console.error('You can set them by running:');
  console.error('  export SUPABASE_URL=your-supabase-url');
  console.error('  export SUPABASE_KEY=your-supabase-service-role-key');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create a demo user
async function createDemoUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'demo@example.com',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        name: 'Demo User'
      }
    });

    if (error) {
      throw error;
    }

    console.log(`Created demo user with ID: ${data.user.id}`);
    return data.user.id;
  } catch (error) {
    console.error('Error creating demo user:', error.message);
    throw error;
  }
}

// Function to seed data for a specific user
async function seedDataForUser(userId) {
  try {
    console.log(`Seeding data for user ID: ${userId}`);

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', 'seed_for_user.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Replace the placeholder with the actual user ID
    sqlContent = sqlContent.replace('YOUR-USER-ID-HERE', userId);
    
    // Execute the SQL using the Supabase client
    const { error } = await supabase.rpc('pgfunction', { query: sqlContent });
    
    if (error) {
      throw error;
    }
    
    console.log('Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // If no user ID is provided, create a demo user
    if (!userId) {
      userId = await createDemoUser();
    }
    
    // Seed data for the user
    await seedDataForUser(userId);
    
    console.log('Seed process completed successfully!');
  } catch (error) {
    console.error('Seed process failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
