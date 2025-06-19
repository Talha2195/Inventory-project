const db = require("../database/queries")
const { validationResult } = require("express-validator")

async function inventoryItemsGet(req, res) {
  try {
    const checks = await db.getGenresAndDevelopers()
    const listOfItems = await db.getAllItems()
    res.render("index", {
      items: listOfItems,
      filters: checks,
      errors: [],
      searchTerm: "",
    })
  } catch (error) {
    console.error("Error fetching items:", error)
    res.status(500).send("Error fetching items from the database")
  }
}

async function displayAddPage(req, res) {
  try {
    res.render("addGame", {
      errors: [],
    })
  } catch (error) {
    console.error("Could not load Add game page", error)
    res.status(500).send("Error fetching addGame page")
  }
}

async function namesSearchGet(req, res) {
  const errors = validationResult(req)
  const errorMessages = errors.isEmpty() ? [] : errors.array()
  const { searchTerm } = req.query
  let listOfItems
  const checks = await db.getGenresAndDevelopers()
  if (errorMessages.length > 0) {
    console.log("Validation Errors:", errorMessages)
    listOfItems = await db.getAllItems()
  } else {
    if (!searchTerm || searchTerm.trim() === "") {
      listOfItems = await db.getAllItems()
    } else {
      listOfItems = await db.searchForItem(searchTerm)
    }
  }
  res.render("index", {
    errors: errorMessages,
    filters: checks,
    items: listOfItems,
    searchTerm: searchTerm || "",
  })
}

async function addNewGame(req, res) {
  const { gameName, description, developer, genre } = req.body
  if (!gameName || !description || !developer || !genre) {
    console.log(gameName, description, developer, genre)
    return res.status(400).send("Missing required fields")
  }
  try {
    const result = await db.addGame(gameName, description, developer, genre)
    if (result.success) {
      res.redirect("/")
    } else {
      res.status(500).send("Error adding new game")
    }
  } catch (error) {
    console.error("Error in addGameController:", error)
    res.status(500).send(`Error adding new game: ${error.message}`)
  }
}

async function deleteGame(req, res) {
  const { id } = req.params
  try {
    const result = await db.deleteGame(id)
    if (result.success) {
      res.redirect("/")
    } else {
      res.status(404).send(result.message)
    }
  } catch (err) {
    res.status(500).send("Error deleting game")
  }
}

async function displayEdits(req, res) {
  const { id } = req.params
  try {
    const game = await db.getGameById(id)
    if (!game) {
      return res.status(404).send("Game not found")
    }
    res.render("updateGame", { game })
  } catch (err) {
    console.error("Error fetching game data for editing:", err.stack)
    res.status(500).send("Error fetching game data.")
  }
}

async function updateGame(req, res) {
  const { id } = req.params
  const { name, description, developerId, genreId } = req.body
  try {
    const success = await db.updateGame(
      id,
      name,
      description,
      developerId,
      genreId
    )
    if (success) {
      res.redirect("/")
    } else {
      res.status(404).send("Game not found or no changes made.")
    }
  } catch (err) {
    console.error("Error updating game:", err.stack)
    res.status(500).send("Error updating game.")
  }
}

async function filterGame(req, res) {
  const selectedGenres = Object.keys(req.query).map((key) =>
    key.replace("genre_", "")
  )
  if (selectedGenres.length === 0) {
    return res.send("No genres selected")
  }

  try {
    const filteredGames = await db.getGamesByGenres(selectedGenres)
    const checks = await db.getGenresAndDevelopers()
    res.render("filteredResult", {
      items: filteredGames,
      filters: checks,
      errors: [],
      searchTerm: "",
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    res.status(500).send("Server Error")
  }
}

module.exports = {
  inventoryItemsGet,
  namesSearchGet,
  addNewGame,
  displayAddPage,
  deleteGame,
  displayEdits,
  updateGame,
  filterGame,
}
