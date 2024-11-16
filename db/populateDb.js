require("dotenv").config();
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to the database!");

    await client.query('DROP TABLE IF EXISTS games, developers, genres CASCADE;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS developers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log("Developers table created (if not already exists)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log("Genres table created (if not already exists)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        quantity INT DEFAULT 0,
        developer_id INT REFERENCES developers(id) ON DELETE SET NULL,
        genre_id INT REFERENCES genres(id) ON DELETE SET NULL
      );
    `);
    console.log("Games table created (with genre_id)");

    const insertDevelopersQuery = `
      INSERT INTO developers (name, description)
      VALUES
        ('Bungie', 'A developer known for Destiny and Halo.'),
        ('Nintendo', 'A developer famous for Mario, Zelda, and other franchises.'),
        ('CD Projekt Red', 'Known for The Witcher series and Cyberpunk 2077.'),
        ('Valve', 'Creator of Half-Life and Portal.'),
        ('Rockstar Games', 'Developer behind the Grand Theft Auto and Red Dead Redemption series.'),
        ('Bethesda', 'Famous for Skyrim and Fallout.'),
        ('Ubisoft', 'Known for Assassins Creed and Far Cry.'),
        ('Electronic Arts', 'A major publisher of sports and action games.');
    `;
    await client.query(insertDevelopersQuery);
    console.log("Developers inserted.");

    const insertGenresQuery = `
      INSERT INTO genres (name, description)
      VALUES
        ('Action', 'Fast-paced games focused on action sequences.'),
        ('Adventure', 'Games that focus on exploration and puzzle-solving.'),
        ('RPG', 'Role-playing games with immersive storytelling.'),
        ('Strategy', 'Games that require strategic thinking and planning.'),
        ('Shooter', 'Games focused on combat with firearms.');
    `;
    await client.query(insertGenresQuery);
    console.log("Genres inserted.");

    const insertGamesQuery = `
      INSERT INTO games (name, description, quantity, developer_id, genre_id)
      VALUES
        ('Destiny 2', 'A multiplayer first-person shooter with RPG elements.', 40, (SELECT id FROM developers WHERE name = 'Bungie'), (SELECT id FROM genres WHERE name = 'Shooter')),
        ('Halo: Combat Evolved', 'A first-person shooter and the start of the iconic Halo franchise.', 50, (SELECT id FROM developers WHERE name = 'Bungie'), (SELECT id FROM genres WHERE name = 'Shooter')),
        ('The Legend of Zelda: Breath of the Wild', 'An open-world action-adventure game that redefines the Zelda franchise.', 45, (SELECT id FROM developers WHERE name = 'Nintendo'), (SELECT id FROM genres WHERE name = 'Adventure')),
        ('Super Mario Odyssey', 'A 3D platformer game where Mario explores different worlds to save Princess Peach.', 55, (SELECT id FROM developers WHERE name = 'Nintendo'), (SELECT id FROM genres WHERE name = 'Action')),
        ('The Witcher 3: Wild Hunt', 'An action RPG set in a dark fantasy world, following Geralt of Rivia on his journey.', 25, (SELECT id FROM developers WHERE name = 'CD Projekt Red'), (SELECT id FROM genres WHERE name = 'RPG')),
        ('Cyberpunk 2077', 'An open-world RPG set in a futuristic dystopian world, full of choices and consequences.', 20, (SELECT id FROM developers WHERE name = 'CD Projekt Red'), (SELECT id FROM genres WHERE name = 'RPG')),
        ('Half-Life: Alyx', 'A VR first-person shooter set in the Half-Life universe.', 30, (SELECT id FROM developers WHERE name = 'Valve'), (SELECT id FROM genres WHERE name = 'Shooter')),
        ('Red Dead Redemption 2', 'An open-world western action-adventure game, known for its story and world-building.', 60, (SELECT id FROM developers WHERE name = 'Rockstar Games'), (SELECT id FROM genres WHERE name = 'Adventure')),
        ('Grand Theft Auto V', 'A crime drama action-adventure game set in a fictional city, full of heists and exploration.', 65, (SELECT id FROM developers WHERE name = 'Rockstar Games'), (SELECT id FROM genres WHERE name = 'Action')),
        ('Skyrim', 'A fantasy RPG set in a rich open world, where you become the Dragonborn.', 50, (SELECT id FROM developers WHERE name = 'Bethesda'), (SELECT id FROM genres WHERE name = 'RPG')),
        ('Fallout 4', 'A post-apocalyptic RPG where you must survive in a world ravaged by nuclear war.', 30, (SELECT id FROM developers WHERE name = 'Bethesda'), (SELECT id FROM genres WHERE name = 'RPG')),
        ('Assassin''s Creed: Odyssey', 'An open-world action RPG set in Ancient Greece, part of the Assassin''s Creed series.', 45, (SELECT id FROM developers WHERE name = 'Ubisoft'), (SELECT id FROM genres WHERE name = 'Adventure')),
        ('Far Cry 5', 'An open-world first-person shooter set in a rural Montana town taken over by a doomsday cult.', 40, (SELECT id FROM developers WHERE name = 'Ubisoft'), (SELECT id FROM genres WHERE name = 'Shooter')),
        ('FIFA 22', 'A football simulation video game that brings the excitement of the sport to life.', 60, (SELECT id FROM developers WHERE name = 'Electronic Arts'), (SELECT id FROM genres WHERE name = 'Action'))
      ON CONFLICT (name) DO NOTHING;
    `;
    await client.query(insertGamesQuery);
    console.log("Games inserted.");

  } catch (err) {
    console.error("Error during database seeding:", err.stack);
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
}

module.exports = {
  seedDatabase
};
