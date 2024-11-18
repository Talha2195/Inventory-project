const { body } = require('express-validator');

const validateAddGame = [
    body('gameName')
        .trim()
        .notEmpty().withMessage('Game name is required.')
        .isLength({ max: 100 }).withMessage('Game name must be less than 100 characters.'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required.')
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),

    body('developer')
        .trim()
        .notEmpty().withMessage('Developer is required.')
        .isLength({ max: 100 }).withMessage('Developer name must be less than 100 characters.'),
    
    body('genre')
        .trim()
        .notEmpty().withMessage('Genre is required.')
        .isLength({ max: 50 }).withMessage('Genre must be less than 50 characters.')
];

module.exports = {
    validateAddGame
};
