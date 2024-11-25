const { ApiError } = require('../utils/ApiError.js');
const { ApiResponse } = require('../utils/ApiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { Poll } = require('../models/poll.models.js');

const getPollById = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  // Find the poll by its ID
  let poll = await Poll.findById(pollId);

  // If the poll does not exist, throw an error
  if (!poll) {
    throw new ApiError(404, 'Poll not found');
  }

  // Check ownership of the poll
  if (poll.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, 'Unauthorized access to poll');
  }

  // Modify the options field to include vote count
  const updatedPoll = {
    ...poll.toObject(),
    options: poll.options.map((option) => {
      // Calculate the number of votes for each option
      const voteCount = (poll.votes || []).filter((vote) => {
        return vote.toString() === option._id.toString();
      }).length;

      return {
        _id: option._id,
        label: option.label,
        votes: voteCount, // Store the actual vote count
      };
    }),
  };

  // Return the updated poll
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPoll, 'Poll retrieved successfully'));
});

const createPoll = asyncHandler(async (req, res) => {
  const { title, options } = req.body;
  const owner = req.user._id;

  // Map over the options and create the option documents using the schema
  const newOptions = options.map((option) => {
    return {
      label: option,
    };
  });

  // Create the new poll with the provided title, options, and owner
  const poll = new Poll({
    title,
    options: newOptions,
    owner,
  });

  // Save the poll
  await poll.save();

  // Return the response with the created poll
  return res
    .status(201)
    .json(new ApiResponse(201, poll, 'Poll created successfully'));
});

const deletePoll = asyncHandler(async (req, res) => {
  const { pollId } = req.params;
  const owner = req.user._id;

  // Find the poll by ID and check if the current user is the owner
  const poll = await Poll.findOne({ _id: pollId, owner });

  // If the poll does not exist or the user is not the owner, throw an error
  if (!poll) {
    throw new ApiError(
      404,
      'Poll not found or you are not authorized to delete it'
    );
  }

  // Delete the poll
  await poll.deleteOne();

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Poll deleted successfully'));
});

const getMyPolls = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  // Find all polls created by the current user
  let polls = await Poll.find({ owner });

  // Return the list of polls
  return res
    .status(200)
    .json(new ApiResponse(200, polls, 'Polls retrieved successfully'));
});

const addVote = asyncHandler(async (req, res) => {
  const { pollId } = req.params;
  const { optionId } = req.body;

  if (!optionId) {
    throw new ApiError(400, 'Option ID is required');
  }

  // Find the poll by ID and check if the user has already voted
  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw new ApiError(404, 'Poll not found');
  }

  // Add the user's vote to the poll
  poll.votes.push(optionId);
  await poll.save();

  // Return the updated poll with the new vote count
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Vote added successfully'));
});

module.exports = { createPoll, deletePoll, getMyPolls, getPollById, addVote };
