const { body } = require('express-validator');

const createPollValidator = () => {
  return [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title should be a string'),

    body('options')
      .isArray()
      .withMessage('Options should be an array')
      .notEmpty()
      .withMessage('Options cannot be empty')
      .custom((value) => {
        // Ensure that the number of options is between 1 and 4
        if (value.length < 1 || value.length > 4) {
          throw new Error('Poll must have between 1 and 4 options');
        }
        // Ensure that each option is a string
        if (!value.every((option) => typeof option === 'string')) {
          throw new Error('Each option must be a string');
        }
        return true; // Return true after validation
      }),
  ];
};

module.exports = {
  createPollValidator,
};
