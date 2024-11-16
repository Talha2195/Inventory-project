require('dotenv').config();
const express = require('express');
const app = express();
const inventoryRouter = require('./routes/inventoryRoutes');
const { seedDatabase } = require('./db/populateDb');

seedDatabase();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/', inventoryRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
