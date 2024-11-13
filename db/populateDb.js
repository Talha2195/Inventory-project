require("dotenv").config()
const { Client } = require("pg")

const connectionString = process.env.DATABASE_URL

const client = new Client({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedDatabase() {
  try {
    await client.connect()
    console.log("Successfully connected to the database!")

    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        quantity INT DEFAULT 0
      );
    `);
    console.log("Games table created (if not already exists)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log("Genres table created (if not already exists)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS developers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log("Developers table created (if not already exists)");

    await client.query(`
    CREATE TABLE IF NOT EXISTS game_genre (
      game_id INT REFERENCES games(id) ON DELETE CASCADE,
      genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
      PRIMARY KEY (game_id, genre_id)
    );
  `);
  console.log("Game-Genre join table created (if not already exists)");

  await client.query(`
  CREATE TABLE IF NOT EXISTS game_developer (
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    developer_id INT REFERENCES developers(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, developer_id)
  );
` );
  console.log("Game-Developer join table created (if not already exists)");

  const insertGamesQuery = `
  INSERT INTO games (name, description, quantity)
  VALUES
    ('Minecraft', 'A sandbox game about building and exploring.', 4),
    ('Monster Hunter', 'A game where you hunt monsters.', 10),
    ('Balataro', 'An adventure game in an open world.', 20),
    ('Outer Wilds', 'A space exploration game.', 50),
    ('Assassin\'s Creed', 'A game about historical assassins.', 75)
  ON CONFLICT (name) DO NOTHING; 
  `;
  await client.query(insertGamesQuery);
  console.log("Generic data inserted into games table");

  const insertGenresQuery = `
  INSERT INTO genres (name, description)
  VALUES
    ('Action', 'Fast-paced games focused on action sequences.'),
    ('Adventure', 'Games that focus on exploration and puzzle solving.'),
    ('RPG', 'Role-playing games with immersive storytelling.'),
    ('Strategy', 'Games that emphasize strategic thinking and planning.'),
    ('Shooter', 'Games focused on combat involving firearms.')
  ON CONFLICT (name) DO NOTHING;  
  `;
  await client.query(insertGenresQuery);
  console.log("Generic data inserted into genres table");

  const insertDevelopersQuery = `
  INSERT INTO developers (name, description)
  VALUES
    ('Naughty Dog', 'A developer known for action-adventure games like Uncharted and Last of Us.'),
    ('Bethesda', 'Famous for creating open-world RPGs like Skyrim and Fallout.'),
    ('Ubisoft', 'Known for the Assassin\'s Creed series and other open-world games.'),
    ('CD Projekt Red', 'Developer of The Witcher series and Cyberpunk 2077.'),
    ('Rockstar Games', 'Famous for the Grand Theft Auto and Red Dead Redemption series.')
  ON CONFLICT (name) DO NOTHING;  
`;
  await client.query(insertDevelopersQuery);
  console.log("Generic data inserted into developers table");

  await client.query(`
  INSERT INTO game_genre (game_id, genre_id)
  VALUES
    ((SELECT id FROM games WHERE name = 'Minecraft'), (SELECT id FROM genres WHERE name = 'Adventure')),
    ((SELECT id FROM games WHERE name = 'Monster Hunter'), (SELECT id FROM genres WHERE name = 'Action')),
    ((SELECT id FROM games WHERE name = 'Assassin\'s Creed'), (SELECT id FROM genres WHERE name = 'Action')),
    ((SELECT id FROM games WHERE name = 'Outer Wilds'), (SELECT id FROM genres WHERE name = 'Adventure')),
    ((SELECT id FROM games WHERE name = 'Assassin\'s Creed'), (SELECT id FROM genres WHERE name = 'RPG'))
`);
  console.log("Games associated with genres");

  await client.query(`
    INSERT INTO game_developer (game_id, developer_id)
    VALUES
      ((SELECT id FROM games WHERE name = 'Minecraft'), (SELECT id FROM developers WHERE name = 'Naughty Dog')),
      ((SELECT id FROM games WHERE name = 'Monster Hunter'), (SELECT id FROM developers WHERE name = 'Bethesda')),
      ((SELECT id FROM games WHERE name = 'Assassin\'s Creed'), (SELECT id FROM developers WHERE name = 'Ubisoft'))
  `);
  console.log("Games associated with developers");


  } catch (err) {
    console.error("Error during database seeding:", err.stack)
  } finally {
    await client.end()
    console.log("Database connection closed")
  }
}

seedDatabase()
