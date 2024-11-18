const { query } = require("express-validator");

const validateSearchTerm = [
    query('searchTerm')
        .trim()
        .isLength({ min: 1 }).withMessage('Search term cannot be empty.')
        .isLength({ max: 100 }).withMessage('Search term must be less than 100 characters.')
        .matches(/^[A-Za-z0-9\s]+$/).withMessage('Search term must only contain letters, numbers, and spaces.')
        .bail()
];

module.exports = {
    validateSearchTerm,
}