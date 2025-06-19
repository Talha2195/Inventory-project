const path = require("path")
const sqlite3 = require("sqlite3").verbose()

const dbPath = path.resolve(__dirname, "db", "mydb.sqlite")
console.log("Trying to connect to:", dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open DB:", err.message)
  } else {
    console.log("Successfully connected to DB")
  }
})

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve(this)
    })
  })
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

async function getAllItems() {
  const sql = `
    SELECT 
      games.id,
      games.name,
      games.description,
      developers.name AS developer_name,
      genres.name AS genre_name
    FROM games
    LEFT JOIN developers ON games.developer_id = developers.id
    LEFT JOIN genres ON games.genre_id = genres.id
    ORDER BY games.name;
  `
  return await allAsync(sql)
}

async function searchForItem(name) {
  const sql = `
    SELECT 
      games.id,
      games.name,
      games.description,
      developers.name AS developer_name,
      genres.name AS genre_name
    FROM games
    LEFT JOIN developers ON games.developer_id = developers.id
    LEFT JOIN genres ON games.genre_id = genres.id
    WHERE games.name LIKE ? COLLATE NOCASE OR developers.name LIKE ? COLLATE NOCASE
    ORDER BY games.name;
  `
  const param = `%${name}%`
  return await allAsync(sql, [param, param])
}

async function addGame(name, description, developerName, genreName) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION")

      db.get(
        "SELECT id FROM developers WHERE name = ?",
        [developerName],
        (err, devRow) => {
          if (err) return reject(err)
          const insertDeveloper = (cb) => {
            db.run(
              "INSERT INTO developers (name) VALUES (?)",
              [developerName],
              function (err2) {
                if (err2) return reject(err2)
                cb(this.lastID)
              }
            )
          }

          if (devRow) {
            insertGame(devRow.id)
          } else {
            insertDeveloper(insertGame)
          }

          function insertGame(developerId) {
            // Get or insert genre
            db.get(
              "SELECT id FROM genres WHERE name = ?",
              [genreName],
              (err3, genreRow) => {
                if (err3) return reject(err3)
                const insertGenre = (cb) => {
                  db.run(
                    "INSERT INTO genres (name) VALUES (?)",
                    [genreName],
                    function (err4) {
                      if (err4) return reject(err4)
                      cb(this.lastID)
                    }
                  )
                }

                if (genreRow) {
                  insertNewGame(developerId, genreRow.id)
                } else {
                  insertGenre((genreId) => insertNewGame(developerId, genreId))
                }

                function insertNewGame(developerId, genreId) {
                  db.run(
                    "INSERT INTO games (name, description, developer_id, genre_id) VALUES (?, ?, ?, ?)",
                    [name, description, developerId, genreId],
                    function (err5) {
                      if (err5) return reject(err5)
                      db.run("COMMIT")
                      resolve({ success: true, gameId: this.lastID })
                    }
                  )
                }
              }
            )
          }
        }
      )
    })
  })
}

async function deleteGame(gameId) {
  const sql = "DELETE FROM games WHERE id = ?"
  const result = await runAsync(sql, [gameId])
  return { success: result.changes > 0 }
}

async function getGameById(id) {
  const sql = `
    SELECT games.id, games.name, games.description,
      developers.name AS developer_name,
      genres.name AS genre_name,
      games.developer_id,
      games.genre_id
    FROM games
    LEFT JOIN developers ON games.developer_id = developers.id
    LEFT JOIN genres ON games.genre_id = genres.id
    WHERE games.id = ?;
  `
  return await getAsync(sql, [id])
}

async function updateGame(id, name, description, developerId, genreId) {
  const sql = `
    UPDATE games
    SET name = ?, description = ?, developer_id = ?, genre_id = ?
    WHERE id = ?;
  `
  const result = await runAsync(sql, [
    name,
    description,
    developerId,
    genreId,
    id,
  ])
  return result.changes > 0
}

async function getGenresAndDevelopers() {
  const sql = `
    SELECT 'genre' AS type, name AS name FROM genres
    UNION
    SELECT 'developer' AS type, name AS name FROM developers;
  `
  const rows = await allAsync(sql)
  return rows.map((row) => {
    if (row.type === "genre") return { genre: row.name }
    if (row.type === "developer") return { developer: row.name }
  })
}

async function getGamesByGenres(selectedGenres) {
  // Build placeholders ?,?,? for the IN clause
  const placeholders = selectedGenres.map(() => "?").join(", ")
  const sql = `
    SELECT 
      games.id,
      games.name,
      games.description,
      developers.name AS developer_name,
      genres.name AS genre_name
    FROM games
    LEFT JOIN developers ON games.developer_id = developers.id
    LEFT JOIN genres ON games.genre_id = genres.id
    WHERE genres.name IN (${placeholders})
    ORDER BY games.name;
  `
  return await allAsync(sql, selectedGenres)
}

module.exports = {
  getAllItems,
  searchForItem,
  addGame,
  deleteGame,
  getGameById,
  updateGame,
  getGenresAndDevelopers,
  getGamesByGenres,
}
