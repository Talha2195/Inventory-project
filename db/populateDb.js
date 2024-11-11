require('dotenv').config();  
const { Client } = require('pg');  

// Get the database connection URL from environment variables
const connectionString = process.env.DATABASE_URL;

// Initialize the client
const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false, 
    },
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Successfully connected to the database!');

    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity INT DEFAULT 0
      );
    `);
    console.log('Inventory table created (if not already exists)');

    const insertQuery = `
      INSERT INTO inventory (name, description, quantity)
      VALUES
        ('Apple', 'Fresh red apple', 100),
        ('Banana', 'Ripe yellow banana', 150),
        ('Orange', 'Juicy orange', 120),
        ('Laptop', '13-inch laptop', 50),
        ('Keyboard', 'Mechanical keyboard', 75)
      ON CONFLICT (name) DO NOTHING;  // Avoid duplicates if running the script multiple times
    `;
    await client.query(insertQuery);
    console.log('Generic data inserted into inventory table');

  } catch (err) {
    console.error('Error during database seeding:', err.stack);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

seedDatabase();
