const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },
});

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'Poll must have at least one option',
      },
    },
    votes: {
      type: [mongoose.Schema.Types.ObjectId], // Array of option IDs (user votes)
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Method to get the vote count for each option

const Poll = mongoose.model('Poll', pollSchema);
module.exports = {
  Poll,
};
