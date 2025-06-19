const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const fs = require("fs")

const dbPath = path.join(__dirname, "db", "mydb.sqlite")
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error("Failed to connect to SQLite DB", err)
  console.log("Connected to SQLite database.")
})

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS games`)
  db.run(`DROP TABLE IF EXISTS developers`)
  db.run(`DROP TABLE IF EXISTS genres`)

  db.run(`
    CREATE TABLE developers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `)

  db.run(`
    CREATE TABLE genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `)

  db.run(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      quantity INTEGER DEFAULT 0,
      developer_id INTEGER,
      genre_id INTEGER,
      FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE SET NULL,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL
    );
  `)

  const developers = [
    ["Bungie", "A developer known for Destiny and Halo."],
    ["Nintendo", "A developer famous for Mario, Zelda, and other franchises."],
    ["CD Projekt Red", "Known for The Witcher series and Cyberpunk 2077."],
    ["Valve", "Creator of Half-Life and Portal."],
    [
      "Rockstar Games",
      "Developer behind the Grand Theft Auto and Red Dead Redemption series.",
    ],
    ["Bethesda", "Famous for Skyrim and Fallout."],
    ["Ubisoft", "Known for Assassins Creed and Far Cry."],
    ["Electronic Arts", "A major publisher of sports and action games."],
  ]

  const genres = [
    ["Action", "Fast-paced games focused on action sequences."],
    ["Adventure", "Games that focus on exploration and puzzle-solving."],
    ["RPG", "Role-playing games with immersive storytelling."],
    ["Strategy", "Games that require strategic thinking and planning."],
    ["Shooter", "Games focused on combat with firearms."],
  ]

  const insertDev = db.prepare(
    `INSERT INTO developers (name, description) VALUES (?, ?)`
  )
  developers.forEach(([name, desc]) => insertDev.run(name, desc))
  insertDev.finalize()

  const insertGenre = db.prepare(
    `INSERT INTO genres (name, description) VALUES (?, ?)`
  )
  genres.forEach(([name, desc]) => insertGenre.run(name, desc))
  insertGenre.finalize()

  setTimeout(() => {
    const insertGame = db.prepare(`
      INSERT INTO games (name, description, quantity, developer_id, genre_id)
      VALUES (?, ?, ?, 
        (SELECT id FROM developers WHERE name = ?), 
        (SELECT id FROM genres WHERE name = ?))
    `)

    const games = [
      [
        "Destiny 2",
        "A multiplayer first-person shooter with RPG elements.",
        40,
        "Bungie",
        "Shooter",
      ],
      [
        "Halo: Combat Evolved",
        "A first-person shooter and the start of the iconic Halo franchise.",
        50,
        "Bungie",
        "Shooter",
      ],
      [
        "The Legend of Zelda: Breath of the Wild",
        "An open-world action-adventure game that redefines the Zelda franchise.",
        45,
        "Nintendo",
        "Adventure",
      ],
      [
        "Super Mario Odyssey",
        "A 3D platformer game where Mario explores different worlds to save Princess Peach.",
        55,
        "Nintendo",
        "Action",
      ],
      [
        "The Witcher 3: Wild Hunt",
        "An action RPG set in a dark fantasy world, following Geralt of Rivia on his journey.",
        25,
        "CD Projekt Red",
        "RPG",
      ],
      [
        "Cyberpunk 2077",
        "An open-world RPG set in a futuristic dystopian world, full of choices and consequences.",
        20,
        "CD Projekt Red",
        "RPG",
      ],
      [
        "Half-Life: Alyx",
        "A VR first-person shooter set in the Half-Life universe.",
        30,
        "Valve",
        "Shooter",
      ],
      [
        "Red Dead Redemption 2",
        "An open-world western action-adventure game, known for its story and world-building.",
        60,
        "Rockstar Games",
        "Adventure",
      ],
      [
        "Grand Theft Auto V",
        "A crime drama action-adventure game set in a fictional city, full of heists and exploration.",
        65,
        "Rockstar Games",
        "Action",
      ],
      [
        "Skyrim",
        "A fantasy RPG set in a rich open world, where you become the Dragonborn.",
        50,
        "Bethesda",
        "RPG",
      ],
      [
        "Fallout 4",
        "A post-apocalyptic RPG where you must survive in a world ravaged by nuclear war.",
        30,
        "Bethesda",
        "RPG",
      ],
      [
        "Assassin's Creed: Odyssey",
        "An open-world action RPG set in Ancient Greece.",
        45,
        "Ubisoft",
        "Adventure",
      ],
      [
        "Far Cry 5",
        "An open-world first-person shooter set in Montana.",
        40,
        "Ubisoft",
        "Shooter",
      ],
      [
        "FIFA 22",
        "A football simulation video game.",
        60,
        "Electronic Arts",
        "Action",
      ],
    ]

    games.forEach(([name, desc, qty, dev, genre]) =>
      insertGame.run(name, desc, qty, dev, genre)
    )
    insertGame.finalize()

    db.close(() => {
      console.log("Database seeded and closed.")
    })
  }, 100)
})
