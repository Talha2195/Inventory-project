require('dotenv').config(); 
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const express = require("express")
const app = express()
const inventoryRouter = require("./routes/inventoryRoutes")

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use("/", inventoryRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`))